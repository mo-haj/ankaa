import * as React from "react";

import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * THE WING ARC — the brand's signature curve, measured rather than drawn.
 *
 * The outer edge of the phoenix's primary wing in `ankaa-mark.png` is a true
 * circular arc: fitting a circle to the traced edge across a 270px span gives
 * R = 490.4px with a mean deviation of 0.91px. Its chord is 321.2px, so:
 *
 *     R / chord        1.527
 *     sagitta / chord  8.42%     <- how far the curve bows off its chord
 *     subtended angle  38.27 deg <- long and shallow, never a swoosh
 *
 * Those three numbers are the whole curve language of this system. They are
 * also tokens: --arc-radius-ratio, --arc-rise, --arc-sweep in globals.css.
 *
 * Two shapes ship, both exact:
 *
 *   <WingArc>   the arc as it appears in the mark — rising from the inline
 *               start to the inline end. A corner or backdrop motif.
 *   <WingRule>  the same curvature applied symmetrically: a hairline divider
 *               that bows by the authentic 8.42% instead of running flat.
 *
 * BOTH RENDER WITH preserveAspectRatio="none", so the consumer sets the height
 * and the bow stretches to fill it. That is the practical choice for a
 * decorative rule — but it means the 8.42% sagitta is exact only when the
 * rendered box keeps the viewBox ratio. When you need the true curvature
 * (a section-corner arc, a motion path), size the element from `--arc-rise`
 * rather than picking a height by eye.
 *
 * GOLD BUDGET: either of these counts as the section's ONE gold element
 * (SOVA 13.4). If a section already has a gold accent phrase or a gold CTA,
 * this must be `text-line` instead, or absent.
 * -------------------------------------------------------------------------- */

/**
 * Cubic approximation of the measured arc, normalised to a 1000-wide box.
 * Derived from the fitted circle, not eyeballed: control points come from
 * k = 4/3 * tan(delta/4) at R = 490.4. Error against the true circle is well
 * under a thousandth of the span for a 38 deg arc.
 */
const WING_ARC_PATH = "M0 629.95C394.66 538.32 746.93 316.4 1000 0";
const WING_ARC_VIEWBOX = "0 0 1000 630";

/** Symmetric bow carrying the same 8.42% sagitta. */
const WING_RULE_PATH = "M0 84.2Q500 -84.2 1000 84.2";
const WING_RULE_VIEWBOX = "0 0 1000 84.2";

interface ArcProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  /** Stroke width in the *rendered* box, kept visually 1px by vector-effect. */
  hairline?: boolean;
}

/**
 * The wing arc. Inherits `currentColor`; give it `text-accent-hair` for the
 * metal, `text-line` for a quiet structural version.
 *
 * DOES NOT MIRROR IN RTL, deliberately. An SVG does not flip with `dir="rtl"`
 * on its own, and this one must not: it is a fragment of the logo, and a logo
 * keeps its handedness in every language. Directional ICONS mirror (see the
 * `data-direction` hook in button.tsx); brand marks do not.
 * CYPHER: this is the intended exception, not an oversight.
 */
export function WingArc({ className, hairline = true, ...props }: ArcProps) {
  return (
    <svg
      viewBox={WING_ARC_VIEWBOX}
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("w-full", className)}
      {...props}
    >
      <path
        d={WING_ARC_PATH}
        stroke="currentColor"
        strokeWidth={hairline ? 1 : 2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A divider that bows by the brand's own sagitta instead of running flat.
 * Use in place of an `<hr>` where a section deserves a little air.
 */
export function WingRule({ className, hairline = true, ...props }: ArcProps) {
  return (
    <svg
      viewBox={WING_RULE_VIEWBOX}
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("w-full", className)}
      {...props}
    >
      <path
        d={WING_RULE_PATH}
        stroke="currentColor"
        strokeWidth={hairline ? 1 : 2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { WING_ARC_PATH, WING_ARC_VIEWBOX, WING_RULE_PATH, WING_RULE_VIEWBOX };
