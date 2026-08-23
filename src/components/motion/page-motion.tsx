"use client";

import { useRef } from "react";
import {
  DUR,
  EASE,
  SCRUB,
  ScrollTrigger,
  SplitText,
  dirX,
  gsap,
  isRtl,
  registerMotion,
  useGSAP,
} from "@/components/motion/motion-env";

/* -----------------------------------------------------------------------------
 * <PageMotion> — every scroll-driven timeline on the home page. GSAP only.
 * Renders nothing. Mounted once from `src/app/page.tsx`.
 *
 * =============================================================================
 * WHY ONE FILE AND NOT TWELVE
 * =============================================================================
 * Because the ceiling in SOVA §15.2 — no more than two animated groups in
 * flight per viewport — is a property of the PAGE, not of a section, and it is
 * only auditable if the page's timelines can be read top to bottom in one
 * place. Every target below is a `data-*` hook that waves 1–3 wrote into the
 * section files on purpose; nothing here reaches for a class name, and nothing
 * here touches an element Framer drives (SOVA §15.1).
 *
 * =============================================================================
 * REDUCED MOTION IS STRUCTURAL, NOT A BRANCH
 * =============================================================================
 * Everything hangs off `gsap.matchMedia()` with
 * `(prefers-reduced-motion: no-preference)` in the query. Under `reduce`
 * nothing is ever built, and — because matchMedia is live — everything is
 * reverted the moment the OS setting changes, with `clearProps` handled for
 * us. There is no "reduced" code path to keep in sync, which is why there is
 * no bug waiting in it. The base CSS state of every element below is already
 * its final visual state (waves 1–3 guaranteed that), so building nothing is
 * always correct.
 * -------------------------------------------------------------------------- */

const OK = "(prefers-reduced-motion: no-preference)";
const DESKTOP = `(min-width: 1024px) and ${OK}`;
const TABLET_UP = `(min-width: 768px) and ${OK}`;

/** `start` for a one-shot entrance: the element is ~14% into the viewport. */
const ENTER = "top 86%";

/**
 * Resolve a design token to a real colour by asking the browser, inside the
 * ground that actually applies. `--fg` is a different value in a light section
 * and a dark one, and `getComputedStyle().getPropertyValue("--fg")` hands back
 * the unresolved `var(--color-ink-1)` in every engine — so a throwaway span is
 * the only reading that is correct on both grounds.
 */
function resolveColor(scope: HTMLElement, value: string) {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:${value}`;
  scope.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

export function PageMotion() {
  const anchor = useRef<HTMLSpanElement>(null);

  registerMotion();

  useGSAP(() => {
    const mm = gsap.matchMedia();

    /* =====================================================================
     * PROJECTS — the desktop pin (≥1024)
     * =====================================================================
     * `data-rail-mode="pin"` is set HERE and nowhere else: it switches the
     * viewport to `overflow: hidden` so the browser's own scrolling cannot
     * fight the transform. Below 1024 — and under reduced motion at ANY
     * width — the mode is left alone and <ProjectsRail>'s Embla (or, before
     * JS, the native snap scroller) is the whole story. That is SOVA §15.4's
     * "Projects falls back to the slider at every width", and it costs
     * nothing because the fallback is the shipped base state.
     *
     * `scrub: 1.15`, `anticipatePin: 1`, `invalidateOnRefresh: true` and the
     * `end` computed as a function are the live site's, kept as-is. So is the
     * stale-pin-spacer sweep — it is a real bug guard, not superstition:
     * GSAP can leave a `pin-spacer` wrapper in the DOM if the trigger is
     * killed while pinned (which is exactly what a desktop→tablet resize
     * does), and the leftover spacer holds a dead 100vh gap in the page.
     *
     * ⛔ IT IS BUILT FIRST, AND IT CARRIES `refreshPriority`. BOTH MATTER.
     * A pin inserts a `pin-spacer` that is ~1,480px tall at this width, and
     * every ScrollTrigger BELOW it on the page shifts down by exactly that.
     * ScrollTrigger reverts pins while it measures, so a trigger that was
     * created before the pin records its position in the UNPINNED document
     * and then fires ~1,480px early forever — `refresh()` does not repair it,
     * because the pin's contribution is applied in refresh ORDER, not
     * recomputed afterwards.
     *
     * The symptom is nasty precisely because it is not a crash: the
     * president's quote finished filling in while it was still two screens
     * below the fold, so the section looked STATIC rather than broken, and
     * the process line, the interior gallery and the contact parallax were
     * all silently early too. Found by dumping every trigger's start/end in
     * the browser and comparing them against the elements' real offsets —
     * the president's said 8,115 where the blockquote sits at 10,333.
     * ================================================================== */
    mm.add(DESKTOP, () => {
      const rail = document.querySelector<HTMLElement>('[data-slot="projects-rail"]');
      const pin = rail?.querySelector<HTMLElement>('[data-slot="projects-pin"]');
      const viewport = rail?.querySelector<HTMLElement>('[data-slot="projects-viewport"]');
      const track = rail?.querySelector<HTMLElement>('[data-slot="projects-track"]');
      if (!rail || !pin || !viewport || !track) return;

      const previousMode = rail.dataset.railMode ?? "native";
      rail.dataset.railMode = "pin";

      const travel = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      gsap.set(track, { x: 0 });
      /* The pin measures `travel` from x:0, so the box's own scroll offset has
         to be 0 too — otherwise a rail the visitor had already scrolled in
         "native" mode (or a stale offset carried across a resize out of
         "embla") is added on top of every frame of the timeline. CYPHER. */
      viewport.scrollLeft = 0;

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "projects-pin",
          trigger: pin,
          // Refresh before everything else, so the spacer this creates is in
          // the document by the time the triggers below it measure themselves.
          refreshPriority: 1,
          /* Centre the rail in the viewport while it is held. Pinning it at a
             fixed 96px offset left ~280px of empty ground under the cards on a
             900px viewport, which read as a layout gap rather than as a
             deliberate hold. Recomputed on every refresh because it depends on
             the viewport height. */
          start: () =>
            `top top+=${Math.max(112, Math.round((window.innerHeight - pin.offsetHeight) / 2))}`,
          /* ⛔ THE `0.6vw` FLOOR ONLY APPLIES WHEN THERE IS SOMETHING TO
             TRAVEL — NEON N4.

             MEASURED at 1440 on `/?region=hama#projects`, the one region with
             a single project: `track.scrollWidth` 1440 = `viewport.clientWidth`
             1440, so `travel()` is 0 — and the floor was still handing the pin
             `0.6 × 1440 = 864px` of scroll. Sampled at eleven points across
             the whole pinned range, the track's `x` read
             `0 → 0 → 0 → 0 → 0 → 0 → 0 → 0 → 0 → 0 → 0`. Not a slow rail: a
             dead one. 864 pixels of scrolling in which the only thing that
             happens is that the page stops.

             The floor exists so that a rail with a SMALL travel still reads as
             a deliberate hold rather than a twitch. With no travel at all
             there is nothing for it to protect, so the section gets the
             breathing term alone — the same `0.15vw` already in the sum, i.e.
             216px at this width instead of 864. A brief hold, which is what
             one card deserves, and the sixfold case is arithmetically
             unchanged (1256 + 216 = 1472 > 864).

             ⛔ 2026-08-22 — AND THEN THE BREATHING TERM WENT TOO. N4 cut the
             dead hold from 864px to 216px; the operator looked at 216 and it
             was still 216 pixels in which nothing moves. The reasoning above
             is right about a SMALL travel and wrong about a ZERO one: `breath`
             is there to stop a 40px rail from feeling like a twitch, and a
             rail with nothing to move has no twitch to protect.

             SO: `+=1` — one pixel, not zero. ScrollTrigger divides by
             `end - start` to get progress, and a zero-length trigger is a
             division by zero (`progress` comes back `NaN`, the tween never
             resolves and `pinSpacing` computes a NaN spacer height). One pixel
             is the smallest number that keeps the arithmetic finite, and it is
             below the granularity of any input device — a wheel notch is ~100.
             The section now scrolls past like any other.

             ⚠️ THIS HAS TO STAY A FUNCTION. `end` is re-evaluated on every
             `ScrollTrigger.refresh()`, which is what makes the region filter
             work: swapping the `?region=` chip from الهامة (one card) back to
             الكل (six) re-runs this and the pin gets its full range back
             without the trigger being rebuilt. A constant string here would
             freeze whichever count happened to be on screen when the page
             loaded. */
          end: () => {
            const total = travel();
            if (total <= 0) return "+=1";
            const breath = window.innerWidth * 0.15;
            return `+=${Math.max(total + breath, window.innerWidth * 0.6)}`;
          },
          pin: true,
          pinSpacing: true,
          scrub: SCRUB,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(track, { x: () => dirX(travel()), ease: "none" });

      /* =================================================================
       * ⛔ THE PINNED RAIL AND THE BROWSER'S OWN SCROLL — CYPHER (§16.9)
       * =================================================================
       * `overflow: hidden` clips a box; it does NOT stop the box being
       * scrolled. Tab into the rail and the browser scrolls the viewport to
       * reveal the focused card — and in this RTL document it does that by
       * driving `scrollLeft` NEGATIVE, the model SOVA §16.9 warns about.
       * GSAP is still writing `x` on the track from the pin's progress, so
       * the two offsets are then measured from different origins.
       *
       * Measured at 1440: five Tabs from the first card put `scrollLeft` at
       * −1263 while the track's `x` was still 76. Scrolling on from there
       * left every card frozen at [2200,1760,1320,880,440,0] for the whole
       * remaining ~1,400px of the pin — the browser clamps `scrollLeft`
       * toward 0 as GSAP's translate eats the overflow, so the section does
       * not visibly break, it simply STOPS ANIMATING. A keyboard visitor
       * gets a dead hold where the rail should be travelling.
       *
       * The fix converts rather than fights: whatever the browser scrolled
       * the clipped box by, hand it back as the equivalent pin progress and
       * zero the box. `Math.abs` is deliberate — it is correct for RTL's
       * negative model AND for LTR's positive one, which is the whole reason
       * not to normalise `scrollLeft` by hand (§16.9 again). The focused
       * card ends up on screen because the PIN moved to it, which is what
       * should have happened in the first place.
       * ============================================================== */
      const onViewportScroll = () => {
        const shifted = Math.abs(viewport.scrollLeft);
        if (shifted < 1) return;
        viewport.scrollLeft = 0;

        const trigger = timeline.scrollTrigger;
        const total = travel();
        if (!trigger || total <= 0) return;

        // `x` is `dirX(progress * total)`, so undo dirX to read progress back.
        const current = (gsap.getProperty(track, "x") as number) * (isRtl() ? 1 : -1);
        const next = Math.min(total, Math.max(0, current + shifted));
        window.scrollTo({
          top: trigger.start + (next / total) * (trigger.end - trigger.start),
          behavior: "auto",
        });
      };
      viewport.addEventListener("scroll", onViewportScroll);

      /* =================================================================
       * ⛔ THE PIN-MODE HALF OF THE FOCUS FIX — VIPER V-1
       * =================================================================
       * The conversion above is reactive: it waits for the browser to
       * scroll the clipped box and turns whatever it did into pin
       * progress. VIPER measured that this is not enough for FOCUS. At
       * 1440 card 04 still took focus at `left −383`, 7.8% visible —
       * because in pin mode the browser's scroll-into-view is partly
       * swallowed (`scrollLeft` reads back 0) and what actually moved the
       * rail was the incidental vertical page scroll, which lands right
       * for cards 5–6 and wrong for card 4.
       *
       * So focus gets its own listener, and it does not guess: it
       * measures where the card IS and seeks the pin by exactly the
       * difference. `<ProjectsRail>`'s `onFocusCapture` has already
       * zeroed `viewport.scrollLeft` by the time this runs — a capture
       * listener at React's root fires before a bubble listener here — so
       * the geometry below is the pin's own, with no box offset mixed in.
       *
       * DIRECTION. Everything below is written in LOGICAL terms and the
       * physical edge is chosen once, which is why `dirX` and `Math.abs`
       * never appear here. `startGap` is the distance from the viewport's
       * inline-START to the card's — positive when the card is further
       * along the rail than the viewport, negative when it is behind. In
       * RTL that edge is the physical RIGHT; in LTR the physical LEFT.
       *
       * ⛔ AN ALREADY-VISIBLE CARD MUST NOT MOVE THE RAIL. Measured: the
       * first version seeked on every focus, and because the track carries
       * an inline padding that aligns card 01 with the page shell, focusing
       * card 01 had a `startGap` of a couple of hundred pixels and shoved
       * the card it was supposed to reveal half out of the frame. "Bring
       * into view" has to mean nothing at all when the card is in view.
       * ============================================================== */
      const onViewportFocus = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null;
        const card = target?.closest<HTMLElement>('[data-slot="project-card"]');
        if (!card) return;

        const trigger = timeline.scrollTrigger;
        const total = travel();
        if (!trigger || total <= 0) return;

        // Belt and braces: harmless if the rail already did it.
        if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;

        const cardBox = card.getBoundingClientRect();
        const viewBox = viewport.getBoundingClientRect();
        const startGap = isRtl()
          ? viewBox.right - cardBox.right
          : cardBox.left - viewBox.left;

        const fullyVisible =
          startGap >= -1 && startGap + cardBox.width <= viewBox.width + 1;
        if (fullyVisible || Math.abs(startGap) < 1) return;

        const current = (gsap.getProperty(track, "x") as number) * (isRtl() ? 1 : -1);
        const next = Math.min(total, Math.max(0, current + startGap));
        window.scrollTo({
          top: trigger.start + (next / total) * (trigger.end - trigger.start),
          behavior: "auto",
        });
      };
      viewport.addEventListener("focusin", onViewportFocus);

      /* =================================================================
       * ⛔ `invalidateOnRefresh` ONLY HELPS IF SOMETHING REFRESHES — N4
       * =================================================================
       * The region chips are `<Link href="/?region=…#projects">`, so filtering
       * is a CLIENT-SIDE navigation: React re-renders the track's children and
       * nothing else happens. This effect does not re-run (`useGSAP` with empty
       * deps), no resize fires, and `ScrollTrigger.refresh()` is never called —
       * so `invalidateOnRefresh: true` has nothing to act on.
       *
       * MEASURED at 1440, clicking الهامة from the unfiltered rail:
       *
       *   cards        6      →  1
       *   scrollWidth  2696   →  1440   (travel 1256 → 0)
       *   pin-spacer   1992   →  1992   ⛔ unchanged
       *
       * i.e. 1,472px of pinned scroll for a rail with nothing left to move,
       * which is the same defect as the `end` floor above and strictly worse.
       * A fresh load of the same url recomputes correctly — this is only the
       * soft-navigation path.
       *
       * The signal is exactly "the cards changed", so that is what is watched.
       * Coalesced to one refresh per frame because React removes five <li>s in
       * five mutation records, and `refresh()` re-measures every trigger on the
       * page.
       * ============================================================== */
      let refreshFrame = 0;
      const onCardsChanged = () => {
        if (refreshFrame) return;
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = 0;
          ScrollTrigger.refresh();
        });
      };
      const cards = new MutationObserver(onCardsChanged);
      cards.observe(track, { childList: true });

      return () => {
        cards.disconnect();
        if (refreshFrame) cancelAnimationFrame(refreshFrame);
        viewport.removeEventListener("focusin", onViewportFocus);
        viewport.removeEventListener("scroll", onViewportScroll);
        timeline.scrollTrigger?.kill(true);
        timeline.kill();
        gsap.set(track, { clearProps: "transform" });
        gsap.set(pin, {
          clearProps: "transform,position,top,left,width,height,margin,padding",
        });
        // The sweep. If GSAP left its spacer behind, unwrap it by hand.
        const parent = pin.parentElement;
        if (
          parent?.classList.contains("pin-spacer") &&
          !ScrollTrigger.getById("projects-pin")
        ) {
          parent.replaceWith(pin);
        }
        rail.dataset.railMode = previousMode;
        ScrollTrigger.refresh();
      };
    });

    /* =====================================================================
     * STORY — the figure, ported from the live site, and the three cards
     * =====================================================================
     * SOVA §10 calls this entrance better than anything on either reference
     * site, so the numbers are the live site's, verbatim from `script.js`:
     * `y:76 scale:.88 rotation:1.4 opacity:0 clipPath:inset(18% 8% 18% 8%
     * round 54px)` with the inner image counter-scaling `1.16 → 1` at an
     * offset of −1.02s. Two deliberate changes, both from the brief:
     *   · the ease moves from `power4.out` to the house `expo.out` and the
     *     duration stretches 1.12s → 1.4s (SOVA §15.2 — the old cadence is
     *     the main reason the live site reads hurried);
     *   · the resting radius is 24px, not 34. `rounded-figure` is 24 in this
     *     system and the figure must land ON its own CSS, not near it.
     * ================================================================== */
    mm.add(OK, () => {
      const figure = document.querySelector<HTMLElement>("[data-story-figure]");
      if (figure) {
        const inner = figure.querySelector<HTMLElement>("[data-story-figure-inner]");
        const caption = figure.querySelector<HTMLElement>("figcaption");

        const storyTl = gsap
          .timeline({ scrollTrigger: { trigger: figure, start: ENTER, once: true } })
          .fromTo(
            figure,
            {
              y: 76,
              scale: 0.88,
              rotation: 1.4,
              opacity: 0,
              clipPath: "inset(18% 8% 18% 8% round 54px)",
            },
            {
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              duration: DUR.slow,
              ease: EASE,
              clearProps: "clipPath,transform",
            },
          )
          .fromTo(
            inner,
            { scale: 1.16 },
            { scale: 1, duration: 1.6, ease: EASE, clearProps: "transform" },
            "-=1.28",
          );

        /* ⛔ THE CAPTION STEP IS CONDITIONAL NOW, AND THE GUARD IS NOT
           DEFENSIVE PROGRAMMING. The <figcaption> was deleted from `story.tsx`
           on 2026-08-22 along with the last per-image concept badge, so
           `caption` is null on every load — and `gsap.from(null, …)` logged
           «GSAP target null not found» to the console on every visit to `/`.
           A warning, not an error, which is exactly why it would have sat
           there: nothing fails, the timeline just quietly loses its last step.

           ⚠️ `caption ?? []` DOES NOT FIX IT. An empty array is also a target
           GSAP cannot find, and it logs «GSAP target  not found» — the same
           noise with a blanker message. The step has to not exist.

           The lookup above is kept rather than deleted because the <figure> is
           still a <figure>: if a caption returns, this animates it again with
           no further change. */
        if (caption) {
          storyTl.from(
            caption,
            { y: 16, opacity: 0, duration: DUR.quick, ease: EASE },
            "-=0.9",
          );
        }
      }

      /* The three cards under the figure. `dirX` is not optional (§16.10). */
      const cards = document.querySelectorAll("[data-story-card]");
      if (cards.length) {
        gsap.from(cards, {
          x: dirX(42),
          opacity: 0,
          duration: DUR.base,
          stagger: 0.12,
          ease: EASE,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: cards[0], start: ENTER, once: true },
        });
      }

      /* =================================================================
       * LOCATION — the four area rows
       * =================================================================
       * SOVA hands this row to Framer as a `whileInView` on `motion.li`.
       * NEON kept it in GSAP deliberately, for two reasons: it would have
       * meant turning <LocationSection> into a client component to animate
       * four static rows, and — the real one — a one-shot entrance should
       * look the SAME everywhere on this page. Story cards, membership
       * steps and these rows are the same gesture, so they are the same
       * tween with the same ease and the same stagger band. Nothing else
       * touches these elements, so §15.1 holds either way.
       * ============================================================== */
      const areas = document.querySelectorAll("[data-location-area]");
      if (areas.length) {
        gsap.from(areas, {
          y: 26,
          opacity: 0,
          duration: DUR.base,
          stagger: 0.09,
          ease: EASE,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: areas[0], start: ENTER, once: true },
        });
      }

      /* =================================================================
       * MEMBERSHIP — the five conditions
       * ============================================================== */
      const conditions = document.querySelectorAll("[data-membership-condition]");
      if (conditions.length) {
        gsap.fromTo(
          conditions,
          { x: dirX(58), opacity: 0, scale: 0.965 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: DUR.base,
            stagger: 0.11,
            ease: EASE,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: conditions[0], start: ENTER, once: true },
          },
        );
      }

      /* =================================================================
       * HOW IT WORKS — the line draws, the markers fill gold behind it
       * =================================================================
       * ⛔ NOT A STROKE DASH. Both line shapes are 100×1 viewBoxes stretched
       * with `preserveAspectRatio="none"`, i.e. scaled ~10× on one axis and
       * 1× on the other. Under that transform Chrome does not resolve
       * `stroke-dasharray` against `pathLength`, and a full-length dash
       * renders as a DOTTED rule — five dashes across the row. Verified in
       * a screenshot; it is convincing enough to ship unnoticed, because a
       * dotted timeline looks like a decision. The draw is therefore a
       * `scale` on the <svg> with its transform-origin pinned to the axis's
       * start, which is immune to the whole problem and cheaper besides.
       *
       * ⛔ AND THE ORIGIN IS A MIRRORING BUG, WHICH IS NOT `dirX`'s JOB. An
       * SVG's user space does not mirror with `dir="rtl"` — x still grows to
       * the right inside the viewBox — but the WRAPPER is placed with
       * `start-*`/`end-*`, so the markers sit at the physical RIGHT here and
       * the row has to grow right-to-left. The inline shape therefore takes
       * `100% 50%` in RTL and `0% 50%` in LTR; the stacked mobile segments
       * run top to bottom, an axis with no direction problem, and always
       * take `50% 0%`. `data-process-line` names the axis so no breakpoint
       * check is needed in JS.
       * ============================================================== */
      const processTrack = document.querySelector<HTMLElement>(
        '[data-slot="process-track"]',
      );
      /* ⚠ `section && lines.length && markers.length` is a GUARD, not a
         `return`. It used to read `if (!lines.length) return` — inside this
         callback, which builds the president quote and the contact parallax
         BELOW it too, so a Process section that ever shipped without its line
         SVGs would have silently taken those two with it. A missing hook must
         cost its own block and nothing else. */
      const processSection =
        processTrack?.closest<HTMLElement>('[data-slot="section"]') ?? null;
      const processLines =
        processSection?.querySelectorAll<SVGSVGElement>("[data-process-line]") ?? [];
      const processMarkers =
        processSection?.querySelectorAll<HTMLElement>("[data-process-marker]") ?? [];

      if (processTrack && processSection && processLines.length && processMarkers.length) {
        const section = processSection;
        const lines = processLines;
        const markers = processMarkers;
        const goldRest = getComputedStyle(markers[0]).backgroundColor;
        const dim = resolveColor(section, "var(--line-strong)");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: processTrack,
            /* A wide range on purpose. The track is ~110px tall, so a tight
               start/end pair gave it barely 160px of scroll to draw in and the
               line snapped across the row. */
            start: "top 88%",
            end: "bottom 40%",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });

        lines.forEach((svg, i) => {
          const inline = svg.dataset.processLine === "inline";
          const axis = inline ? "scaleX" : "scaleY";
          gsap.set(svg, {
            transformOrigin: inline ? (isRtl() ? "100% 50%" : "0% 50%") : "50% 0%",
            [axis]: 0,
          });
          tl.to(svg, { [axis]: 1, duration: 1, ease: "none" }, inline ? 0 : i * 0.3);
        });

        gsap.set(markers, { backgroundColor: dim, scale: 0.55, transformOrigin: "50% 50%" });
        markers.forEach((marker, i) => {
          tl.to(
            marker,
            { backgroundColor: goldRest, scale: 1, duration: 0.18, ease: "none" },
            (i / Math.max(1, markers.length - 1)) * 0.86,
          );
        });
      }

      /* =================================================================
       * PRESIDENT — the quote fills in, from READABLE to EMPHASISED
       * =================================================================
       * ⛔ THE #1 RULE OF THIS SECTION. The live site ships the quote at 20%
       * opacity and fills it in on scroll — a sentence about Syrians who
       * lost their homes, invisible to anyone who lands mid-page, scrolls
       * fast, has JS fail, or asks for reduced motion (SOVA §10.5, and the
       * whole header of `president.tsx`). Here the resting colour is
       * `--fg-muted`, 8.94:1 on this ground, and the scrub moves it to
       * `--fg`. From readable TO emphasised. NEVER from invisible. If you
       * change the `fromTo` below so its `from` is anything lighter than
       * the resting colour, you have reinstated the worst bug on the old
       * site.
       *
       * `type: "words"`. NEVER `"chars"` — Arabic is cursive and per-glyph
       * elements sever every letter join (AGENTS §2).
       * ============================================================== */
      const quote = document.querySelector<HTMLElement>("[data-president-quote]");
      const quoteText = quote?.querySelector("p") ?? null;
      if (quote && quoteText) {
        /* The only non-null assertion this tree had (CHAMBER C3). A quote is
           always inside a Section, but `closest` cannot know that, and the
           fallback is exact rather than defensive: `--fg` is an inherited
           custom property, so resolving it against the quote itself gives the
           same colour the section would. */
        const section =
          quote.closest<HTMLElement>('[data-slot="section"]') ?? quote;
        const rest = getComputedStyle(quoteText).color;
        const emphasis = resolveColor(section, "var(--fg)");

        /* ---------------------------------------------------------------
         * SAGE — THE SAME BUG, WEARING ARIA THIS TIME.
         *
         * SplitText's default `aria: "auto"` puts `aria-label` on the <p>
         * and `aria-hidden="true"` on all 40 word elements. A <p> is
         * `role=paragraph`, whose name is PROHIBITED by ARIA — so the
         * label is spec-ignored, and screen readers, which announce a
         * paragraph's CONTENTS rather than its name, are left with forty
         * hidden words and nothing to read. axe-core flags it
         * `aria-prohibited-attr`, serious, WCAG 4.1.2. The visual bug from
         * SOVA §10.5 was fixed and the same sentence went invisible again,
         * to a different audience.
         *
         * So: hide the animated copy outright (`aria: "hidden"`) and
         * publish one unsplit, visually-hidden twin for assistive tech.
         * It is created HERE, in the client, and never on the server —
         * without JS the document keeps exactly one readable paragraph and
         * nothing is announced twice.
         * ------------------------------------------------------------ */
        if (!quote.querySelector("[data-quote-sr]")) {
          const srTwin = document.createElement("p");
          srTwin.className = "sr-only";
          srTwin.setAttribute("data-quote-sr", "");
          srTwin.textContent = quoteText.textContent;
          quote.appendChild(srTwin);
        }

        SplitText.create(quoteText, {
          type: "words",
          autoSplit: true,
          aria: "hidden",
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { color: rest },
              {
                color: emphasis,
                stagger: 0.4,
                ease: "none",
                scrollTrigger: {
                  trigger: quote,
                  /* Wide: the fill has to still be running while the sentence
                     is being read, not finish the moment it appears. */
                  start: "top 92%",
                  end: "bottom 45%",
                  scrub: SCRUB,
                  invalidateOnRefresh: true,
                },
              },
            );
          },
        });
      }

      /* =================================================================
       * CONTACT — the night render breathes behind the scrim
       * =================================================================
       * The scrim is a SIBLING of this layer and is deliberately NOT
       * scaled with it: scale the scrim too and the render's edges crawl
       * out from under it (JETT's note in `contact.tsx`).
       * ============================================================== */
      const contactBg = document.querySelector<HTMLElement>("[data-contact-bg]");
      if (contactBg) {
        gsap.to(contactBg, {
          scale: 1.08,
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: contactBg.closest('[data-slot="section"]'),
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });
      }

      return () => {};
    });

    /* =====================================================================
     * INTERIOR — three rotating clip origins, then column parallax
     * =====================================================================
     * `≥768px` only: below that the columns stack, and a per-column offset
     * on a stacked layout is not depth, it is misalignment. The parallax is
     * `yPercent`, never px — SOVA is explicit that the live site's
     * `y: -70/-150/-105` does not scale across viewports, and the amount
     * each column should drift is a fraction of its own height.
     * ================================================================== */
    mm.add({ base: OK, lateral: TABLET_UP }, (self) => {
      if (!self.conditions?.base) return;

      /* ⛔ THE 9px OVERFLOW BUG — DO NOT REINSTATE THE LATERAL OFFSET BELOW 768.
         The `x` offsets below are a PRE-TRIGGER RESTING STATE: every figure
         sits at its `from` transform from first paint until its own
         ScrollTrigger fires, which for the gallery is several screens down.
         At 430px the third origin's `dirX(-48)` (plus ~4px of rotated
         bounding box) parked the figure 8.6px past the document's inline-END
         edge, and mobile Chrome answers horizontal overflow by WIDENING the
         layout viewport — so `innerWidth` became 439, every `position:fixed`
         element (the header and its backdrop) sized itself to the widened
         ICB at `left:-9`, and the RTL scroll origin shifted by the same 9px.
         The header was the visible symptom; this line was the cause.

         Below 768 the columns stack full-width, so a ±48/54px lateral start
         is not depth here either — it is the same misalignment the parallax
         block below already refuses to do. `y`, `rotation` and the clip
         origins still run at every width; only the horizontal travel is
         gated. */
      const lateral = self.conditions.lateral ? 1 : 0;

      const figures = document.querySelectorAll<HTMLElement>("[data-interior-figure]");

      figures.forEach((figure) => {
        const origin = Number(figure.dataset.clipOrigin ?? 0) % 3;
        const inner = figure.querySelector<HTMLElement>("[data-interior-figure-inner]");
        const caption = figure.querySelector<HTMLElement>("figcaption");

        /* The three origins, ported from the live site's `galleryOrigins`.
           `x` goes through `dirX`; the `inset()` percentages are physical by
           definition and were authored in this same RTL document, so they
           stay as written (SOVA §16.11 — clip-path does not mirror either). */
        const from = [
          {
            y: 92,
            x: dirX(0 * lateral),
            rotation: 1.4,
            clipPath: "inset(28% 0 0 0 round 40px)",
          },
          {
            y: 58,
            x: dirX(54 * lateral),
            rotation: -1.2,
            clipPath: "inset(0 22% 0 0 round 40px)",
          },
          {
            y: 82,
            x: dirX(-48 * lateral),
            rotation: 1,
            clipPath: "inset(22% 8% 10% 8% round 40px)",
          },
        ][origin];

        gsap
          .timeline({ scrollTrigger: { trigger: figure, start: "top 90%", once: true } })
          .fromTo(
            figure,
            { ...from, opacity: 0, scale: 0.9 },
            {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              duration: DUR.base,
              ease: EASE,
              clearProps: "transform,opacity,clipPath",
            },
          )
          .fromTo(
            inner,
            { scale: 1.14 },
            { scale: 1, duration: 1.5, ease: EASE, clearProps: "transform" },
            "-=1.1",
          )
          .from(caption, { y: 16, opacity: 0, duration: DUR.quick, ease: EASE }, "-=0.85");
      });

      return () => {};
    });

    mm.add(TABLET_UP, () => {
      const gallery = document.querySelector<HTMLElement>(
        '[data-slot="interior-gallery"]',
      );
      const columns = document.querySelectorAll<HTMLElement>("[data-interior-column]");
      if (!gallery || !columns.length) return;

      const tweens = Array.from(columns).map((column) =>
        gsap.to(column, {
          yPercent: Number(column.dataset.parallaxY ?? 0),
          ease: "none",
          scrollTrigger: {
            trigger: gallery,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        }),
      );

      return () => tweens.forEach((tween) => tween.kill());
    });

    /* =====================================================================
     * THE REFRESH GUARD (SOVA §15.5)
     * =====================================================================
     * Every start/end above is a pixel offset measured once. Anything that
     * changes the document's height after that — an accordion opening, the
     * region filter swapping six cards for two, a font swap reflowing the
     * headings, an image finishing decode — leaves every trigger below it
     * pointing at the wrong scroll position.
     *
     * One ResizeObserver on <body> catches all of them, which is why there is
     * no `onValueChange` hook in the FAQ and no callback in the region filter:
     * those would each be a place to forget one.
     *
     * DEBOUNCED, NOT COALESCED PER FRAME. An accordion opening animates its
     * height for ~200ms, so the observer fires a dozen times; a per-frame
     * refresh would recompute every trigger on the page a dozen times, and a
     * refresh that lands mid-scroll while the projects rail is pinned can make
     * the pin jump. One refresh, 180ms after the last change, is both cheaper
     * and steadier.
     * ================================================================== */
    let queued: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(queued);
      queued = setTimeout(() => ScrollTrigger.refresh(), 180);
    };

    let lastHeight = document.body.scrollHeight;
    const observer = new ResizeObserver(() => {
      const height = document.body.scrollHeight;
      if (Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;
      refresh();
    });
    observer.observe(document.body);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      clearTimeout(queued);
      observer.disconnect();
      /* `useGSAP`'s context already reverts a matchMedia created inside it, so
         this is belt-and-braces — but `revert()` is idempotent and it makes
         the teardown legible without having to know that. */
      mm.revert();
    };
  }, []);

  return <span ref={anchor} hidden aria-hidden />;
}
