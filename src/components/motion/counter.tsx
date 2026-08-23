"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

import { useReducedMotion } from "@/components/motion/motion-env";

/* -----------------------------------------------------------------------------
 * <Counter> — the trust strip's three numbers. Framer's territory: it is
 * triggered by a discrete in-view STATE, not scrubbed against scroll position,
 * so no ScrollTrigger touches it (SOVA §15.1, §15.3 "Trust strip counters").
 *
 * ⛔ THE RESTING DOM IS THE FINISHED NUMBER. The server renders `+٤٨٠`, and
 * that is what a visitor sees with JS disabled, with the bundle failed, under
 * reduced motion, or if they land below this band from a shared link. The
 * count-up is applied on top of a correct page, never in place of one — same
 * rule as everything else in this build (SOVA §10.5).
 *
 * NUMERALS ARE A CONTENT DECISION, NOT A FORMATTING ONE. `data-count-numerals`
 * carries the choice wave 1 made per string, and `Intl.NumberFormat` is asked
 * for that numbering system explicitly rather than being left to guess from a
 * locale. The machine value lives in `data-count-to` as a Western integer, so
 * the number this animates toward is never parsed back out of display text.
 *
 * WHY IT WRITES `textContent` INSTEAD OF HOLDING STATE. Sixty React renders per
 * second to retype three characters is the wrong shape, and `useState` inside
 * the in-view effect is exactly the pattern `react-hooks/set-state-in-effect`
 * exists to catch. This component never re-renders after mount — it has no
 * state and its props are compile-time constants — so the one node it owns is
 * safe to write to directly.
 * -------------------------------------------------------------------------- */

export interface CounterProps {
  /** Machine value — the target. */
  value: number;
  /** The server-rendered display string. This is the resting state. */
  display: string;
  /** Rendered before the digits, e.g. "+". */
  prefix?: string;
  /** Numbering system for the count-up. Must match `display`. */
  numerals?: "arab" | "latn";
  className?: string;
}

export function Counter({
  value,
  display,
  prefix = "",
  numerals = "arab",
  className,
}: CounterProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;

    const format = new Intl.NumberFormat(`ar-EG-u-nu-${numerals}`);

    if (!inView) {
      // Park at zero until the band is genuinely on screen. This runs after
      // first paint, and the strip sits below the fold under a 100svh hero, so
      // the resting number is never seen being reset.
      element.textContent = `${prefix}${format.format(0)}`;
      return;
    }

    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (current) => {
        element.textContent = `${prefix}${format.format(Math.round(current))}`;
      },
      onComplete: () => {
        // Land on the authored string, not on our reformatting of it.
        element.textContent = `${prefix}${display}`;
      },
    });

    return () => controls.stop();
  }, [display, inView, numerals, prefix, reduced, value]);

  return (
    <bdi
      ref={ref}
      data-count-to={value}
      data-count-numerals={numerals}
      data-count-prefix={prefix || undefined}
      className={className}
    >
      {prefix}
      {display}
    </bdi>
  );
}
