import * as React from "react";

import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * TYPOGRAPHY PRIMITIVES
 *
 * These exist only where a token alone is not enough — where the component
 * also carries a *rule* (a colour pairing, a ground-aware flip, a structural
 * mark). Everything else is a plain Tailwind text token:
 *
 *     text-display-1  text-display-2  text-h1 ... text-h4
 *     text-lead  text-body  text-body-sm  text-label  text-caption
 *     text-quote  text-stat
 *
 * Twelve tokens, hard floor 13px. Do not invent a thirteenth. If something
 * "needs" 11px, it needs to be 13px and quieter, or it does not need to ship.
 * -------------------------------------------------------------------------- */

/* -----------------------------------------------------------------------------
 * <Accent> — the gold phrase inside a heading.
 *
 * This replaces the old site's `<em>` hack, which only worked because a
 * stylesheet rule neutralised the italic (`h1 em { font-style: normal }`).
 * Italic is meaningless in Arabic; the markup was lying about its intent.
 *
 * The whole reason this is a component and not a utility class: gold text
 * MUST change value with the ground or it fails WCAG. `--accent-gold` is
 * gold-700 (#756435, 5.54:1) on light and gold-300 (#d7cca9, 9.96:1) on dark,
 * and <Section> swaps it. Write <Accent> anywhere and it is always legible.
 *
 * BUDGET: this is a gold element. One per section (SOVA 13.4 rule 2) — if the
 * section has a gold CTA or a gold rule, the heading accent is not available.
 * -------------------------------------------------------------------------- */
export function Accent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="accent" className={cn("text-accent-gold", className)} {...props} />
  );
}

/* -----------------------------------------------------------------------------
 * <Display> — hero-scale type. `level={1}` is 44->84px, `level={2}` 36->64px.
 * Renders an <h1> by default; pass `as` when it is not the page's heading.
 *
 * Ratio note: display-1 / body = 84 / 17 = 4.9:1. That is deliberately modest
 * next to a Latin luxury site. Arabic carries far more visual mass per
 * character, and a 120px Arabic headline reads as a wall of strokes rather
 * than an elegant line. The luxury gap here is closed by killing everything
 * under 13px, not by inflating the top (SOVA 12.2).
 * -------------------------------------------------------------------------- */
export function Display({
  level = 1,
  as,
  className,
  ...props
}: React.ComponentProps<"h1"> & { level?: 1 | 2; as?: React.ElementType }) {
  const Comp = as ?? "h1";
  return (
    <Comp
      data-slot="display"
      className={cn(
        "font-display text-balance",
        level === 1 ? "text-display-1" : "text-display-2",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * <Lead> — the paragraph directly under a heading. 17->20px at line-height
 * 1.85, in `--fg-muted` rather than full ink so the heading keeps the weight.
 * -------------------------------------------------------------------------- */
export function Lead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="lead"
      className={cn("text-lead text-fg-muted max-w-[62ch] text-pretty", className)}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * <Label> — the 13px/600 label. Arabic is unicase, so it cannot borrow Latin's
 * tracked-out small caps for label hierarchy; WEIGHT does that job alone.
 * NO tracking, ever (it severs Arabic letter joins).
 *
 * `rule` adds the 28px gold hairline that turns a label into a section kicker.
 * -------------------------------------------------------------------------- */
export function Label({
  rule = false,
  className,
  ...props
}: React.ComponentProps<"span"> & { rule?: boolean }) {
  return (
    <span
      data-slot="label"
      className={cn(
        "text-label font-semibold",
        rule && "kicker-rule inline-flex items-center",
        className,
      )}
      {...props}
    />
  );
}

/* -----------------------------------------------------------------------------
 * <Prose> — a block of long-form Arabic copy with correct internal rhythm.
 * Applies the body token, `--fg-muted`, and paragraph spacing off the approved
 * ladder. For the president's message pass `formal` to switch to Naskh.
 * -------------------------------------------------------------------------- */
export function Prose({
  formal = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { formal?: boolean }) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "text-body text-fg-muted [&>*+*]:mt-6 [&_strong]:text-fg [&_strong]:font-semibold",
        formal && "font-naskh text-quote",
        className,
      )}
      {...props}
    />
  );
}
