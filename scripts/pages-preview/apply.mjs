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

const step = (n, what) => console.log(`  [${n}/4] ${what}`);

/* ---- 1. the parallel slot, and the intercepting route inside it ---------- */
const modal = rel("src/app/@modal");
if (!existsSync(modal)) throw new Error("src/app/@modal is already gone — has the app changed?");
rmSync(modal, { recursive: true, force: true });
step(1, "removed src/app/@modal/ (parallel slot + intercepting route)");

/* ---- 2. the layout stops receiving a slot that no longer exists ---------- */
const layoutPath = rel("src/app/layout.tsx");
let layout = readFileSync(layoutPath, "utf8");
const PROPS_FROM = 'export default function RootLayout({ children, modal }: LayoutProps<"/">) {';
const PROPS_TO = 'export default function RootLayout({ children }: LayoutProps<"/">) {';
const SLOT_FROM = "          {children}\n          {modal}\n";
const SLOT_TO = "          {children}\n";
for (const [needle, name] of [[PROPS_FROM, "RootLayout signature"], [SLOT_FROM, "{modal} render"]]) {
  const n = layout.split(needle).length - 1;
  if (n !== 1) throw new Error(`expected exactly 1 "${name}" in layout.tsx, found ${n}`);
}
layout = layout.replace(PROPS_FROM, PROPS_TO).replace(SLOT_FROM, SLOT_TO);
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

console.log("pages-preview: source prepared for `output: export`.");
