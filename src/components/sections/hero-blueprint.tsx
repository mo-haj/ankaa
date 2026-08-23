import * as React from "react";

import { AnkaaMark } from "@/components/brand";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <HeroBlueprint> — the line drawing from «من المخطط إلى البيت».
 *
 * =============================================================================
 * NEON REWROTE THIS FILE. READ THIS BLOCK BEFORE TOUCHING THE NUMBERS.
 * =============================================================================
 *
 * WHAT CHANGED AND WHY. Wave 1 ported the old site's intro artwork verbatim
 * (a 520×650 schematic block, 5 residential floors + a ground floor) and hung
 * it in the corner of the hero as a watermark. SOVA §17 flagged the single
 * risk of Direction A and the status report recorded it as the top design bug:
 * **the drawing's floors did not line up with the render's floors**, so the
 * cross-fade read as a ghost artifact stuck on the facade rather than as one
 * object transforming. It could not be fixed by moving or scaling the old
 * artwork: `public/images/hero.webp` shows EIGHT balcony floors over a taller
 * ground floor, and the ported drawing has FIVE. No transform reconciles 5
 * floors with 8.
 *
 * SOVA's own instruction was «that requires the render and the SVG to be
 * redrawn against each other». That is what this file now is.
 *
 * HOW IT WAS MEASURED. `hero.webp` (1672×941) was loaded at 1:1 under a
 * labelled 20px grid in a headless browser and read off feature by feature:
 * the roofline runs and the two rear setbacks, the eight balcony bands at an
 * 80px pitch, the bay piers, the ground-floor entrance, the plinth. Two
 * vanishing points were then fitted so the drawing carries the render's
 * perspective instead of fighting it:
 *
 *     horizon (eye level)     y = 700
 *     right VP (facade)       x = 6058   — facade horizontals converge here
 *     left VP  (flank)        x = −5872  — the receding left flank's do
 *
 * so every horizontal in the drawing tilts by exactly as much as the same line
 * tilts in the photograph. Above the horizon they fall to the right; the
 * ground line, which is below it, rises to the right. That is why the outline
 * sits ON the building instead of near it.
 *
 * ⛔ THE COORDINATE SPACE IS THE RENDER'S OWN, AND THAT IS THE WHOLE TRICK.
 * `viewBox="0 0 1672 941"` is the natural size of `hero.webp`, and
 * `preserveAspectRatio="xMidYMid slice"` is the exact SVG spelling of
 * `object-fit: cover; object-position: center`. Stretch this SVG over the same
 * box as the <Image> and the two crops are identical at EVERY viewport size —
 * no breakpoint table, no magic offsets, nothing to retune when the layout
 * changes. If anyone ever changes the hero image's `object-position` at `md`
 * and up, this SVG's `preserveAspectRatio` must change with it or the
 * alignment silently drifts. They are one setting written twice.
 *
 * (Below `md` the hero image uses `object-[38%_50%]`, which `preserveAspectRatio`
 * cannot express — it only offers xMin/xMid/xMax. The drawing therefore stays
 * hidden below `md`, exactly as wave 1 shipped it, and the phone intro runs
 * without it.)
 *
 * =============================================================================
 * NEON — the contract (unchanged from wave 1, more paths)
 * =============================================================================
 *   · every path carries `pathLength={1}`, so dash maths is unit-free:
 *       gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
 *       gsap.to(paths, { strokeDashoffset: 0, stagger: 0.014, ... })
 *     No getTotalLength(), no layout read, no per-path measurement.
 *   · `[data-bp-path]` selects everything; `[data-bp="grid"]` and
 *     `[data-bp="building"]` select the two layers; paths are in draw order
 *     (silhouette → structure → floors → ground line → windows). The building
 *     layer holds a nested `[data-bp="detail"]` group carrying the openings at
 *     half weight — both selectors above still reach it.
 *   · `[data-bp-mark]` is the mark + its ring, for §17 step 3. It rests at
 *     opacity 0 — it belongs to the intro, not to the finished hero.
 *   · `vector-effect="non-scaling-stroke"` keeps hairlines hairline at any size.
 *
 * BASE STATE = FINAL STATE. The drawing ships fully stroked and the grid and
 * the mark ship invisible. With JS disabled, with a failed script, under
 * prefers-reduced-motion, or before the animation runs, the hero is the
 * assembled, readable, correct thing (SOVA §10.5). Any dash offset NEON sets
 * is applied by JS and animated back to zero, never the other way round.
 *
 * It is decorative: aria-hidden, and the meaning it carries is said in words by
 * the `من المخطط ← إلى البيت` line in the hero's bottom row.
 * -------------------------------------------------------------------------- */

export const BLUEPRINT_VIEWBOX = "0 0 1672 941";

/* -------------------------------------------------------------- the geometry */

/** Natural size of `public/images/hero.webp`. */
const W = 1672;
const H = 941;

/** Eye level, read off the render's distant ridge. */
const HORIZON = 700;
/** Facade horizontals converge here (right of frame, far off). */
const VP_R = 6058;
/** The receding left flank's horizontals converge here. */
const VP_L = -5872;
/** The building's front corner — every level below is quoted at this x. */
const X0 = 234;

/** y of a facade horizontal at `x`, given its height `y0` at the front corner. */
const fy = (x: number, y0: number) => y0 + ((HORIZON - y0) * (x - X0)) / (VP_R - X0);
/** y of a flank horizontal at `x`, same convention. */
const ly = (x: number, y0: number) => y0 + ((HORIZON - y0) * (x - X0)) / (VP_L - X0);

const r = (n: number) => Math.round(n * 10) / 10;

/** Verticals, in image pixels. Read off the render. */
const X = {
  flankOuter: 153, // outermost silhouette edge of the rear setback
  flankInner: 181, // the step between the two rear volumes
  corner: X0, // the building's front corner
  pierA: 274, // inboard edge of the left pier
  pierB0: 385, // central pier, outboard edge
  pierB1: 455, // central pier, inboard edge
  pierC: 558, // inboard edge of the corner pilaster
  cornerR: 598, // front plane's right corner
  returnR: 658, // outer edge of the returning wall
} as const;

/** Levels at the front corner (x = 234). Floor pitch is 80px, measured. */
const Y = {
  roof: 92, // top of the main parapet
  parapet: 130, // parapet base = the first slab line
  ground: 872, // where the building meets its terrace
  setbackA: 129, // top of the nearer rear volume
  setbackB: 245, // top of the further rear volume
} as const;

/** The eight balcony floors, slab line at the front corner. */
const FLOORS = [210, 290, 370, 450, 530, 610, 690, 770] as const;

/** A perspective-correct quad, given two x edges and two levels. */
const quad = (x1: number, x2: number, top: number, bottom: number) =>
  `M${x1} ${r(fy(x1, top))}L${x2} ${r(fy(x2, top))}L${x2} ${r(fy(x2, bottom))}L${x1} ${r(fy(x1, bottom))}Z`;

/**
 * A slab line: across the receding flank, then across the front facade.
 *
 * The flank end is CLIPPED TO THE SILHOUETTE. The block steps back twice on
 * its left side, so the top two levels have no flank to cross yet — drawn from
 * `flankOuter` regardless, they hang in the sky above the setbacks, which is
 * exactly the kind of stray hairline that makes an overlay read as a ghost
 * rather than as a drawing of the thing underneath. Caught in a screenshot.
 */
const slabStart = (level: number) =>
  level < Y.setbackA ? X.corner : level < Y.setbackB ? X.flankInner : X.flankOuter;

const slab = (level: number) => {
  const start = slabStart(level);
  const flank = start === X.corner ? "" : `M${start} ${r(ly(start, level))}L${X.corner} ${level}`;
  return `${flank}${flank ? "L" : `M${X.corner} ${level}L`}${X.cornerR} ${r(fy(X.cornerR, level))}`;
};

/** A pier, from the roofline down to the ground line. */
const pier = (x: number) => `M${x} ${r(fy(x, Y.roof))}V${r(fy(x, Y.ground))}`;

/**
 * The measuring grid — five levels carried across the frame and seven
 * verticals. It is intro furniture: the drawing is measured onto paper, then
 * the paper goes. It rests at opacity 0 (see the <g> below).
 */
export const BLUEPRINT_GRID: readonly string[] = [
  ...[Y.parapet, FLOORS[1], FLOORS[3], FLOORS[5], FLOORS[7]].map(
    (level) => `M0 ${r(fy(0, level))}L${W} ${r(fy(W, level))}`,
  ),
  ...[X.flankOuter, X.corner, X.pierB0, X.pierB1, X.cornerR, X.returnR, 1000].map(
    (x) => `M${x} 0V${H}`,
  ),
];

/**
 * THE FRAME — silhouette, structure, slabs, ground line. In construction
 * order, which is also the order it draws itself in.
 */
export const BLUEPRINT_FRAME: readonly string[] = [
  /* ------------------------------------------------------------- silhouette */
  `M${X.flankOuter} ${r(ly(X.flankOuter, Y.ground))}` +
    `V${Y.setbackB}` +
    `L${X.flankInner} ${r(ly(X.flankInner, Y.setbackB))}` +
    `V${Y.setbackA}` +
    `L${X.corner} ${Y.setbackA - 3}` +
    `V${Y.roof}` +
    `L${X.cornerR} ${r(fy(X.cornerR, Y.roof))}` +
    `L${X.returnR} 163` +
    `V${r(fy(X.returnR, Y.ground))}`,

  /* -------------------------------------------------------------- structure */
  `M${X.flankInner} ${r(ly(X.flankInner, Y.setbackA))}V${r(ly(X.flankInner, Y.ground))}`,
  `M${X.corner} ${Y.setbackA - 3}V${Y.ground}`,
  `M${X.cornerR} ${r(fy(X.cornerR, Y.roof))}V${r(fy(X.cornerR, Y.ground))}`,
  pier(X.pierA),
  pier(X.pierB0),
  pier(X.pierB1),
  pier(X.pierC),

  /* ------------------------------------------------------------ floor slabs */
  slab(Y.parapet),
  ...FLOORS.map(slab),

  /* --------------------------------------------------------- the ground line */
  `M120 ${r(fy(120, Y.ground))}L700 ${r(fy(700, Y.ground))}`,
];

/**
 * THE DETAIL — the openings. Drawn last and, at rest, at roughly half the
 * frame's weight.
 *
 * WHY THE WEIGHTS DIFFER. At a single uniform weight over the whole facade the
 * overlay stops reading as a drawing lying on a photograph and starts reading
 * as a wireframe MODEL of one — 27 boxes at the same value as the silhouette
 * is more ink than the building underneath. Splitting them means the outline
 * still states the shape while the windows stay a whisper, which is how an
 * architect's elevation is weighted anyway. Judged in a screenshot, not by
 * arithmetic.
 */
export const BLUEPRINT_DETAIL: readonly string[] = [
  /* ---------------------------------------------- balconies, floor by floor
     Two bays per floor. `+3 / +72` are the recess's head and its balcony
     slab, measured off the render at the front corner. */
  ...FLOORS.flatMap((_, i) => {
    const head = Y.parapet + 80 * i + 3;
    const sill = Y.parapet + 80 * i + 72;
    return [quad(276, 383, head, sill), quad(457, 556, head, sill)];
  }),

  /* --------------------------- the tall narrow window in the central pier */
  ...FLOORS.map((_, i) => quad(407, 433, Y.parapet + 80 * i + 8, Y.parapet + 80 * i + 66)),

  /* --------------------------------------------------------- ground floor
     Two openings flanking the entrance. The ground floor is 102px, taller
     than the 80px residential pitch — as it is in the render. */
  quad(276, 372, 786, 858),
  quad(398, 486, 782, 870),
  quad(500, 556, 786, 858),
];

/** Everything, in draw order. Kept for anyone counting paths. */
export const BLUEPRINT_BUILDING: readonly string[] = [
  ...BLUEPRINT_FRAME,
  ...BLUEPRINT_DETAIL,
];

/** Centre of the drawing — where the mark scales in (SOVA §17 step 3). */
const MARK = { cx: 405, cy: 470, ring: 112, size: 168 } as const;

export interface HeroBlueprintProps extends React.SVGProps<SVGSVGElement> {
  /** Draw the measuring grid behind the block. */
  grid?: boolean;
  /** Render the intro mark + its ring. Rests invisible. */
  mark?: boolean;
}

export function HeroBlueprint({
  grid = true,
  mark = true,
  className,
  ...props
}: HeroBlueprintProps) {
  return (
    <svg
      viewBox={BLUEPRINT_VIEWBOX}
      /* The SVG spelling of `object-fit: cover; object-position: center` —
         see the header block. This must track the hero <Image>. */
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden
      data-slot="hero-blueprint"
      className={cn("block size-full", className)}
      {...props}
    >
      {grid ? (
        <g data-bp="grid" strokeWidth={0.8} opacity={0}>
          {BLUEPRINT_GRID.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              data-bp-path={`grid-${i}`}
            />
          ))}
        </g>
      ) : null}

      <g data-bp="building" strokeWidth={1.2}>
        {BLUEPRINT_FRAME.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            data-bp-path={`frame-${i}`}
          />
        ))}

        {/* Nested INSIDE the building layer on purpose: `[data-bp="building"]`
            and `[data-bp-path]` both still select these, so the DOM contract
            wave 1 published is unchanged and the stagger still runs frame →
            detail in one pass. */}
        <g data-bp="detail" strokeWidth={1} opacity={0.55}>
          {BLUEPRINT_DETAIL.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              data-bp-path={`detail-${i}`}
            />
          ))}
        </g>
      </g>

      {mark ? (
        <g data-bp-mark opacity={0}>
          <circle
            cx={MARK.cx}
            cy={MARK.cy}
            r={MARK.ring}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {/* The mark in its own fill — this is transient intro furniture, not
              a resting element, so it does not spend the hero's gold budget
              (AGENTS §8: the headline's <Accent> does). */}
          <AnkaaMark
            x={MARK.cx - MARK.size / 2}
            y={MARK.cy - (MARK.size * 456) / 472 / 2}
            width={MARK.size}
            height={(MARK.size * 456) / 472}
            className="text-accent-hair"
          />
        </g>
      ) : null}
    </svg>
  );
}
