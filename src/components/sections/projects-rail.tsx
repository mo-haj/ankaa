"use client";

/* -----------------------------------------------------------------------------
 * <ProjectsRail> — the horizontal projects timeline.
 *
 * WHY "use client" (the only reason): Embla is a DOM-measuring library and
 * needs a ref plus a resize listener. Everything it wraps — the cards — is
 * server-rendered markup passed in as `children`, so no project content
 * crosses the client boundary. The pointer-capture below is the second reason,
 * and it is eight lines.
 *
 * =============================================================================
 * THREE MODES, ONE DOM  — `data-rail-mode` on the root
 * =============================================================================
 *
 *   "native"  the SHIPPED BASE STATE, and what every visitor gets before JS.
 *             The viewport is `overflow-x: auto` with `scroll-snap`. The
 *             browser owns the RTL scrolling, which is the whole point:
 *             SOVA §16.9 documents three incompatible `scrollLeft` models in
 *             RTL and ~60 lines of hand-rolled probe-and-normalise on the live
 *             site. **That code is deleted, not ported.** Native scroll and
 *             Embla each own the problem correctly; we own neither.
 *
 *   "embla"   below 1024. Set by this component once mounted. Embla takes the
 *             container over (`direction: "rtl"`, dragFree, trimSnaps) and the
 *             viewport switches to `overflow: hidden` so native scroll and
 *             Embla's transform cannot fight. Embla is configured with
 *             `breakpoints: { "(min-width: 1024px)": { active: false } }`, so
 *             it deactivates itself at lg and leaves the DOM alone.
 *
 *   "pin"     ≥1024. **NEON sets this**, and nothing else does. It switches
 *             the viewport to `overflow: hidden` exactly like "embla" does, so
 *             the GSAP pin timeline can translate the track without the
 *             browser also scrolling it.
 *
 * NEON has shipped, so ≥1024 is "pin" once <PageMotion> mounts. The base state
 * below it is still "native" and that stays deliberate: wave 2 must be usable
 * standing alone, a rail whose overflow is hidden with nothing driving it is
 * six cards of which two are reachable, and "native" is also what a visitor
 * gets before hydration, with scripting off, and under reduced motion.
 *
 * ⚠ `overflow: hidden` in the two JS-driven modes clips the box but leaves it
 * SCROLLABLE — focusing an off-screen card makes the browser drive
 * `scrollLeft` (negative, in this RTL document) behind whichever library owns
 * the transform. ⛔ THIS PARAGRAPH USED TO END "Embla handles that itself".
 * IT DOES NOT — VIPER measured every even card taking focus 75–91% off-screen
 * at 430, and card 04 at 7.8% visible in pin mode at 1440. Neither library
 * follows a `scrollLeft` change. `onRailFocus` below is the correction, and
 * `page-motion.tsx` seeks the pin from its own `focusin` listener; the older
 * conversion in the block above its `viewport.addEventListener("scroll", …)`
 * still catches scrolls that focus did not cause.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, desktop ≥1024 pin)
 * =============================================================================
 *
 *   [data-slot="projects-rail"]      root. Set `data-rail-mode="pin"` here when
 *                                    the pin engages, and back to "native" on
 *                                    teardown / reduced motion.
 *   [data-slot="projects-pin"]       the element to `pin: true`.
 *   [data-slot="projects-viewport"]  the clipping box. Measure `clientWidth`.
 *   [data-slot="projects-track"]     the element to translate.
 *                                    travel = scrollWidth − clientWidth.
 *   [data-slot="project-card"]       the items, with `data-index`.
 *
 * Port from the live site: `pin:true, scrub:1.15, anticipatePin:1,
 * invalidateOnRefresh:true, end: () => "+=" + travel`, and keep the stale
 * pin-spacer cleanup — it is a real bug guard.
 *
 * ⚠ CORRECTED BY CYPHER — this note used to say the track travels toward
 * NEGATIVE x in RTL. It travels toward POSITIVE x, and `x` being PHYSICAL
 * (§16.10) is exactly why the sign is not the one it looks like: in an RTL
 * flex row the cards are laid out from the container's inline-start (the
 * physical RIGHT) and the overflow hangs off the LEFT, so the track has to
 * move RIGHTWARD to bring the last card into view. Measured at 1440: the
 * track runs `x: 0 → +1264` (= scrollWidth 2689 − clientWidth 1425) and the
 * sixth card lands flush at the viewport's left edge. `dirX(travel())` in
 * `page-motion.tsx` produces exactly that, and flips it for an LTR build.
 *
 * Reduced motion (§15.4): no pin. Leave `data-rail-mode` alone and the native
 * scroller is already the fallback — there is nothing to build.
 *
 * =============================================================================
 * The circular reveal — `--project-reveal-x` / `--project-reveal-y`
 * =============================================================================
 * SOVA calls the modal's clip-path reveal from the click coordinates the best
 * interaction on the current site. Cards are plain <Link>s and must stay that
 * way, so instead of a per-card handler this component captures the activation
 * point ONCE at the track level and writes it to <html> as two custom
 * properties in viewport pixels:
 *
 *     --project-reveal-x: 812px;
 *     --project-reveal-y: 431px;
 *
 * Pointer activation uses the pointer. KEYBOARD activation (Enter on a focused
 * card) has no pointer, so it uses the centre of the card itself — the reveal
 * still originates from the thing the user acted on. The overlay reads them
 * with a 50% fallback, so a direct visit to /projects/[slug] is never broken.
 * NEON animates `circle(0 at var(--project-reveal-x) var(--project-reveal-y))`
 * → `circle(<hypot> at …)`, 0.85s power4.inOut.
 * -------------------------------------------------------------------------- */

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";

import { site } from "@/content/site";

const EMBLA_BELOW = "(max-width: 1023.98px)";

function writeRevealOrigin(x: number, y: number) {
  const root = document.documentElement;
  root.style.setProperty("--project-reveal-x", `${Math.round(x)}px`);
  root.style.setProperty("--project-reveal-y", `${Math.round(y)}px`);
}

export function ProjectsRail({ children }: { children: React.ReactNode }) {
  /* ⛔ THE SECOND RETURN VALUE IS NOT SPARE. It used to be discarded, and
     `onRailFocus` below cannot work without it. See the block above that
     handler before "tidying" this back to `const [emblaRef]`. */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    // Deactivate at lg — that width belongs to NEON's pin timeline.
    breakpoints: { "(min-width: 1024px)": { active: false } },
  });

  // Mirrors Embla's own breakpoint so the CSS knows which mode is live.
  // Starts "native" on the server and on first paint, which is also the
  // correct no-JS state — the switch is an enhancement, never a repair.
  const [mode, setMode] = React.useState<"native" | "embla">("native");

  React.useEffect(() => {
    const mq = window.matchMedia(EMBLA_BELOW);
    const sync = () => setMode(mq.matches ? "embla" : "native");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onPointerDown = React.useCallback((event: React.PointerEvent) => {
    writeRevealOrigin(event.clientX, event.clientY);
  }, []);

  const onKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-slot='project-card']",
    );
    if (!card) return;
    const box = card.getBoundingClientRect();
    writeRevealOrigin(box.left + box.width / 2, box.top + box.height / 2);
  }, []);

  /* ===========================================================================
   * ⛔ FOCUS HAS TO MOVE THE RAIL, BECAUSE THE BROWSER CANNOT — VIPER V-1
   * ===========================================================================
   * The comment at the top of this file used to assert "Embla handles that
   * itself". VIPER measured it and it does not. At 430, tabbing the six cards:
   *
   *   card   01    02      03    04      05    06
   *   left   100   −229    50    −279    50    −280
   *   seen   100%  25%     100%  8.6%    100%  8.5%
   *
   * Every even card takes focus while 75–91% off-screen, with its focus ring
   * outside the viewport entirely. At 1440 in pin mode card 04 focuses at
   * `left −383`, 7.8% visible. That is WCAG 2.4.11 (Focus Not Obscured) and
   * 2.4.7 (Focus Visible), and no automated checker can see it — it takes
   * driving focus and measuring geometry, which is how it stayed hidden
   * through five audits and a "0 axe violations" result.
   *
   * THE MECHANISM. `overflow: hidden` clips a box; it does not stop the box
   * being scrolled. The browser DOES try to help — VIPER watched
   * `viewport.scrollLeft` go to −609 and then −1268 (negative, because RTL) —
   * but neither Embla's `translate3d` nor GSAP's pin follows a `scrollLeft`
   * change, so the browser's help slides the card further behind the clip.
   *
   * THE FIX. Undo the browser's scroll, then move the mechanism that actually
   * positions cards. Which mechanism depends on the mode, and the mode is read
   * from the DOM rather than from React state because `page-motion.tsx` writes
   * `data-rail-mode="pin"` directly:
   *
   *   native  DO NOTHING. The box is a real `overflow-x-auto` scroller here and
   *           the browser's scroll-into-view is already right. This is the
   *           pre-hydration, no-JS and reduced-motion state — zeroing
   *           `scrollLeft` in it would BREAK focus visibility rather than fix
   *           it, which is the one way this change could do harm.
   *   embla   `emblaApi.scrollTo(index)`.
   *   pin     nothing here; `page-motion.tsx` owns the pin and seeks it from
   *           its own `focusin` listener. Zeroing the box first is still this
   *           handler's job, and capture-phase ordering guarantees it happens
   *           before that listener measures geometry.
   * ======================================================================== */
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  /* Embla's ref is a callback; the viewport is also the box whose `scrollLeft`
     has to be zeroed, so both need the same node. */
  const setViewport = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const onRailFocus = React.useCallback(
    (event: React.FocusEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-slot='project-card']",
      );
      if (!card) return;

      const railMode = rootRef.current?.dataset.railMode ?? "native";
      if (railMode === "native") return;

      const viewport = viewportRef.current;
      const zero = () => {
        if (viewport && viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
      };
      /* Twice: once now, and once after the frame in which some engines
         perform the scroll-into-view. The second call is a no-op when the
         first one was enough. */
      zero();
      requestAnimationFrame(zero);

      if (railMode === "embla" && emblaApi) {
        emblaApi.scrollTo(Number(card.dataset.index ?? 0));
      }
    },
    [emblaApi],
  );

  return (
    <div
      ref={rootRef}
      data-slot="projects-rail"
      data-rail-mode={mode}
      className="group/rail relative"
    >
      <div data-slot="projects-pin">
        <div
          ref={setViewport}
          onFocusCapture={onRailFocus}
          data-slot="projects-viewport"
          /* scroll-padding matches the track's inline padding, or `snap-start`
             would snap the first card flush to the VIEWPORT edge and break the
             alignment with the page shell that the padding exists to create. */
          className="no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-ps-[max(var(--gutter),calc((100%-var(--container-shell))/2))] group-data-[rail-mode=embla]/rail:snap-none group-data-[rail-mode=embla]/rail:overflow-hidden group-data-[rail-mode=pin]/rail:snap-none group-data-[rail-mode=pin]/rail:overflow-hidden"
        >
          <ul
            data-slot="projects-track"
            aria-label={site.a11y.sliderLabel}
            onPointerDownCapture={onPointerDown}
            onKeyDownCapture={onKeyDown}
            /* The inline padding aligns the FIRST card with the page shell's
               inline-start edge while the rail itself bleeds to the viewport
               edge. Both terms are tokens, not magic numbers: the shell is
               `min(100% − 2·gutter, --container-shell)`, so its side margin is
               `(100% − container)/2`, floored at one gutter on narrow screens. */
            className="flex gap-6 ps-[max(var(--gutter),calc((100%-var(--container-shell))/2))] pe-[var(--gutter)]"
          >
            {children}
          </ul>
        </div>
      </div>
    </div>
  );
}
