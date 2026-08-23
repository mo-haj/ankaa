import Image from "next/image";

import { FactMedia } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { interior } from "@/content/interior";
import { materialSamples } from "@/content/placeholders";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <Interior> (#interior) — SOVA §11 row 7. Light, surface-0.
 *
 * ⛔ THREE FIGURES, NOT SIX. HOLD THIS LINE.
 *
 * The live gallery shows THREE image files SIX times under six different
 * captions — `صالة معيشة` and `تفاصيل المعيشة` are byte-identical files, as
 * are `غرفة نوم`/`غرفة رئيسية` and `مطبخ`/`مساحة عملية` (SOVA §10.3: "any
 * attentive visitor notices"). Wave 1 kept all six caption strings in
 * content/interior.ts because they are the client's copy, and rendered none of
 * the duplicate pairings. Wave 2 renders one figure per real photograph and
 * stops. When SOVA §18 shot 7 lands (eight unique interior frames) the extra
 * captions are already in content, waiting, and this grid grows into them.
 *
 * A gallery that repeats its own images is a small lie told six times per
 * screen. Padding it back out to six frames to "fill the grid" is the one
 * change to this file that would be wrong.
 *
 * ASPECT RATIOS: the source library is flat 4:3 — SOVA §8.1 names that as part
 * of why the page reads as a template, and both reference sites mix ratios
 * deliberately. The frames below are 4:5 / 3:2 / 4:5 crops of those renders,
 * with the columns offset off the space ladder's rungs. Cropping a concept
 * render costs nothing; when real photography arrives it is delivered in all
 * four ratios (§18 technical spec) and these frames already expect that.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, interior gallery)
 * =============================================================================
 *
 *   [data-slot="interior-gallery"]   the grid
 *   [data-interior-column]           the three columns. Each carries
 *                                    `data-parallax-y` = the yPercent target:
 *                                    -6 (slow) / -13 (fast) / -9 (medium).
 *                                    **yPercent, NOT px** — SOVA is explicit
 *                                    that the live site's y:-70/-150/-105 does
 *                                    not scale across viewports. `≥768px only`
 *                                    (below that the columns stack and a
 *                                    parallax offset just misaligns them).
 *   [data-interior-figure]           the clip-path target. `data-clip-origin`
 *                                    is 0 / 1 / 2 — the three rotating origins.
 *   [data-interior-figure-inner]     the counter-scale wrapper: 1.14 → 1.
 *                                    Structure is figure > inner > image, the
 *                                    same shape as the story figure you are
 *                                    already porting.
 *
 * Base state = final state: every figure below is fully visible, unclipped and
 * unoffset. Your `gsap.set` is what hides it, and with JS off or reduced
 * motion on, this is the finished gallery.
 *
 * Gold budget: <Accent> on the heading is the one gold element. The hairlines
 * and the materials strip are non-gold.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

/* =============================================================================
 * ⛔ THE SECTION IS OFF. ONE LINE TURNS IT BACK ON — READ THIS FIRST.
 * =============================================================================
 * Operator decision, 2026-08-21. Nothing below is deleted: the component, the
 * copy in `src/content/interior.ts` and the three images in `public/images/`
 * are all still here and still correct. Flip the constant and the section
 * returns exactly as it was.
 *
 * WHY IT IS OFF. The three images are CONCEPT RENDERS, not photographs of an
 * apartment. Until today that was stated on the page: a `صور تصورية` badge sat
 * in front of `interior.note` and labelled the whole gallery. That badge was
 * removed in the same pass as every other concept badge (see the block on
 * `site.disclaimer`), and an UNLABELLED interior gallery is a different claim
 * from a labelled one — three warm, furnished rooms with no qualifier read as
 * photographs of a finished apartment. The association has no such apartment
 * to photograph yet. The standing footer disclaimer covers the site's imagery
 * in general; it is not a substitute for a label on the one gallery whose
 * subject a visitor would otherwise assume they could walk into.
 *
 * WHAT HAS TO ARRIVE BEFORE THIS GOES BACK TO `true`:
 *   · SOVA §18 shot 7 — EIGHT unique interior frames, real photography of a
 *     real finished unit. The extra caption strings for them are already
 *     sitting in `src/content/interior.ts`, unrendered, waiting.
 *   · OR, if the renders are to ship as renders, a decision from the operator
 *     to reinstate a visible «صور تصورية» label on this gallery — which is
 *     the exact thing J1 removed, so it is a decision, not a fix.
 *
 * Neither of those is something an agent may decide. `interior.note` (client
 * copy about specifications and contracts) is NOT that label and never was.
 *
 * RHYTHM, IF YOU FLIP IT: with this off the page runs <UnitTypes> (light,
 * surface-1, `lg`) straight into <HowItWorks> (light, surface-2, default).
 * Both are light, so `default` on <HowItWorks> is still the right rung and
 * nothing in `page.tsx` needs to change either way (SOVA §14.3, AGENTS §10).
 * ========================================================================== */
export const INTERIOR_ENABLED = false;

/**
 * Per-column frame geometry. Three columns, one figure each — the offsets and
 * ratios are what give a three-image gallery an editorial rhythm instead of a
 * three-up grid. `parallax` is the yPercent NEON scrubs; `offset` values are
 * ladder rungs (0 / 96px / 48px).
 */
const FRAMES = [
  { aspect: "aspect-[4/5]", offset: "", parallax: "-6" },
  { aspect: "aspect-[3/2]", offset: "md:mt-24", parallax: "-13" },
  { aspect: "aspect-[4/5]", offset: "md:mt-12", parallax: "-9" },
] as const;

export function Interior() {
  if (!INTERIOR_ENABLED) return null;

  return (
    <Section
      id="interior"
      theme="light"
      surface={0}
      /* Same-theme sibling of <UnitTypes> (light surface-1) — the default
         rhythm. If UNIT_TYPES_ENABLED is ever flipped off this becomes the
         first light section after the dark projects band and needs `lg`. */
      space="default"
      container={false}
      /* MOTION STAGE (NEON). The gallery entrance parks each figure at a
         lateral `x` offset until its own ScrollTrigger fires several screens
         later, and at 768–1024 that resting offset reached past the document's
         inline-end edge — which mobile/desktop Chrome answers by widening the
         layout viewport, shifting the RTL scroll origin and stretching every
         `position: fixed` element (i.e. the header) by the overflow amount.
         Clipping HERE and not on the gallery grid is deliberate: the boundary
         is the viewport edge rather than the gutter, so the travel is never
         cut where a visitor could see the cut.
         `clip`, not `hidden` — `hidden` would make this a scroll container and
         `overflow-y` would stop being `visible`, which would break the column
         parallax that deliberately overflows this section vertically. */
      className="overflow-x-clip"
      aria-labelledby="interior-title"
    >
      <Container>
        <SectionHeader
          align="split"
          kicker={interior.kicker}
          /* The <Accent> is this section's gold. No second gold hairline. */
          rule={false}
          headingId="interior-title"
          heading={
            <>
              {interior.title.a} <Accent>{interior.title.b}</Accent>
            </>
          }
          lead={interior.lead}
        />

        {/* --------------------------------------------------------- gallery */}
        <div
          data-slot="interior-gallery"
          aria-label={site.a11y.interiorLabel}
          role="group"
          className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6"
        >
          {interior.images.map((image, i) => {
            const frame = FRAMES[i % FRAMES.length];
            return (
              <div
                key={image.src}
                data-interior-column
                data-parallax-y={frame.parallax}
                className={cn(frame.offset)}
              >
                <figure
                  data-interior-figure
                  data-clip-origin={i % 3}
                  className="rounded-figure relative overflow-hidden"
                >
                  <div
                    data-interior-figure-inner
                    className={cn(
                      "relative w-full overflow-hidden",
                      frame.aspect,
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 31vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <figcaption className="bg-ink-a80 text-surface-0 text-caption absolute bottom-4 start-4 rounded-full px-3 py-1">
                    {image.caption}
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------- concept note
            The `صور تصورية` badge that used to label this note is gone
            (operator decision 2026-08-21 — see the block on
            `site.disclaimer`). `interior.note` itself is CLIENT COPY and
            stays: it is a statement about specifications and contracts, not a
            per-image badge. */}
        <div className="border-line mt-16 border-t pt-6">
          <p className="text-caption text-fg-subtle max-w-[62ch]">
            {interior.note}
          </p>
        </div>

        {/* ------------------------------------------------- materials strip
            SOVA §18 shot 8. One honest slot, no material names: the finish
            schedule is not approved, and captioning a sample we cannot name
            would be inventing a specification. See `materialSamples` in
            placeholders.ts for what unblocks it. */}
        <div className="rounded-figure border-line mt-12 grid items-center gap-8 border p-6 sm:grid-cols-12 sm:p-8">
          <div className="sm:col-span-5">
            <h3 className="font-display text-h4 text-fg">
              {interior.materials.title}
            </h3>
            <p className="text-body-sm text-fg-muted mt-3 text-pretty">
              {interior.materials.note}
            </p>
          </div>

          <FactMedia
            fact={materialSamples}
            sizes="(min-width: 640px) 55vw, 90vw"
            className="rounded-md aspect-[3/1] w-full sm:col-span-7"
          />
        </div>
      </Container>
    </Section>
  );
}
