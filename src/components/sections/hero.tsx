import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Accent, Display, Lead } from "@/components/layout/typography";
import { HeroMotion } from "@/components/motion/hero-motion";
import { HeroBlueprint } from "@/components/sections/hero-blueprint";
import { Button } from "@/components/ui/button";
import { hero } from "@/content/hero";
import { HERO_LANDSCAPE, HERO_PORTRAIT } from "@/lib/hero-frame";

/* -----------------------------------------------------------------------------
 * <Hero> — SOVA §17 Direction A, «من المخطط إلى البيت».
 *
 * WHAT THIS FILE IS: the structure and the FINAL RESTING STATE. Not the
 * animation — NEON owns motion. Everything below is what the visitor sees when
 * the sequence has finished, and it is also what they see if the sequence never
 * runs: JS disabled, script failed, reduced motion, or a returning visitor.
 * Base state = final state, always (SOVA §10.5).
 *
 * WHAT IS HERE
 *   · 100svh, dark ground (surface-1), the real render behind a solid scrim
 *     — ART-DIRECTED: a landscape render for landscape boxes, a portrait one
 *     for portrait boxes. See `@/lib/hero-frame` for why and where they swap
 *   · type in the RTL start (right) column. TWO measures: the headline on
 *     its own `em` measure so it tracks the type scale, prose at 44rem —
 *     see the block on the column below, it is a fixed bug not a style
 *   · display-1 over two lines, the second in <Accent> — the section's ONE gold
 *     element (AGENTS §8), which is why the eyebrow's rule is NOT gold and the
 *     CTA is the solid variant rather than the gold one
 *   · exactly one primary CTA
 *   · the blueprint line drawing, resting as a watermark over the building mass
 *   · scroll cue bottom inline-start, «من المخطط — إلى البيت» bottom inline-end
 *
 * WHAT IS DELIBERATELY NOT HERE (SOVA §11 row 1, §10.7)
 *   the region picker · the ٦ stamp card · the decorative arc and its
 *   0 0 0 50vw halo rings · the grain layer · the second CTA.
 *   The ornament gets cut, not ported. If the hero needs decoration to be
 *   interesting, the photograph is the problem.
 *
 * NEON — the hooks you asked for:
 *   [data-slot="hero-blueprint"]  the drawing, stroke-drawable paths
 *   [data-slot="hero-media"]      the render + scrims (parallax target)
 *   [data-hero-line]              the two headline lines, for a mask reveal
 *   [data-hero-reveal]            eyebrow / lead / CTA / bottom row, in order
 *   The cross-fade in §17 step 4 (paper ground → dark ground, drawing → render)
 *   is yours to build; this file is where it lands.
 *
 * =============================================================================
 * WHAT NEON CHANGED HERE (three things, all of them the cross-fade)
 * =============================================================================
 *
 * 1. THE DRAWING NOW SITS ON THE BUILDING. It was a 23rem watermark parked in
 *    the corner at `bottom-[13%] end-[5%]`, which is why the fade read as a
 *    ghost artifact — SOVA §17's one stated risk. It is now stretched over the
 *    SAME BOX as the <Image>, in the render's own 1672×941 coordinate space,
 *    with `preserveAspectRatio="xMidYMid slice"` mirroring `object-cover`
 *    `object-center`. The two crops are then identical at every viewport width
 *    with no breakpoint maths. See the header of `hero-blueprint.tsx` — the
 *    geometry was re-measured against this photograph.
 *
 *    ⛔ `md:object-center` on the <Image> and `xMidYMid` on the SVG are ONE
 *    setting written twice. Change either and the alignment silently drifts.
 *
 * 2. THE PAPER GROUND, `[data-hero-paper]`. §17 step 1 opens on paper and
 *    step 4 dissolves it to reveal the render behind the same outline. It
 *    rests at opacity 0 — i.e. invisible, i.e. the finished hero — and the
 *    inline guard script in the root layout raises it to 1 *before first paint*
 *    on a first visit only, so there is no flash of the assembled hero before
 *    the sequence starts. Its `[data-hero-paper]` rule lives in globals.css §8.
 *
 * 3. `data-prevent-flicker` on the type. SplitText re-parents its target, so
 *    the lines must be hidden until `onSplit` has run or they flash unsplit
 *    (SOVA §15.5, the #1 SplitText-in-React bug). globals.css §8 pre-hides
 *    them AND un-hides them again under `(scripting: none)` and under
 *    `prefers-reduced-motion` — so no-JS and reduced-motion visitors still get
 *    a headline. Base state = final state survives.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function Hero() {
  /* Both renders, through the image optimiser, without rendering either yet.
     `fill` is what the old <Image> used; it resolves to the absolute inset-0
     box the <img> below is styled into. */
  const common = { alt: hero.imageAlt, fill: true, priority: true, sizes: "100vw" };
  const { props: landscape } = getImageProps({ ...common, src: "/images/hero.webp" });
  const { props: portrait } = getImageProps({
    ...common,
    src: "/images/main-vertical.webp",
  });

  return (
    <Section
      theme="dark"
      surface={1}
      space="none"
      container={false}
      aria-labelledby="hero-title"
      className="flex min-h-svh flex-col overflow-hidden"
    >
      {/* NEON's client island. Renders nothing; owns the §17 sequence and the
          scrubbed parallax on [data-slot="hero-media"]. */}
      <HeroMotion />

      {/* ---------------------------------------------------------------- media
          The render, then the scrim, then the drawing. The scrim is solid
          enough that no type — and no gold — ever sits on bare photograph. */}
      <div data-slot="hero-media" className="absolute inset-0 -z-10">
        {/* ⭐ ART DIRECTION — TWO RENDERS, ONE DOWNLOAD.
            This used to be a single landscape <Image> framed at
            `object-[38%_50%]` below `md`, and that framing was fighting a
            problem it could not win: see `@/lib/hero-frame` for the measured
            share of the frame that `object-cover` was throwing away (73% at
            430, and the tower's roof with it). A focal point cannot help when
            the subject is wider than the box. A portrait render can.

            ⛔ IT IS A <picture>, BUILT FROM `getImageProps()`, AND THAT IS THE
            WHOLE REASON THIS IS NOT A PLAIN <img>. next/image cannot art-direct
            on its own, and two <Image>s hidden by CSS would download BOTH (a
            `display: none` <img> is still fetched). `getImageProps` hands the
            optimiser's own `srcSet` to each <source>, so this keeps the AVIF
            negotiation and the DPR variants `next.config.ts` was measured
            around, and the browser fetches exactly one of them.

            The `<img>` carries the LANDSCAPE props as the fallback, so a
            browser that ignores <source> gets the render that was already
            shipping. `[data-slot="hero-media"] img` still matches it, which is
            what N6's readiness gate waits on in `hero-motion.tsx`. */}
        <picture>
          <source media={HERO_PORTRAIT} srcSet={portrait.srcSet} />
          <source media={HERO_LANDSCAPE} srcSet={landscape.srcSet} />
          {/* Not a lint escape: `@next/next/no-img-element` does not fire on an
              <img> inside a <picture>, which is the rule's own carve-out for
              art direction. This IS a next/image — `getImageProps` returns its
              props by design. */}
          <img
            {...landscape}
            alt={hero.imageAlt}
            /* ⛔ `object-center` FOR THE LANDSCAPE RENDER, UNCONDITIONALLY, and
               that is a simplification the swap paid for. The old
               `md:object-center` existed so the blueprint's `xMidYMid slice`
               had something to agree with at `md` and up, while below it the
               landscape render was pulled to 38% to chase the building. The
               portrait render now owns every box where the building would have
               been chased, so the landscape one is centred everywhere and the
               SVG's `xMidYMid` is simply true — there is no width at which the
               two disagree.

               THE SECOND RULE IS THE PORTRAIT RENDER'S, and it is scoped to
               the same query that selects it, because one <img> carries one
               className for both <source>s. `50% 35%` biases the frame UP.
               MEASURED: it does nothing at all on a phone — at 430x932 the
               portrait image is taller than it is wide relative to the box, so
               `object-cover` crops horizontally only and the vertical
               component is inert. It earns its place in the 0.85–1.0 band, a
               desktop window dragged narrow, where the box is nearly square
               and the crop turns vertical: at 900x900 centring cut BOTH the
               tower's roof and its base, and 35% keeps the roof — the thing
               that makes it read as a tower rather than a wall. */
            className="absolute inset-0 size-full object-cover object-center [@media(max-aspect-ratio:1/1)]:object-[50%_35%]"
          />
        </picture>

        {/* Vertical scrim: seats the header at the top and the bottom row at
            the foot. Direction-neutral, so nothing to mirror. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_39_36/0.62)_0%,rgb(0_39_36/0.30)_40%,rgb(0_39_36/0.92)_100%)]"
        />
        {/* Inline scrim, authored for RTL: `to left` puts the dense end at the
            physical right edge, which is the INLINE-START edge where the type
            column lives. CSS gradients do not mirror (SOVA §16.11) — if this
            document ever becomes LTR, this one declaration must flip.

            The stops are not taste. Composited against the brightest part of
            this render's sky, the far (inline-end) edge of the 44rem type
            column sits at ~0.79 total scrim: white body copy lands ~5.9:1 and
            the gold-300 accent ~3.8:1 — AA for body, AA for large text, which
            is what the accent is. Weaken them and the accent fails. The real
            fix is the sky-heavy hero photograph in SOVA §18 shot 1. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_left,rgb(0_39_36/0.94)_0%,rgb(0_39_36/0.76)_45%,rgb(0_39_36/0.18)_100%)]"
        />

        {/* ------------------------------------------------------ the paper
            §17 step 1: "the page opens on paper. Nothing else." At rest this
            is invisible and the hero is finished — the guard script in the
            root layout is the only thing that ever raises it, and only on a
            first visit with motion allowed. It sits ABOVE the scrims so one
            opacity tween performs the whole cross-fade: paper out, render and
            its dark scrim in, under an outline that never moves. */}
        <div
          data-hero-paper
          aria-hidden
          className="bg-surface-0 pointer-events-none absolute inset-0 opacity-0"
        />

        {/* The drawing at rest: a hairline elevation lying exactly on the
            building it becomes. Same box as the landscape render, same crop.

            ⛔ NO `hidden md:block` HERE ANY MORE — `display` MOVED TO CSS,
            beside this element's existing resting-opacity rule in globals.css
            §8.6. Two reasons, and neither is style: the condition needs a
            STRICT `aspect-ratio > 1/1` (see `@/lib/hero-frame` for the square
            viewport that proves it), which does not survive being written as a
            Tailwind class without escaping; and the drawing is registered to
            `hero.webp`, so "when is it on screen" is the same question as
            "which render is on screen" and belongs in one place. `hero-motion`
            gates the blueprint beat on the same constant. */}
        <HeroBlueprint className="text-veil-20 pointer-events-none absolute inset-0 size-full" />
      </div>

      {/* --------------------------------------------------------------- type */}
      <Container className="flex flex-1 flex-col pt-32 pb-8 md:pt-40">
        <div className="flex flex-1 flex-col justify-center">
          {/* ⛔ THIS COLUMN CARRIES TWO MEASURES, NOT ONE, AND THAT IS THE FIX
              FOR THE RESIZE RE-WRAP. It used to be a single
              `max-w-[var(--container-prose)]` (44rem) around all four children.
              One cap cannot be right for both: `--text-display-1` scales with
              the VIEWPORT (`clamp(2.75rem, 6.2vw, 5.25rem)`) while 44rem is a
              CONSTANT, so past ~1035px the headline outgrew its own column and
              the gold sentence broke in two — a WIDER window producing MORE
              wrapping, which is backwards. Each child now states the measure it
              actually needs: the headline below in `em` (so it tracks the type
              scale), the lead in prose (so it does not move). Putting the cap
              back here re-opens the bug. */}
          <div>
            <p
              data-hero-reveal
              data-prevent-flicker
              className="text-label text-fg-muted flex items-center gap-3 font-semibold"
            >
              {/* Not the gold .kicker-rule: the headline's <Accent> is this
                  section's one gold element. */}
              <span aria-hidden className="bg-veil-40 h-px w-8 shrink-0" />
              {hero.eyebrow}
            </p>

            {/* ⛔ `max-w-[11.5em]` IS THE HEADLINE'S MEASURE AND IT IS IN `em`
                ON PURPOSE — `em` here resolves against `--text-display-1`
                itself, so the measure grows and shrinks WITH the type instead
                of fighting it. A rem or px value would re-create the original
                bug at a different width.

                THE NUMBER IS MEASURED, not chosen. Rendered at the shipped
                weight, `title.line2` — «بثقة تبنى خطوة خطوة.», the longer of
                the two sentences — needs 923px at the clamp's 84px ceiling and
                484px at its 44px floor. Both are 11.0em; the ratio is constant
                because it is one string at two sizes. 11.5em is that plus ~4.5%
                for font-loading and hinting differences.

                WHAT IT BUYS (measured, `masks` = the two line boxes):
                  1920/1440   [118,235] -> [118,118]
                  1280        [111,222] -> [111,111]
                  1100        [ 95,191] -> [ 95, 95]
                one line per sentence, and so the SAME two-line headline, at
                every width from 640 up. Below ~545 the viewport is narrower
                than the sentence needs at the 44px floor and it wraps again —
                unchanged from before this fix, and correct: a phone cannot hold
                that sentence on one line, and the `mt-3` gap below is what
                keeps the two sentences reading as one headline when it does.

                ⚠️ CONTRAST WAS RE-MEASURED, because widening the column pushes
                the gold further toward the inline-end edge where the scrim
                above is at its weakest. Worst background pixel actually under
                the glyphs, alpha-composited: 7.4:1 -> 4.9:1. The accent is
                84px display type, so its floor is 3:1 (WCAG large text) and it
                clears it 1.6x over — it still meets AAA. Widen this past
                ~13em and that margin is what you are spending. */}
            <Display
              level={1}
              id="hero-title"
              data-prevent-flicker
              className="text-fg mt-6 max-w-[11.5em]"
            >
              <span data-hero-line className="block">
                {hero.title.line1}
              </span>
              {/* ⛔ `mt-3 md:mt-4` IS THE SENTENCE BREAK, AND IT IS NOT
                  DECORATION. `title.line1` and `title.line2` are two complete
                  Arabic sentences, each ending in a full stop. Stacked as two
                  `block` spans they sat at a measured gap of EXACTLY 0px at
                  320 / 430 / 768 / 1440 — the line boxes touched — and Arabic
                  has no capital letter to mark where the second one starts.
                  At 320 it is worst: `مسكنٌ مناسب.` itself wraps, so
                  `مناسب.` and `بثقةٍ` end up on adjacent baselines with
                  nothing between them and read as one broken word.

                  It is space, not a `&nbsp;` and not a `<br>`: the break is
                  BETWEEN two block elements, so space is the only thing it can
                  be. Three rungs off the AGENTS §10 ladder, because
                  `--text-display-1` is a `clamp()` and a fixed gap would read
                  as three different sizes across the range — measured against
                  the font size at each breakpoint:

                    430   44.0px type   mt-3   12px   27%
                    768   47.6px type   mt-4   16px   34%
                    1440  84.0px type   mt-6   24px   29%

                  Kept under a third of the type size on purpose: the two lines
                  must still read as ONE headline. Past `mt-8` it starts to
                  read as a heading plus a standfirst, which is a different
                  piece of copy. `text-balance` on <Display> is untouched — it
                  balances each block independently and never saw these two as
                  one paragraph, which is exactly why nothing was separating
                  them. */}
              <Accent data-hero-line className="mt-3 block md:mt-4 lg:mt-6">
                {hero.title.line2}
              </Accent>
            </Display>

            {/* ⛔ THE PROSE MEASURE MOVED HERE FROM THE WRAPPER, AND THE
                `min()` IS LOAD-BEARING. <Lead> already caps itself at `62ch`,
                which is 744px at this font — WIDER than the 44rem the wrapper
                used to impose. Dropping the wrapper's cap without this line
                silently widened the lead by 40px at 1440 and re-wrapped it,
                pushing body copy toward the weak end of the inline scrim whose
                stops are tuned for the 44rem edge (see the scrim block above).
                `min()` keeps whichever is narrower, so the lead renders
                IDENTICALLY to before at every width — verified 704/704 at 1440
                and 632/632 at 1024. */}
            <Lead
              data-hero-reveal
              data-prevent-flicker
              className="mt-8 max-w-[min(62ch,var(--container-prose))]"
            >
              {hero.lead}
            </Lead>

            <div data-hero-reveal data-prevent-flicker className="mt-12">
              <Button asChild size="lg">
                <Link href={hero.cta.href}>
                  {hero.cta.label}
                  <ArrowRight data-direction className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- bottom row
            ⛔ `text-fg-muted` (0.78), NOT `text-fg-subtle` (0.58) — SAGE.
            AND IT IS MORE LOAD-BEARING NOW THAN WHEN IT WAS WRITTEN. Read on.

            `--color-ink-inv-3` is documented as a 6.16:1 hard floor, and it
            is, against the three dark SURFACES. This row is not on a surface.
            It is on the photograph, at the foot of the media box, in the one
            corner where both scrims are at their weakest: the vertical scrim
            has not yet reached its 0.92 stop and the inline scrim's dense end
            is at the opposite (inline-start) edge, where the type column is.

            MEASURED at `--fg-subtle` (0.58) on the composited render, worst
            background pixel actually under the glyphs, alpha composited:

              width   scroll cue   «من المخطط»   «صور تصورية»
              1440    6.13         6.08          6.00
              1920    6.13         6.00          4.66
              2560    6.04         6.09          3.86  ✗ AA

            `object-cover` puts a brighter piece of sky behind the inline-end
            corner as the viewport widens, so the failure grows with width and
            2560 is an ordinary desktop. At 0.78 the same worst pixel measures
            4.96:1. The scrim stops above are deliberately NOT touched (their
            maths is load-bearing for the gold accent). The real fix is still
            the sky-heavy photograph, SOVA §18 shot 1.

            ⚠️ 2026-08-21: THE THIRD COLUMN OF THAT TABLE NO LONGER EXISTS.
            «صور تصورية» was deleted with every other concept badge (operator
            decision — see the block on `site.disclaimer`). It was the item
            sitting in the bright inline-end corner, and it is the row that
            failed. `justify-between` does NOT leave that corner empty: with
            two children instead of three, «من المخطط — إلى البيت» slides
            into it. So the worst background pixel is unchanged; only the
            glyphs over it are. That is why 0.78 stays. Dropping this row back
            to `--fg-subtle` because "the failing item is gone" would reinstate
            the same failure under a different string. */}
        <div
          data-hero-reveal
          data-prevent-flicker
          className="border-line mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t pt-6"
        >
          <Link
            href="/#about"
            /* `py-1` — WCAG 2.5.8 (AA). `text-caption` gives a 22px box and
               the minimum is 24. It sits in a `flex-wrap` row with a hairline
               border above, so 4px of block padding costs no layout. */
            className="text-caption text-fg-muted hover:text-fg group/cue inline-flex items-center gap-2 rounded-full py-1 transition-colors"
          >
            {hero.scrollCue}
            <ChevronDown
              aria-hidden
              className="size-4 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/cue:translate-y-1"
            />
          </Link>

          {/* The best line of copy on the site (SOVA §5.3), promoted out of a
              three-second overlay and into the page itself. */}
          <p className="text-label text-fg-muted flex items-center gap-3 font-semibold">
            {hero.blueprint.from}
            <span aria-hidden className="bg-veil-40 h-px w-8 shrink-0" />
            {hero.blueprint.to}
          </p>
        </div>
      </Container>
    </Section>
  );
}
