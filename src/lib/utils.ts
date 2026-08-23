import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* -----------------------------------------------------------------------------
 * cn() — clsx + tailwind-merge, TAUGHT THE ANKAA THEME.
 *
 * Why this file is not the two-line default any more:
 *
 * tailwind-merge decides whether two classes conflict by pattern-matching the
 * value against Tailwind's DEFAULT scales. It has never seen `text-body-sm` or
 * `text-accent-gold`, so it guessed — and it guessed that both belong to the
 * same group. The result was that
 *
 *     cn("text-accent-gold", "text-body-sm")   ->  "text-body-sm"
 *
 * silently dropped the colour. That is not hypothetical: it made the primary
 * button's label invisible on the dark hero, because cva emits the variant's
 * colour before the size's font-size and twMerge keeps the last one. The same
 * bug ate `text-label` under `text-kicker` in every section kicker.
 *
 * It also could not merge `rounded-card` with `rounded-full`, so a component's
 * radius could not be overridden from a className at all.
 *
 * Declaring the theme below fixes every one of those at once, for every
 * component, forever. WHEN YOU ADD A TOKEN TO globals.css, ADD IT HERE.
 * The lists are the palette and the type scale — they should be short, and if
 * one of them is growing fast, that is a signal the system is drifting.
 * -------------------------------------------------------------------------- */

/**
 * The THIRTEEN type tokens (@theme --text-*). Hard floor 13px — see SOVA 12.4.
 *
 * It says thirteen because there are thirteen, and counting them is the point:
 * AGENTS §9 says "never add a fourteenth without deleting one", so a wrong
 * count here reads as a budget that is already blown. This line and AGENTS §9
 * both said "twelve" over a list of thirteen until CHAMBER C6 counted.
 */
const TEXT_SIZES = [
  "display-1",
  "display-2",
  "h1",
  "h2",
  "h3",
  "h4",
  "lead",
  "body",
  "body-sm",
  "label",
  "caption",
  "quote",
  "stat",
];

/** Every colour token the system exposes (@theme / @theme inline --color-*). */
const COLORS = [
  // grounds
  "surface-0",
  "surface-1",
  "surface-2",
  "surface-inverse-1",
  "surface-inverse-2",
  "surface-inverse-3",
  // ink
  "ink-1",
  "ink-2",
  "ink-3",
  "ink-inv-1",
  "ink-inv-2",
  "ink-inv-3",
  // brand + gold
  "brand-900",
  "brand-800",
  "brand-600",
  "gold-700",
  "gold-500",
  "gold-300",
  // lines
  "line-1",
  "line-2",
  "line-inv",
  "line-inv-2",
  // alpha ladders
  "ink-a05",
  "ink-a10",
  "ink-a20",
  "ink-a40",
  "ink-a60",
  "ink-a80",
  "inv-a05",
  "inv-a10",
  "inv-a20",
  "inv-a40",
  "inv-a60",
  "inv-a80",
  // the ground layer — these flip with data-theme
  "bg",
  "fg",
  "fg-muted",
  "fg-subtle",
  "line",
  "line-strong",
  "accent-gold",
  "accent-hair",
  "kicker",
  "veil-05",
  "veil-10",
  "veil-20",
  "veil-40",
  "veil-60",
  "veil-80",
  // ground-aware button tokens
  "btn-solid",
  "btn-solid-fg",
  "btn-solid-hover",
  "btn-gold",
  "btn-gold-fg",
  "btn-gold-hover",
];

/** Semantic radius aliases (@theme --radius-field/card/figure/media). */
const RADII = ["field", "card", "figure", "media"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: TEXT_SIZES,
      color: COLORS,
      radius: RADII,
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
