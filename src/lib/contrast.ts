/* -----------------------------------------------------------------------------
 * WCAG 2.1 contrast, computed rather than claimed.
 *
 * The /styleguide route runs every foreground/background pairing this system
 * permits through these functions at render time and prints the number. That
 * is the point: a design system that says "AA compliant" in a comment is a
 * design system nobody checked. If a token drifts, the styleguide goes red.
 *
 * Thresholds (WCAG 2.1):
 *   4.5:1  normal text          (SC 1.4.3 AA)
 *   3.0:1  large text           (>= 24px, or >= 18.66px bold)
 *   3.0:1  UI components and    (SC 1.4.11 AA) — borders, focus rings, icons
 *          graphical objects            that carry meaning
 *   7.0:1  normal text          (SC 1.4.6 AAA)
 * -------------------------------------------------------------------------- */

export type Rgb = [number, number, number];

/** Parses `#rgb`, `#rrggbb`, `rgb(r g b)` and `rgb(r g b / a)`. */
export function parseColor(input: string): { rgb: Rgb; alpha: number } {
  const s = input.trim();

  if (s.startsWith("#")) {
    const h = s.slice(1);
    if (h.length === 3) {
      return {
        rgb: [
          parseInt(h[0] + h[0], 16),
          parseInt(h[1] + h[1], 16),
          parseInt(h[2] + h[2], 16),
        ],
        alpha: 1,
      };
    }
    return {
      rgb: [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ],
      alpha: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  const nums = s.match(/[\d.]+/g)?.map(Number) ?? [];
  return {
    rgb: [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0],
    alpha: nums.length > 3 ? nums[3] : 1,
  };
}

/** Flattens a translucent foreground onto an opaque ground. */
export function composite(fg: string, bg: string): Rgb {
  const f = parseColor(fg);
  const b = parseColor(bg);
  if (f.alpha >= 1) return f.rgb;
  return [0, 1, 2].map(
    (i) => f.rgb[i] * f.alpha + b.rgb[i] * (1 - f.alpha),
  ) as Rgb;
}

export function toHex(rgb: Rgb): string {
  return (
    "#" +
    rgb
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function channel(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance. */
export function luminance(rgb: Rgb): number {
  return (
    0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
  );
}

/**
 * Contrast ratio between a foreground and a background.
 * A translucent foreground is composited onto the background first — which is
 * what the browser actually paints, and is why `ink-inv-2` at 78% white is
 * measured at 10.07:1 rather than white's 15.96:1.
 */
export function contrast(fg: string, bg: string): number {
  const f = luminance(composite(fg, bg));
  const b = luminance(parseColor(bg).rgb);
  return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
}

export type Requirement = "body" | "large" | "ui" | "none";

export const THRESHOLD: Record<Requirement, number> = {
  body: 4.5,
  large: 3,
  ui: 3,
  none: 0,
};

export interface Verdict {
  ratio: number;
  passes: boolean;
  /** "AAA" | "AA" | "AA large" | "fail" | "n/a" */
  grade: string;
}

export function assess(fg: string, bg: string, req: Requirement = "body"): Verdict {
  const ratio = contrast(fg, bg);
  if (req === "none") return { ratio, passes: true, grade: "n/a" };
  const passes = ratio >= THRESHOLD[req];
  const grade =
    ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "fail";
  return { ratio, passes, grade };
}

export const fmt = (n: number) => n.toFixed(2);
