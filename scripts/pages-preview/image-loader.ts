/* =============================================================================
 * IMAGE LOADER — GitHub Pages only. Prepends the basePath that `next/image`
 * does not.
 *
 * ⛔ THE BUG THIS FIXES, and why it is not obvious. With `output: "export"` a
 * static host has no optimiser, so the usual answer is `images.unoptimized`.
 * That flag makes Next's DEFAULT loader hand back `src` completely untouched —
 * and `basePath` is applied by the OPTIMISER URL, not by the raw src. So every
 * image on the deployed preview asked for
 *
 *     /images/hero.webp        → 404
 *
 * while the file sat one directory lower, at
 *
 *     /ankaa/images/hero.webp  → 200
 *
 * The page still loaded — HTML, CSS and fonts are emitted with the prefix — so
 * it looked "deployed but bare", which is the confusing part. Only `next/image`
 * was affected.
 *
 * ⚠️ VERIFY THE REFERENCE, NOT THE FILE. This shipped because the check was
 * `curl /ankaa/images/plan-d-66-model.webp` → 200, which proves the file
 * exists and proves nothing about what the page asks for. The check that
 * catches it reads the `src` out of the served HTML and requests THAT.
 *
 * A custom loader replaces `unoptimized` — export accepts either, and this one
 * also fixes the path. `width` and `quality` are ignored on purpose: there is
 * no optimiser to resize anything, so every device gets the original file.
 * That cost is stated in the GITHUB_PAGES block of next.config.ts.
 * ========================================================================== */
/* ⚠️ DECLARED HERE, NOT IMPORTED FROM next.config.ts. A loaderFile is bundled
   into the client build; importing the config would pull the whole thing
   (headers, CSP, Node built-ins) into the browser bundle. Two literals that
   must agree — if you change one, change the other. */
const PAGES_BASE_PATH = "/ankaa";

export default function pagesImageLoader({ src }: { src: string }): string {
  /* Absolute URLs and data: URIs are already complete — never prefix them. */
  if (!src.startsWith("/")) return src;
  /* Idempotent: a src that already carries the prefix is left alone. */
  if (src.startsWith(`${PAGES_BASE_PATH}/`)) return src;
  return `${PAGES_BASE_PATH}${src}`;
}
