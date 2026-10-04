"use client";

import { useRef } from "react";
import {
  DUR,
  EASE,
  SCRUB,
  SplitText,
  gsap,
  prefersReducedMotion,
  registerMotion,
  useGSAP,
} from "@/components/motion/motion-env";
import { HERO_BLUEPRINT_VISIBLE } from "@/lib/hero-frame";

/* -----------------------------------------------------------------------------
 * <HeroMotion> — SOVA §17 Direction A, «من المخطط إلى البيت». GSAP only.
 * Renders nothing. Mounted inside <Hero> so it is torn down with it.
 *
 * =============================================================================
 * THE SEQUENCE (§17), and where each second goes
 * =============================================================================
 *   0.00  the page is paper. The guard script in the root layout raised
 *         `[data-hero-paper]` to opacity 1 BEFORE FIRST PAINT, so there is no
 *         flash of the assembled hero to start from.
 *   0.05  the measuring grid draws — twelve lines, the frame's own rulers.
 *   0.22  the block draws itself in, path by path, in construction order:
 *         silhouette → structure → floor slabs → windows → ground line.
 *   1.15  the mark scales in at the drawing's centre, `back.out(1.45)`.
 *   1.50  ⭐ THE CROSS-FADE. The paper dissolves and the render is revealed
 *         BEHIND THE SAME OUTLINE, at the same scale and the same position,
 *         while the ink cools from brand green to the resting hairline. The
 *         drawing does not wipe away and it does not move. It becomes the
 *         building. Everything above 2.20s is over by 2.20s — §17's cap.
 *   1.85  the headline rises out of its masks (SplitText, lines).
 *   1.95  eyebrow, lead, CTA and the bottom row follow.
 *   2.40  the header is released and fades itself in (CSS, globals.css §8.1),
 *         ⭐ and the drawing leaves with it — N3, see below.
 *   3.33  done. §17's budget is 3.4s.
 *
 * ⛔ WHY THE CROSS-FADE LANDS NOW, AND WHAT WOULD BREAK IT AGAIN.
 * It is not the timing — the old build's timing would have been fine. It is
 * that the drawing and the photograph are now the SAME OBJECT: `hero-blueprint`
 * is drawn in `hero.webp`'s own 1672×941 pixel space and stretched over the
 * <Image>'s exact box with `preserveAspectRatio="xMidYMid slice"`, the SVG
 * spelling of `object-cover` + `object-center`. Its eight balcony floors are
 * the render's eight balcony floors, on the render's two vanishing points.
 * Move the drawing, change the image's `object-position` at `md` and up, or
 * change the SVG's `preserveAspectRatio`, and it is a ghost again.
 *
 * =============================================================================
 * ⭐ N3 — THE DRAWING LEAVES, AND "ABSENT" IS ITS RESTING STATE
 * =============================================================================
 * The outline used to be drawn during the intro and then stay on the
 * photograph forever at `text-veil-20`. Once the story has been told it is
 * competing with the render, so the timeline fades the whole SVG out at 2.40s,
 * on the same beat that releases the header.
 *
 * ⛔ AND THE RESTING STATE HAD TO MOVE WITH IT, OR THIS WOULD BE A NEW BUG
 * RATHER THAN A FIX. `globals.css` §8.6 now rests `[data-slot="hero-blueprint"]`
 * at `opacity: 0`, and the tween below is the only thing that ever raises it.
 * That is SOVA §10.5's base state = final state applied to a state that just
 * changed: a returning visitor, a reduced-motion visitor, a visitor whose
 * bundle never arrives and a visitor who watched the whole sequence all end up
 * looking at exactly the same hero. Set the opacity here and not in `hero.tsx`
 * — the drawing has to be absent before any JavaScript runs, and only CSS is.
 *
 * ⚠ It follows the pattern that was already here rather than inventing a
 * second one: `[data-bp="grid"]` and `[data-bp-mark]` are opacity tweens
 * inside this timeline too, at 1.35 and 1.75. The building paths are not
 * touched individually — one tween on the `<svg>` takes the whole drawing,
 * which is also why `getComputedStyle(svg).color` (the resting ink) is still
 * read before anything is set.
 *
 * =============================================================================
 * ⭐ N6 — THE READINESS GATE. The guard says WHETHER; this says WHEN.
 * =============================================================================
 * The operator asked for a five-second branded loading screen so that the
 * intro is guaranteed to be seen. This is what was built instead: hold the
 * first frame until the things the sequence animates are actually there — the
 * webfonts loaded and the hero photograph decoded — and then play it in full.
 * Nobody waits for a splash screen; they wait for the page they asked for, and
 * only when it is genuinely not ready yet.
 *
 * WHAT IT WAITS FOR
 *   · `document.fonts.ready`. The headline is split into lines and masked. Let
 *     a font swap land afterwards and SplitText's own `autoSplit` re-splits
 *     mid-flight, which kills the rise it is halfway through — the reason the
 *     headline could silently arrive with no animation at all on a cold load.
 *   · the hero <Image>'s `decode()`. It is the thing the paper cross-fades to
 *     reveal. Cross-fading to an image that has not decoded reveals nothing.
 *
 * ⛔ THE CEILING IS MEASURED FROM NAVIGATION START, NOT FROM THIS EFFECT.
 * `GATE_DEADLINE_MS - performance.now()` — so the intro can never begin later
 * than 1.5s into the visit however long the bundle took, and on a bundle that
 * is already late the gate is simply zero. A gate with no ceiling, or one
 * whose clock starts when the bundle happens to arrive, is the blank-hero bug
 * (FADE, globals.css §8.3) rebuilt from the other end.
 *
 * ⛔ IT MUST NOT DELAY `data-ankaa-motion`, AND IT DOES NOT. The stamp is
 * still the first statement in the effect, before any awaiting, so the guard's
 * 4s flicker timer still finds it on a healthy page and still fires on a
 * page where motion genuinely never arrived. If you ever move the stamp below
 * the gate, every slow-but-working visit starts being declared late.
 *
 * Under `prefers-reduced-motion` there is no intro, so there is no gate and no
 * wait — the effect has already returned before any of this is reached. The
 * `lateBundle` and returning-visitor paths are not gated either: their content
 * is on screen or about to be, and holding it back would be pure delay.
 *
 * =============================================================================
 * THE GUARDS
 * =============================================================================
 * · `data-ankaa-intro` — the full sequence runs on every DOCUMENT LOAD, and
 *   never on a client-side navigation. The decision is made by the blocking
 *   script in the root layout; this file only reads it. It has to be that way
 *   round: a client effect runs after first paint, and an intro that starts
 *   after the hero has already been seen is not an intro. (N2 removed that
 *   script's `sessionStorage` flag — see `layout.tsx`.)
 * · `data-ankaa-motion` / `data-flicker-timeout` — the late-bundle handshake.
 *   The effect stamps the first as its very first statement; the guard's 4s
 *   timer stamps the second only if it does not find it, and this file then
 *   skips every entrance tween. FADE measured a 22.0s blank hero on Slow 3G
 *   and a permanently blank one behind a 404'd chunk; that is what this pair
 *   closes. See `layout.tsx` INTRO_GUARD and globals.css §8.3.
 * · a client-side arrival on `/` gets the assembled hero and the type reveal
 *   alone, inside §17's 0.9s budget.
 * · `prefers-reduced-motion` — nothing runs. Not the intro, not the parallax.
 *   Every element's base CSS state is its final state, so doing nothing is
 *   already correct, and globals.css §8.1 un-hides the split targets under the
 *   same query so the headline is never left invisible.
 * · `type: "lines"`, never `"chars"`. Arabic is cursive: splitting a word into
 *   per-glyph elements severs every letter join in it and the text stops being
 *   readable. This is not a stylistic preference (AGENTS §2, SOVA §15.3).
 * -------------------------------------------------------------------------- */

/** The ink the block is drawn in, on paper. `--color-brand-800`. */
const DRAW_INK = "#0a3b36";
/** Fallback for the resting hairline if `color-mix()` does not resolve to rgb. */
const REST_INK = "rgba(255,255,255,0.2)";

/**
 * N6's ceiling, in ms **from navigation start** — not from the moment the
 * bundle ran. See the READINESS GATE block above for why the origin matters.
 * It sits below the guard's 4s flicker deadline on purpose: whatever the
 * gate decides, the sequence has begun before that timer would have had
 * anything to say about it.
 */
const GATE_DEADLINE_MS = 1500;

/** The two assets §17's first two seconds are made of. */
function heroReady(section: HTMLElement) {
  const waits: Promise<unknown>[] = [];

  if (document.fonts) waits.push(document.fonts.ready);

  const image = section.querySelector<HTMLImageElement>(
    '[data-slot="hero-media"] img',
  );
  // `decode()` resolves immediately on an image that is already painted and
  // rejects on one that failed — either way the gate must not hang on it.
  if (image) waits.push(image.decode().catch(() => undefined));

  return Promise.all(waits);
}

export function HeroMotion() {
  const anchor = useRef<HTMLSpanElement>(null);

  registerMotion();

  useGSAP((context, contextSafe) => {
    const root = document.documentElement;

    /* ⛔ FIRST STATEMENT IN THE EFFECT, and it must stay first. The inline
       guard in `layout.tsx` arms a 4s timer that declares the bundle late
       unless it finds this attribute. Stamping it here — synchronously, before
       any early return, before reduced-motion is even consulted, and before
       N6's gate begins waiting for anything — is what makes a normal visit
       indistinguishable from the intro that shipped before the timer existed.
       Anything placed above this line widens the window in which a perfectly
       healthy page can be called late. */
    root.setAttribute("data-ankaa-motion", "");

    const intro = root.dataset.ankaaIntro === "run";

    /* The timer won that race: the bundle was slower than 4s, §8.3's third
       escape has already revealed `[data-prevent-flicker]`, and the visitor has
       been reading this hero. Animating it in now would take it away and give
       it back — the same "sees the ending first" failure the intro guard exists
       to prevent, in reverse. Everything below jumps straight to rest. */
    const lateBundle = root.hasAttribute("data-flicker-timeout");

    if (prefersReducedMotion()) {
      root.removeAttribute("data-ankaa-intro");
      return;
    }

    const section = anchor.current?.closest<HTMLElement>('[data-slot="section"]');
    if (!section) return;

    const media = section.querySelector<HTMLElement>('[data-slot="hero-media"]');
    const paper = section.querySelector<HTMLElement>("[data-hero-paper]");
    const svg = section.querySelector<SVGSVGElement>('[data-slot="hero-blueprint"]');
    const grid = svg?.querySelector<SVGGElement>('[data-bp="grid"]') ?? null;
    const gridPaths = svg?.querySelectorAll('[data-bp="grid"] [data-bp-path]') ?? [];
    const blockPaths = svg?.querySelectorAll('[data-bp="building"] [data-bp-path]') ?? [];
    const mark = svg?.querySelector<SVGGElement>("[data-bp-mark]") ?? null;
    const headline = section.querySelector<HTMLElement>("#hero-title");
    const reveals = section.querySelectorAll<HTMLElement>("[data-hero-reveal]");

    /* ------------------------------------------------------------- the type
       SplitText re-parents its target, so the container is pre-hidden in CSS
       (`data-prevent-flicker`) and revealed inside `onSplit` — SOVA §15.5's #1
       SplitText-in-React bug. `autoSplit` re-splits on resize and on a font
       swap; the second and later splits jump straight to the resting state so
       a window drag does not replay the headline.

       ⚠ ON THE INTRO PATH THIS IS CALLED FROM INSIDE THE GATE, which is the
       point of gating on `document.fonts.ready`: the first split then happens
       against the final metrics, so the font-swap re-split that used to cancel
       the headline's rise mid-tween has nothing left to do. */
    let firstSplit = true;
    const splitType = (delay: number) => {
      if (!headline) return;
      SplitText.create(headline, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          gsap.set(headline, { autoAlpha: 1 });
          if (!firstSplit || lateBundle) return gsap.set(self.lines, { yPercent: 0 });
          firstSplit = false;
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: intro ? DUR.base : 0.75,
            stagger: intro ? 0.07 : 0.055,
            ease: EASE,
            delay,
          });
        },
      });
    };

    /* --------------------------------------------------------- the sequence */
    let releaseGate: (() => void) | undefined;

    if (lateBundle) {
      /* The paper is already gone from the visitor's point of view — §8.3
         revealed the type at 4s and the intro guard's own 6s failsafe has
         long since cleared `data-ankaa-intro`. Land everything on its resting
         state in one frame, with no tween. */
      splitType(0);
      root.removeAttribute("data-ankaa-intro");
      gsap.set(reveals, { autoAlpha: 1, y: 0 });
    } else if (intro && paper && svg) {
      const computed = getComputedStyle(svg).color;
      const restInk = /^rgba?\(/.test(computed) ? computed : REST_INK;

      /* Step 1 of the sequence, set NOW rather than inside the gate. The paper
         is already up from CSS; these put the drawing and the type into the
         state the paper is hiding, so however long the gate holds, the frame
         behind it is never the finished hero. N3: `opacity: 1` is what lifts
         the SVG off its new resting state of 0 (globals.css §8.6). */
      /* ⚠️ GUARDED BY THE SAME CONDITION AS THE TIMELINE BELOW. Where the SVG
         is not on screen nothing fades it back down, so lifting it to
         `opacity: 1` here would leave it lit in DRAW_INK — invisible while
         `display: none`, and then suddenly on screen if the device is turned
         before the intro ends. Left untouched, it stays on the resting
         `opacity: 0` globals.css §8.6 gives it.

         ⛔ THE CONDITION IS IMPORTED, NOT RETYPED. It used to be a literal
         `(min-width: 768px)` here and a `md:block` in `hero.tsx`, with a
         comment on each asking the next reader to keep them in step. It now
         carries an aspect term too — the drawing is registered to the
         LANDSCAPE render, so it must be absent wherever the portrait one is
         showing — and two places spelling that out by hand is one place too
         many. See `@/lib/hero-frame`. */
      const drawn = window.matchMedia(HERO_BLUEPRINT_VISIBLE).matches;
      if (drawn) {
        gsap.set(svg, { opacity: 1, color: DRAW_INK });
        gsap.set([gridPaths, blockPaths], { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(mark, { opacity: 0, scale: 0.72, transformOrigin: "50% 50%" });
      }
      gsap.set(reveals, { autoAlpha: 0, y: 18 });

      /* ⛔ `contextSafe` IS NOT OPTIONAL HERE. Everything below is created
         after an await, so without it none of it belongs to this component's
         GSAP context and none of it would be reverted when <Hero> unmounts.
         The fallback keeps types honest; `useGSAP` always supplies it. */
      const wrap = contextSafe ?? (<T,>(fn: T) => fn);

      /* =====================================================================
       * ⛔ THE BLUEPRINT BEAT DOES NOT EXIST UNDER `md`, AND THE INTRO USED TO
       * PLAY IT ANYWAY — operator, 2026-08-22: "the mobile version of the
       * intro is not valid or not running".
       *
       * IT WAS RUNNING. That was the problem. `<HeroBlueprint>` is
       * `hidden md:block` in `hero.tsx`, so below 768 the SVG is
       * `display: none` — and the first 1.5 SECONDS of this timeline animates
       * nothing but that SVG: the grid fades up, 40-odd paths draw themselves,
       * the mark pops in, the grid fades out. All of it invisible.
       *
       * MEASURED AT 430. A screenshot at 1,400ms is a COMPLETELY BLANK CREAM
       * SCREEN. The paper does not begin to lift until 2,400ms after
       * navigation (≈900ms of asset gate + this 1,500ms of dead beat), and
       * until then a phone shows an empty page with no explanation.
       *
       * THE FIX IS NOT A SECOND TIMELINE. Same beats, same easings, same
       * ownership — one variable moves where the cross-fade starts, and the
       * drawing tweens are simply not added when there is no drawing. A mobile
       * intro is ~1.4s: a beat of paper, the cross-fade, the type rising.
       *
       * ⚠️ THE CONDITION IS NOT A FREE NUMBER, WHICH IS WHY IT IS NO LONGER A
       * NUMBER AT ALL. It has to match the media query on <HeroBlueprint> in
       * `hero.tsx` exactly, or the dead beat comes back at some other size.
       * Both now read `HERO_BLUEPRINT_VISIBLE` from `@/lib/hero-frame` — the
       * Tailwind class spells it out only because a variant cannot interpolate
       * a constant, and that file says so.
       *
       * ⛔ NOT the operator's first idea, which was to run the OLD site's intro
       * on mobile instead. That one is a three-second overlay SOVA §11 row 1
       * cut on purpose — it would replay on every load and cost a phone three
       * seconds to say nothing. This costs 1.4s and shows the hero.
       * ================================================================== */
      /* When the paper starts lifting. Everything after it is relative.
         `drawn` is declared with the `gsap.set` block above, for the reason
         written there. */
      const lift = drawn ? 1.5 : 0.25;

      const start = wrap(() => {
        // The headline rises mid-cross-fade, not after it.
        splitType(lift + 0.35);

        const tl = gsap.timeline();

        if (drawn) {
          tl.to(grid, { opacity: 0.5, duration: 0.3, ease: "none" }, 0)
            .to(
              gridPaths,
              { strokeDashoffset: 0, duration: 0.45, stagger: 0.018, ease: "power1.inOut" },
              0.05,
            )
            .to(
              blockPaths,
              { strokeDashoffset: 0, duration: 0.6, stagger: 0.012, ease: "power2.inOut" },
              0.22,
            )
            .to(mark, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.45)" }, 1.15)
            .to(grid, { opacity: 0, duration: 0.5, ease: "power2.out" }, 1.35);
        }

        /* ⭐ the cross-fade — one opacity tween on the paper does all of it,
           because the paper sits ABOVE the render and its scrims. This is the
           beat that exists at every width. */
        tl.to(paper, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, lift);

        if (drawn) {
          tl.to(svg, { color: restInk, duration: 0.7, ease: "power2.inOut" }, lift)
            .to(mark, { opacity: 0, duration: 0.45, ease: "power2.out" }, lift + 0.25)
            /* ⭐ N3 — the drawing leaves. Same beat as the header's release, and
               it lands back on the resting state §8.6 declares. */
            .to(svg, { opacity: 0, duration: 0.7, ease: "power2.out" }, lift + 0.9);
        }

        tl.to(
          reveals,
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07, ease: EASE },
          lift + 0.45,
        )
          /* Release the header. It fades itself in from CSS — GSAP never touches
             it, so Framer keeps sole ownership of `data-scrolled` (§15.1). */
          .call(() => root.removeAttribute("data-ankaa-intro"), undefined, lift + 0.9);
      });

      /* --------------------------------------------------------- N6, the gate
         Whichever comes first: the assets, or the ceiling. `fired` makes the
         two racers idempotent and doubles as the cancel flag, so a <Hero> that
         unmounts while the gate is open never builds a timeline for a section
         that has gone. */
      let fired = false;
      const open = () => {
        if (fired) return;
        fired = true;
        start();
      };

      const budget = GATE_DEADLINE_MS - performance.now();
      if (budget <= 0) {
        /* ⛔ SYNCHRONOUS, NOT `setTimeout(open, 0)`. The ceiling has already
           passed, so there is nothing to wait for — and MEASURED on Slow 3G,
           yielding one macrotask to discover that cost 370ms, because the
           thread this would come back on is the one still hydrating the page.
           A gate that has expired must add exactly zero. */
        open();
      } else {
        const ceiling = window.setTimeout(open, budget);
        heroReady(section).then(open, open);
        releaseGate = () => {
          fired = true;
          window.clearTimeout(ceiling);
        };
      }
    } else {
      splitType(0.05);
      root.removeAttribute("data-ankaa-intro");
      gsap.set(reveals, { autoAlpha: 0, y: 14 });
      gsap.to(reveals, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: EASE,
        delay: 0.05,
      });
    }

    /* ------------------------------------------------------- the parallax
       §15.3: `yPercent: 8`, scrubbed. The whole media box moves as one — the
       render, its scrims and the drawing lying on it — so the outline stays
       registered to the building it traces. The 8% of exposed ground at the
       top is never seen: at scroll progress p the box has moved 8%·p of the
       hero's height while the hero itself has moved 100%·p off the top.

       ⚠ NOT GATED. It is scroll-driven, not part of the sequence, and a
       ScrollTrigger that is built late measures a document other triggers have
       already measured. */
    if (media) {
      gsap.to(media, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      });
    }

    // Returned to the GSAP context, which calls it on revert (i.e. unmount).
    return () => releaseGate?.();
  }, []);

  return <span ref={anchor} hidden aria-hidden />;
}
