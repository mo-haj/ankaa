"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

/* -----------------------------------------------------------------------------
 * <HeaderMotion> — the header's scrolled state, and the reading-progress rule.
 * Framer's territory: both are driven by scroll POSITION AS A STATE, not by a
 * scrubbed timeline, and neither touches an element GSAP also touches
 * (SOVA §15.1, §15.3 rows "Header" and "Progress bar").
 *
 * =============================================================================
 * ⛔ THIS FIXES A LIVE LEGIBILITY BUG. READ BEFORE CHANGING THE THRESHOLD.
 * =============================================================================
 * JETT built both header states and the CSS for each, and left the switch to
 * NEON: `data-scrolled="true"` on `[data-slot="site-header"]` cross-fades in
 * the solid backdrop and compacts the bar. Nothing set it — so the header was
 * permanently in its transparent-over-dark state, which is WHITE TYPE ON CREAM
 * over `#about`, `#plans`, `#interior`, `#process`, `#president`, `#location`
 * and `#faq`. That is most of the page.
 *
 * THE RULE: the header may be transparent ONLY while it is over the hero.
 * Everywhere else it is solid. Note the asymmetry — this is not "solidify after
 * 80px of scroll", it is "solidify once the hero has passed", because the hero
 * is the only dark full-bleed ground the transparent state was designed for.
 *
 * THREE CASES, AND ALL THREE HAVE TO BE RIGHT WITHOUT JAVASCRIPT:
 *
 *   1. `/` at rest .............. transparent. The server ships
 *                                 `data-scrolled="false"`, which is correct.
 *   2. `/` scrolled past the hero solid. This component's job.
 *   3. A page with NO hero ...... solid IMMEDIATELY, including at scroll 0 and
 *      (/privacy, /projects/…)    with JS disabled. That one cannot be done
 *                                 from here — a client effect runs too late and
 *                                 never runs at all without JS — so it is a
 *                                 CSS rule in globals.css §8.2 keyed on
 *                                 `body:not(:has([data-slot="hero-media"]))`.
 *                                 If you delete that rule, /privacy loses its
 *                                 header again and nothing will fail the build.
 *
 * No layout shift: the solid state is a separate absolutely-positioned layer
 * that cross-fades, and the only box change is the container's vertical
 * padding (24px → 16px), which is transitioned, not snapped, and cannot move
 * anything below it because the header is `fixed`.
 * -------------------------------------------------------------------------- */

/** Fallback threshold when the page has a hero we cannot measure yet. */
const FALLBACK_THRESHOLD = 80;

export function HeaderMotion() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const thresholdRef = useRef(FALLBACK_THRESHOLD);
  const scrolledRef = useRef<boolean | null>(null);

  const { scrollY, scrollYProgress } = useScroll();

  /**
   * The hero's height minus the header's own height: the first scroll offset
   * at which the bar would otherwise be sitting on the section BELOW the hero.
   * Re-measured on resize and after the fonts land, because `min-h-svh` and a
   * font swap both change it.
   */
  const measure = useCallback(() => {
    const header =
      headerRef.current ??
      anchorRef.current?.closest<HTMLElement>('[data-slot="site-header"]') ??
      null;
    headerRef.current = header;

    const heroMedia = document.querySelector<HTMLElement>('[data-slot="hero-media"]');
    const hero = heroMedia?.closest<HTMLElement>('[data-slot="section"]') ?? null;

    if (!hero) {
      // No hero on this route — the CSS rule in globals.css §8.2 has already
      // made the header solid. Keep the threshold at 0 so JS agrees with it.
      thresholdRef.current = 0;
      return;
    }

    const headerHeight = header?.offsetHeight ?? 88;
    thresholdRef.current = Math.max(
      FALLBACK_THRESHOLD,
      hero.offsetTop + hero.offsetHeight - headerHeight,
    );
  }, []);

  const apply = useCallback((y: number) => {
    const header = headerRef.current;
    if (!header) return;
    const next = y >= thresholdRef.current;
    if (next === scrolledRef.current) return;
    scrolledRef.current = next;
    header.dataset.scrolled = next ? "true" : "false";
  }, []);

  useEffect(() => {
    measure();
    apply(window.scrollY);

    const onResize = () => {
      measure();
      apply(window.scrollY);
    };

    window.addEventListener("resize", onResize, { passive: true });
    // A font swap changes the hero's height; so does an image finishing decode.
    document.fonts?.ready.then(onResize).catch(() => {});

    return () => window.removeEventListener("resize", onResize);
  }, [apply, measure]);

  useMotionValueEvent(scrollY, "change", apply);

  return (
    <>
      {/* Anchor only — it exists so the island can find its own header without
          a document-wide query. `hidden` keeps it out of layout and the a11y
          tree; it is never painted. */}
      <span ref={anchorRef} hidden aria-hidden />

      {/* --------------------------------------------------- progress rule
          SOVA §15.3: `scaleX = scrollYProgress`, `transformOrigin: "right"`.
          The origin is PHYSICAL and that is deliberate: reading starts at the
          right edge in Arabic, so the rule must grow leftward. It is the one
          physical value in this file — if an LTR locale is ever added, this
          becomes `left` and nothing else here changes.

          NOT GOLD. The mark is already this bar's one gold element (AGENTS §8),
          so the rule is a ground-aware veil: visible, and not a second metal.

          FRAMER OWNS `scaleX`; CSS OWNS `opacity`, keyed off the same
          `data-scrolled` attribute the header already carries. Two properties,
          two owners, no React state re-rendering on every scroll frame. */}
      <motion.div
        aria-hidden
        data-slot="header-progress"
        style={{ scaleX: scrollYProgress, transformOrigin: "right" }}
        className="bg-veil-40 pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-quart)] group-data-[scrolled=true]/header:opacity-100"
      />
    </>
  );
}
