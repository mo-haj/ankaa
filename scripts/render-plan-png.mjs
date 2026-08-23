/* =============================================================================
 * EXPORT — the coloured floor plate as a flat PNG.
 *
 *   npm run plan:png                    -> exports/floor-plan-3000.png
 *   npm run plan:png -- some/other.png  -> anywhere else
 *
 * WHY THIS EXISTS
 * ---------------
 * The plan on the site is an SVG inside a React component, which is the right
 * thing for a page and useless as an input to anything else. This writes the
 * same drawing as one raster: a CONTROL IMAGE, to be handed to an image model
 * as the geometry an interior render has to obey, and generally the thing to
 * attach when somebody asks for "the floor plan" as a file.
 *
 * |X| IT IS THE SAME DRAWING, NOT A SECOND ONE, AND THAT IS ENFORCED BY THE
 * IMPORTS. Geometry comes from `floor-plan.generated.ts` and every colour from
 * `floor-plan-palette.ts` — the two modules the page itself renders from. There
 * is no hex literal and no coordinate in this file. If the page changes, this
 * changes with it; if somebody hardcodes a colour here, the export starts
 * lying about what the site shows.
 *
 * WHAT IS DELIBERATELY NOT IN IT
 * ------------------------------
 * No room labels, no area callouts, no compass, no selection state, no green.
 * A control image is read by a machine looking for edges and regions, and by a
 * person who wants the drawing; both are served by geometry alone. The words
 * belong to the page, which has a caption, a list and a language.
 *
 * |X| 1 PIXEL = 1 CENTIMETRE AT THE DEFAULT WIDTH. The plate is 2997 x 2299 cm
 * and the export is 3000 px wide, so the scale is 1.001 - near enough that a
 * measurement taken off this image in pixels is a measurement in centimetres.
 * Keep it that way; a rounder number is worth less than that property.
 *
 * NODE: run through `npm run plan:png`, which passes --experimental-strip-types
 * so the two TypeScript modules above can be imported directly. Node prints a
 * MODULE_TYPELESS_PACKAGE_JSON warning doing it; the file is ESM and the
 * warning is noise.
 * ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  PLAN_GROUND,
  PLAN_POCHE,
  PLAN_TONE,
} from "../src/components/sections/floor-plan-palette.ts";
import { floorPlan } from "../src/content/floor-plan.generated.ts";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WIDTH = 3000;

/* Centimetres, so it is 2 px at the export's 1 px per cm. The page uses 0.75
   CSS px with `vectorEffect="non-scaling-stroke"`, which is the right weight
   for a drawing you can zoom and the wrong one for a flat 3000 px raster: a
   sub-pixel arc there disappears into the resample and the door swings go with
   it. Same lines, weighted for the medium. */
const OPENING_STROKE = 2;
const OUT = path.resolve(
  ROOT,
  process.argv[2] ?? path.join("exports", "floor-plan-3000.png"),
);

const { width: W, height: H } = floorPlan;

/* The order is the page's order, and it is the whole technique: the footprint
   is the wall, the rooms are painted over it, the openings are cut back into
   it. Nothing here computes a wall. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${PLAN_GROUND}"/>
<path d="${floorPlan.footprint}" fill="${PLAN_POCHE}"/>
${floorPlan.spaces.map((s) => `<path d="${s.d}" fill="${PLAN_TONE[s.kind]}"/>`).join("\n")}
<g fill="none" stroke="${PLAN_POCHE}" stroke-width="${OPENING_STROKE}">
<path d="${floorPlan.glazing}" opacity="0.55"/>
<path d="${floorPlan.stair}" opacity="0.5"/>
<path d="${floorPlan.doors}" opacity="0.35"/>
</g>
</svg>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg))
  .resize({ width: WIDTH })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const { size } = fs.statSync(OUT);
console.error(
  `wrote ${path.relative(ROOT, OUT)} — ${WIDTH}x${Math.round((WIDTH * H) / W)}px, ` +
    `${(size / 1024).toFixed(0)} KB, from art66.dxf:${floorPlan.block} ` +
    `(${floorPlan.spaces.length} spaces)`,
);
