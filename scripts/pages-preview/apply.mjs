/* =============================================================================
 * PAGES PREVIEW — strip the two server-only features, then let `next build`
 * produce a static export.
 *
 * RUN BY `.github/workflows/deploy-pages.yml` INSIDE THE RUNNER, NEVER BY YOU.
 * It edits and deletes files in `src/`. On a GitHub runner that is a throwaway
 * checkout; in your working tree it is damage. The guard below refuses to run
 * outside CI unless you pass --force, and `git checkout -- src` puts anything
 * back if you do.
 *
 * =============================================================================
 * WHY EACH REMOVAL — both were confirmed by running the build, not assumed
 * =============================================================================
 *   1. @modal + the intercepting route
 *        > Intercepting routes are not supported with static export.
 *      No flag, no partial support. Removing the slot means clicking a project
 *      card performs a normal navigation to `/projects/[slug]`, which already
 *      exists and is already what a shared link or a refresh renders. The
 *      overlay is an enhancement on top of a page that works without it.
 *
 *   2. The enquiry Server Action
 *        > Server Actions are not supported with static export.
 *      Replaced by `contact-form.static.tsx` — read the header there.
 *
 *   3. `await searchParams` on the home page
 *        > Route / with `dynamic = "error"` couldn't be rendered statically
 *        > because it used `await searchParams`.
 *      `?region=` is the projects filter and it is READ ON THE SERVER, which
 *      is what makes a filtered view linkable and shareable — see the comment
 *      in page.tsx that states the cost. Prerendering means there is no server
 *      to read it, so the page renders unfiltered. The region chips hide
 *      themselves on this target (projects.tsx reads the same flag) so nothing
 *      is left on screen that looks clickable and does nothing.
 *
 * ⛔ IF A STEP'S ANCHOR IS NOT FOUND, THIS SCRIPT THROWS AND THE DEPLOY FAILS.
 * That is the point. A "best effort" transform that silently skips a step it no
 * longer recognises would publish a preview missing something nobody checked
 * for, and the failure would surface as a visitor bug weeks later.
 * ========================================================================== */
import { existsSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const rel = (p) => resolve(ROOT, p);

if (!process.env.CI && !process.argv.includes("--force")) {
  console.error(
    "refusing to run outside CI — this deletes files in src/.\n" +
      "If you meant it (to reproduce the Pages build locally), re-run with --force\n" +
      "and restore afterwards with:  git checkout -- src",
  );
  process.exit(1);
}

const step = (n, what) => console.log(`  [${n}/5] ${what}`);

/** Count non-overlapping matches of a sticky-free regex. */
const count = (haystack, re) =>
  (haystack.match(new RegExp(re.source, re.flags.replace("g", "") + "g")) || []).length;

/* ---- 1. the parallel slot, and the intercepting route inside it ---------- */
const modal = rel("src/app/@modal");
if (!existsSync(modal)) throw new Error("src/app/@modal is already gone — has the app changed?");
rmSync(modal, { recursive: true, force: true });
step(1, "removed src/app/@modal/ (parallel slot + intercepting route)");

/* ---- 2. the layout stops receiving a slot that no longer exists ----------
 *
 * ⚠️ ANCHORED WITH REGEXES THAT TOLERATE \r\n, NOT LITERAL "\n" STRINGS. A
 * Linux runner checks this file out with LF and Windows checks the same file
 * out with CRLF, so a "\n" needle matches in CI and silently finds nothing on
 * a developer's machine. The first local run of this script hit exactly that
 * and the count assertion below is what caught it. */
const layoutPath = rel("src/app/layout.tsx");
let layout = readFileSync(layoutPath, "utf8");

const PROPS_RE = /export default function RootLayout\(\{ children, modal \}: LayoutProps<"\/">\) \{/;
const PROPS_TO = 'export default function RootLayout({ children }: LayoutProps<"/">) {';
const SLOT_RE = /\r?\n[ \t]*\{modal\}(?=\r?\n)/;

for (const [re, name] of [[PROPS_RE, "RootLayout signature"], [SLOT_RE, "{modal} render"]]) {
  const n = count(layout, re);
  if (n !== 1) throw new Error(`expected exactly 1 "${name}" in layout.tsx, found ${n}`);
}

layout = layout.replace(PROPS_RE, PROPS_TO).replace(SLOT_RE, "");
writeFileSync(layoutPath, layout, "utf8");
step(2, "patched src/app/layout.tsx (dropped the modal slot)");

/* ---- 3. the Server Action itself ----------------------------------------- */
const actions = rel("src/app/actions");
if (!existsSync(actions)) throw new Error("src/app/actions is already gone — has the app changed?");
rmSync(actions, { recursive: true, force: true });
step(3, "removed src/app/actions/ (the enquiry Server Action)");

/* ---- 4. and its only importer ------------------------------------------- */
const formPath = rel("src/components/sections/contact-form.tsx");
const form = readFileSync(formPath, "utf8");
if (!form.includes('from "@/app/actions/contact"')) {
  throw new Error("contact-form.tsx no longer imports the action — re-check what replaced it");
}
copyFileSync(rel("scripts/pages-preview/contact-form.static.tsx"), formPath);
step(4, "swapped contact-form.tsx for the static placeholder");

/* ---- 5. the home page stops reading a search param it cannot be given ----
 *
 * Located by INDEX, not by regex. The span crosses several lines and the two
 * checkouts disagree about line endings (LF on the runner, CRLF on Windows),
 * which already broke one regex here; `indexOf` on single-line anchors cannot
 * care. Both ends must be found or this throws. */
const pagePath = rel("src/app/page.tsx");
let page = readFileSync(pagePath, "utf8");

const HOME_OPEN = "export default async function HomePage({";
const HOME_LAST = "const activeRegion = Array.isArray(region) ? region[0] : region;";
const USE_FROM = "<Projects region={activeRegion} />";

for (const [needle, name] of [
  [HOME_OPEN, "HomePage signature"],
  [HOME_LAST, "activeRegion assignment"],
  [USE_FROM, "<Projects region>"],
]) {
  const n = page.split(needle).length - 1;
  if (n !== 1) throw new Error(`expected exactly 1 "${name}" in page.tsx, found ${n}`);
}

const from = page.indexOf(HOME_OPEN);
const to = page.indexOf(HOME_LAST, from) + HOME_LAST.length;
if (to <= from) throw new Error("page.tsx: activeRegion appears before the signature");

page =
  page.slice(0, from) +
  "export default function HomePage() {" +
  page.slice(to);
page = page.replace(USE_FROM, "<Projects />");
writeFileSync(pagePath, page, "utf8");
step(5, "removed `await searchParams` from src/app/page.tsx");

console.log("pages-preview: source prepared for `output: export`.");
