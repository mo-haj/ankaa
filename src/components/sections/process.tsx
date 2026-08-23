import Link from "next/link";

import { FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { memberJourney } from "@/content/placeholders";
import { howItWorks } from "@/content/process";
import { projectDetail } from "@/content/projects";

/* -----------------------------------------------------------------------------
 * <HowItWorks> (#process) — SOVA §11 row 8. NEW. Light, surface-2.
 *
 * The four stage names are the client's, read from `projectDetail.steps`
 * (SOVA §5.10 `modal.steps`) — an existing process timeline the old site only
 * ever rendered inside a project modal. This is the promotion §11 asks for.
 * See `src/content/process.ts` for why the member's journey is a slot and not
 * six invented steps.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, "How it works")
 * =============================================================================
 *
 *   [data-slot="process-track"]      the <ol>. (It carried a `data-stage-count`
 *                                    that nothing read — CHAMBER C5. The count
 *                                    is `stages.length` in this file and
 *                                    `lines.length` in the motion; neither
 *                                    needs it in the DOM.)
 *   [data-process-line]              an <svg>. There is ONE of these at `md`
 *                                    and up (a single path across the row) and
 *                                    THREE below it (one short segment per
 *                                    stage, bridging to the next marker) —
 *                                    only one shape is displayed at a time, so
 *                                    select them all and let CSS decide.
 *     [data-process-line-path]       the <path>. It runs along the INLINE axis
 *                                    on desktop and the BLOCK axis under `md`,
 *                                    and `data-process-line` now carries which.
 *
 *     ⛔ NEON'S FINDING, WORTH THE PARAGRAPH: do NOT draw these with a stroke
 *     dash. Both shapes carry `preserveAspectRatio="none"` over a 100×1 (or
 *     1×100) viewBox, so their user space is scaled by ~10× on one axis and 1×
 *     on the other. Under that transform Chrome does not resolve
 *     `stroke-dasharray` against `pathLength` the way it does on a uniformly
 *     scaled path: a full-length dash renders as a DOTTED line, roughly five
 *     dashes across the row. It is not a wrong number, it is the wrong
 *     technique for a non-uniformly scaled path — and it looks like a
 *     deliberate dotted rule, which is why it would ship unnoticed.
 *     The draw is a `scaleX`/`scaleY` on the <svg> instead, with the
 *     transform-origin at the axis's start. `vector-effect` keeps the hairline
 *     a hairline through it.
 *   [data-process-stage]             each <li>. (Same story as the count:
 *                                    `data-stage-index` was written for a
 *                                    per-element stagger that was built with a
 *                                    GSAP stagger array instead.)
 *   [data-process-marker]            the dot to fill. It is ALREADY gold in
 *                                    the resting DOM (`--accent-hair`).
 *
 * BASE STATE = FINAL STATE. The line is fully drawn, every marker is filled,
 * every label is legible. Your `gsap.set` puts the dash offset on the path and
 * desaturates the markers; with JS off or reduced motion on, this is the
 * finished section and nothing about it reads as broken.
 *
 * Suggested: `strokeDasharray/-Offset` on the path, scrub 1.0–1.2, markers
 * `color` tweened on the same timeline at their own progress fractions.
 *
 * Gold budget: THE TRACK IS THE GOLD ELEMENT — a 1px `--accent-hair` line and
 * four 8px dots, comfortably under the 5% ceiling. So the heading carries no
 * <Accent>, the kicker carries no rule, and the CTA is `outline`.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function HowItWorks() {
  const stages = projectDetail.steps;

  return (
    <Section
      id="process"
      theme="light"
      surface={2}
      /* ⚠️ `lg`, NOT `default`, SINCE 2026-08-23. <UnitTypes> and <Interior>
         are both off, so this is now the FIRST LIGHT SECTION after the dark
         projects band — a theme flip, and a flip gets the big rhythm
         (SOVA §14.3, AGENTS §10). Put it back to `default` if either of those
         sections is ever turned back on; both say so in their own headers. */
      space="lg"
      container={false}
      aria-labelledby="process-title"
    >
      <Container>
        <SectionHeader
          align="split"
          kicker={howItWorks.kicker}
          /* The track is this section's gold. No second gold hairline. */
          rule={false}
          headingId="process-title"
          heading={
            <>
              {howItWorks.title.a} {howItWorks.title.b}
            </>
          }
          lead={howItWorks.lead}
        />

        {/* ------------------------------------------------------- the track */}
        <div className="mt-16">
          <h3 className="text-label text-fg-subtle font-semibold">
            {howItWorks.trackTitle}
          </h3>

          <div className="relative mt-8">
            {/* ------------------------------------------------- the line
                TWO SHAPES, ONE VISIBLE AT A TIME.
                  · `md` and up — ONE path across the row, below.
                  · under `md`  — one SHORT path per stage, rendered inside the
                    <li> and bridging to the next marker (see the second
                    comment in the list). Three segments instead of one long
                    line, because the stacked layout has no way to express
                    "stop at the last marker" as a single inset: the last
                    stage's height is content-dependent, and a line that ran to
                    the container edge dangled ~75px past the final marker on a
                    phone. It looked unfinished, which is exactly what the
                    inset on the desktop path is there to prevent.

                Not one rotated element: a rotated SVG in an RTL tree is a
                mirroring bug waiting to happen. Every path carries
                `data-process-line-path`, so NEON's selector finds whichever
                shape is live without a breakpoint check in JS.

                WHY EACH SVG IS WRAPPED IN A POSITIONED DIV, AND WHY THAT IS
                NOT AN EXTRA DIV FOR NOTHING: an <svg> with a viewBox is a
                REPLACED element, so when `inset-inline-start` and
                `inset-inline-end` are both set and `width` is `auto`, the box
                is over-constrained and the browser keeps the SVG's INTRINSIC
                width and drops one inset. The line rendered 100px long — the
                viewBox's width — no matter what the insets said, and the
                computed style still reported them, which is what makes this
                worth a comment. The wrapper takes the insets; the SVG fills
                it.

                THE INSETS ARE NOT DECORATION EITHER. The markers sit at the
                inline-START of each of the four grid cells, so the row line
                has to stop at the LAST marker rather than run to the container
                edge — a hairline continuing past the final stage into nothing
                reads as a rendering fault, not as a timeline.
                  · inline-start: 4px — the first marker's centre
                  · inline-end:   one column minus 4px — the last marker's
                    centre. One column is (100% − 3×gap) / 4, and `md:gap-8`
                    is 2rem, so three gaps are 6rem.
                CHANGE THE GRID GAP AND YOU MUST CHANGE THE 6rem. The
                underscores are Tailwind's escape for the spaces CSS `calc()`
                requires around `-`; without them the declaration is invalid,
                Tailwind emits nothing, and the line vanishes silently. */}
            <div
              aria-hidden
              className="pointer-events-none absolute start-1 end-[calc((100%_-_6rem)/4_-_0.25rem)] top-[7px] hidden h-px md:block"
            >
              <svg
                /* NEON: the value names the AXIS this shape runs along. The
                   draw is a `scale` on this <svg> with its transform-origin at
                   the axis's start, so the animation needs to know which axis
                   that is without a breakpoint check in JS — and, for the
                   inline one, which physical end "start" is in this direction.
                   See page-motion.tsx, "HOW IT WORKS". */
                data-process-line="inline"
                viewBox="0 0 100 1"
                preserveAspectRatio="none"
                className="text-accent-hair block h-full w-full overflow-visible"
              >
                <path
                  data-process-line-path
                  d="M0 0.5 H100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <ol
              data-slot="process-track"
              aria-label={howItWorks.trackLabel}
              className="relative grid gap-12 md:grid-cols-4 md:gap-8"
            >
              {stages.map((stage, i) => (
                <li
                  key={stage}
                  data-process-stage
                  className="relative flex gap-4 md:block"
                >
                  {/* ⛔ MATCHED PAIR — the connector and the list gap.
                      From just under THIS marker to the top of the NEXT one.
                      `-bottom-[54px]` is not a magic number: it is the
                      `gap-12` between stages (48px) plus the next marker's
                      `mt-1.5` (6px), so the segment lands exactly on it.
                      CHANGE THE LIST GAP AND YOU MUST CHANGE THE 54.

                      It was `gap-10` / `-bottom-[46px]` until CHAMBER C6 —
                      40px is not on the AGENTS §10 space ladder (…8 12 16…),
                      48 is. Both halves moved together, which is the only way
                      this may ever be touched. The last stage has no segment,
                      which is the whole point. */}
                  {i < stages.length - 1 ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute start-[3px] top-4 -bottom-[54px] w-px md:hidden"
                    >
                      <svg
                        data-process-line="block"
                        viewBox="0 0 1 100"
                        preserveAspectRatio="none"
                        className="text-accent-hair block h-full w-full overflow-visible"
                      >
                        <path
                          data-process-line-path
                          d="M0.5 0 V100"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  ) : null}

                  {/* The marker. Non-text gold (gold-500) — allowed on a light
                      ground; see AGENTS §8. 8px so it reads as a node on the
                      line rather than as a bullet. */}
                  <span
                    data-process-marker
                    aria-hidden
                    className="bg-accent-hair ring-bg mt-1.5 block size-2 shrink-0 rounded-full ring-4 md:mt-0"
                  />

                  <div className="md:mt-6">
                    <span className="text-caption text-fg-subtle">
                      {howItWorks.stageNumbers[i]}
                    </span>
                    <p className="font-display text-h4 text-fg mt-1">{stage}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-body-sm text-fg-subtle mt-10">
            {howItWorks.trackNote}
          </p>
        </div>

        {/* ------------------------------------------- the missing procedure
            ONE slot, named once. `memberJourney` is a live entry in
            placeholders.ts and carries `data-pending`, so the launch audit
            counts it. Everything SOVA §11 row 8 asks for beyond the four
            stages above is behind this line — see content/process.ts. */}
        <div className="border-line mt-16 grid gap-6 border-t pt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <h3 className="font-display text-h4 text-fg">
              {howItWorks.member.title}
            </h3>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="text-body text-fg-muted text-pretty">
              {howItWorks.member.note}
            </p>
            <p className="text-body-sm mt-4">
              <FactText fact={memberJourney} />
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href={howItWorks.cta.href}>{howItWorks.cta.label}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
