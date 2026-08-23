import {
  ANKAA_BLADE_PATH,
  ANKAA_MARK_VIEWBOX,
  ANKAA_PHOENIX_PATH,
  ANKAA_TOWERS_PATH,
} from "@/components/brand/ankaa-mark";

/* =============================================================================
 * THE MARK AS A STANDALONE SVG — for `next/og`.
 *
 * `_brand/` has a leading underscore, so Next excludes it from routing: this is
 * a private folder, not a route segment.
 *
 * WHY A STRING AND NOT <AnkaaMark />
 * Satori (the renderer behind `ImageResponse`) supports a useful subset of SVG,
 * but the reliable path for artwork is an `<img>` whose src is a data URI. So
 * the icon and the OG card build the same geometry from the SAME exported path
 * constants that <AnkaaMark /> uses — ASTRA's real 0.9917-IoU trace of
 * `public/images/ankaa-mark.png`, not a redraw and not a raster.
 *
 * ⛔ DO NOT hand-edit path data here. There is none: the three `d` strings are
 * imported. If the artwork is ever replaced, re-run ASTRA's tracing tooling and
 * `ankaa-mark.tsx`, the favicon, the apple icon and the OG card all change at
 * once.
 * ========================================================================== */

/**
 * The full mark as an SVG document string, in one flat colour.
 * `fillRule="evenodd"` matters — the phoenix's wing loop encloses its own gap.
 */
export function markSvg(fill: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ANKAA_MARK_VIEWBOX}">`,
    `<g fill="${fill}" fill-rule="evenodd">`,
    `<path d="${ANKAA_PHOENIX_PATH}"/>`,
    `<path d="${ANKAA_BLADE_PATH}"/>`,
    `<path d="${ANKAA_TOWERS_PATH}"/>`,
    `</g></svg>`,
  ].join("");
}

/** The same, as a data URI ready for `<img src>` inside an ImageResponse. */
export function markDataUri(fill: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(markSvg(fill), "utf8").toString("base64")}`;
}

/* -----------------------------------------------------------------------------
 * The two brand colours the generated images use. Literals on purpose: an
 * ImageResponse has no stylesheet, so it cannot read the tokens — these are
 * copied from `globals.css` §1.1 and must not drift from it.
 *   --color-brand-900  #002724   the brand green
 *   --color-gold-500   #b8a57a   the mark's exact sampled fill
 * -------------------------------------------------------------------------- */
export const OG_GREEN = "#002724";
export const OG_GOLD = "#b8a57a";
export const OG_PAPER = "#fbfaf6";
