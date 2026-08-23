import fs from "node:fs";
import path from "node:path";

/* -----------------------------------------------------------------------------
 * Reads the REAL token values out of globals.css at build time.
 *
 * The styleguide could have hard-coded a copy of the palette, and it would have
 * drifted from the stylesheet within a week. Instead it parses the source of
 * truth, so an audit printed on /styleguide is an audit of what actually
 * ships. If a value changes in globals.css, the contrast table changes with it
 * and a regression shows up as a red row rather than a stale comment.
 *
 * Server-only. Runs once, at build time, during static generation.
 * -------------------------------------------------------------------------- */

const CSS_PATH = path.join(process.cwd(), "src", "app", "globals.css");

let cache: Map<string, string> | null = null;

function read(): Map<string, string> {
  if (cache) return cache;
  const src = fs.readFileSync(CSS_PATH, "utf8");
  const map = new Map<string, string>();
  // `--name: value;` — stop at the first `;` or `/*`, keep the last declaration
  // (later blocks legitimately override earlier ones).
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+?)\s*(?:;|\/\*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim());
  }
  cache = map;
  return map;
}

/** Raw declared value, e.g. `token("--color-gold-500")` -> `"#b8a57a"`. */
export function token(name: string): string {
  return read().get(name) ?? "";
}

/**
 * Resolves one level of `var(--x)` indirection so `--accent-gold` reports the
 * hex it points at rather than the string "var(--color-gold-700)".
 */
export function resolve(name: string, depth = 6): string {
  let v = token(name);
  for (let i = 0; i < depth; i++) {
    const m = v.match(/^var\((--[a-z0-9-]+)\)$/i);
    if (!m) break;
    v = token(m[1]);
  }
  return v;
}
