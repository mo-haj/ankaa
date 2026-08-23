import {
  PLAN_GROUND,
  PLAN_POCHE,
  PLAN_TONE,
} from "@/components/sections/floor-plan-palette";
import { floorPlan } from "@/content/floor-plan.generated";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <PlanPlate> — the drawing, still and silent. Two callers, one construction.
 *
 * =============================================================================
 * IT IS THE SAME GEOMETRY AND THE SAME PALETTE AS THE REAL VIEWER, NOT A
 * PICTURE OF IT.
 * =============================================================================
 * Same `footprint`, same `spaces`, same tones out of `floor-plan-palette.ts` —
 * so a preview can never drift from the drawing it advertises, and there is no
 * exported image to regenerate when the extractor runs again. ⛔ Do not swap
 * this for a PNG to save bytes: `spaces` is ~11KB of path data that gzips to
 * roughly a quarter of that, which is less than one of the thumbnails it would
 * be replaced by, and a raster would need `npm run plan:png` to be remembered
 * on every re-extract. It will not be.
 *
 * ⛔ NO OPENINGS. Door swings and window reveals are 0.75px lines built to
 * survive a zoom; at plate size they are grit and at thumb size they are noise.
 * What survives small is exactly what should — the shape of the floor and where
 * the rooms fall.
 *
 * `dir="ltr"` for the same reason the live viewer carries it: a drawing is a
 * coordinate space, not a text flow, and the geometry is authored left-handed.
 * `aria-hidden` because every caller pairs it with real text — a link name, a
 * caption, or a row of areas — and a decorative SVG announcing itself twice is
 * worse than one that stays quiet.
 *
 * ⚠️ THE PLATE FILLS ITS BOX CORNER TO CORNER, so a caller with a radius must
 * supply its own padding. `rounded-figure` is 24px and bit four corners off the
 * building at 390px — the north-east balcony was visibly clipped — before the
 * band grew an inset for it. ⛔ Put that padding on `className`, never inside
 * `svgClassName`: the frame is an ordinary box and the `<svg>` is a replaced
 * element whose own padding shrinks the viewport instead of the drawing.
 *
 * Server Component, and deliberately so: it is markup and nothing else.
 * -------------------------------------------------------------------------- */

export interface PlanPlateProps {
  /** The frame: ground, radius, border, padding, overflow. */
  className?: string;
  /** The plate inside the frame — a hover transform and nothing else. */
  svgClassName?: string;
}

export function PlanPlate({ className, svgClassName }: PlanPlateProps) {
  return (
    <span
      aria-hidden
      dir="ltr"
      className={cn("block overflow-hidden", className)}
      /* The plan's own paper, not the section's. Everywhere the drawing is
         shown it stands on `PLAN_GROUND` — including on a dark panel, where
         that is the whole point (see the tile in project-detail-panel.tsx). */
      style={{ backgroundColor: PLAN_GROUND }}
    >
      <svg
        viewBox={`0 0 ${floorPlan.width} ${floorPlan.height}`}
        className={cn("block h-full w-full", svgClassName)}
      >
        {/* Poché first, rooms on top: what shows between the rooms IS the
            wall. One filled footprint replaces every hairline the CAD file
            would otherwise ask us to draw. */}
        <path d={floorPlan.footprint} fill={PLAN_POCHE} />
        {floorPlan.spaces.map((space, index) => (
          <path key={index} d={space.d} fill={PLAN_TONE[space.kind]} />
        ))}
      </svg>
    </span>
  );
}
