import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { PlanPlate } from "@/components/sections/plan-plate";
import { floorPlan } from "@/content/floor-plan.generated";
import { units } from "@/content/units";

/* -----------------------------------------------------------------------------
 * <UnitTypes> (#plans) — SOVA §11 row 6. Light, surface-1.
 *
 * =============================================================================
 * THE DRAWING LEFT THIS SECTION ON 2026-08-23. THIS IS THE DOORWAY TO IT.
 * =============================================================================
 * The interactive plan, the plot metadata, the floor stack and the caveats now
 * live at `/plans/d-66`. What is left here is a band: what exists, how big the
 * five apartments are, a look at the plate, and one link.
 *
 * WHY, MEASURED. On the live build before the move this section was:
 *
 *     desktop 1440   1,748px   12.7% of the page   1.7 screens
 *     phone    390   2,749px   15.4% of the page   3.3 screens
 *
 * — the largest single section on the site at phone width, larger than the
 * projects rail. The operator's read was "it doesn't feel it should be in the
 * main page as scrolling area", and the numbers agreed.
 *
 * ⚠️ IT ALSO TOOK THE PAGE'S CLIENT ISLAND WITH IT. `<FloorPlanViewer>` is
 * `"use client"`; this band is not, and neither is the preview below. The home
 * page now ships the plan's geometry as markup and none of its behaviour.
 *
 * ⛔ THE LINK GOES TO A PLOT, NOT TO A PROJECT, AND NOT BECAUSE OF TIDINESS.
 * The drawing names plot D-66 and says nothing about which project that is.
 * The full argument is at the top of `src/app/plans/d-66/page.tsx`; the short
 * version is that hanging this off a project would answer, by placement, the
 * one question the file refuses to answer.
 *
 * ⚠️ THE INVERSION WORTH KNOWING BEFORE YOU EDIT EITHER SECTION: the projects
 * rail is `provisional: true` — placeholder records the client supplied and the
 * page disclaims. This is the only place on the site showing something
 * measured. Do not reconcile their numbers. `85–145 م²` up there is not
 * `114–137 م²` down here, and neither is wrong.
 *
 * GOLD BUDGET: <Accent> on the heading is the one gold element, so `rule` is
 * off and the CTA is `outline`. Nothing in the drawing is gold — see
 * `floor-plan-palette.ts`.
 *
 * Server Component, and now with no client boundary anywhere inside it.
 * -------------------------------------------------------------------------- */

/**
 * ⛔ OFF SINCE 2026-08-23, BY THE OPERATOR, AND THE BAND BELOW IS KEPT ON
 * PURPOSE. "why this section is still here we did all the page thing to just
 * remove it form the main screen do it its allready there in the projects."
 *
 * They are right that it is reachable: every project detail panel links to
 * `/plans/d-66`, so the drawing is one click from the projects rail and does
 * not need a band of its own on the way past. The home page is shorter by
 * another ~1,000px for it.
 *
 * The component stays because the decision might not. Turning it back on is
 * this one word — nothing else in the file is conditional, the strings are
 * still in `units.ts`, and `<PlanPreview>` still tracks the drawing.
 *
 * ⚠ WHAT HAD TO MOVE WHEN IT WENT OFF, so it moves back if it returns:
 *   · <HowItWorks> became the first LIGHT section after the dark projects band
 *     and took `space="lg"` for the flip (SOVA §14.3, AGENTS §10). <Interior>
 *     is also off, so it is not in the run at all.
 *   · `/plans/d-66`'s back link pointed at `/#plans`, an anchor that no longer
 *     exists on the page. It points at `/#projects` now — which is both a real
 *     anchor and where a visitor actually came from.
 */
export const UNIT_TYPES_ENABLED = false;

export function UnitTypes() {
  if (!UNIT_TYPES_ENABLED) return null;

  return (
    <Section
      id="plans"
      theme="light"
      surface={1}
      /* dark → light flip: the transition gets the big rhythm (SOVA §14.3). */
      space="lg"
      container={false}
      aria-labelledby="plans-title"
    >
      <Container>
        <SectionHeader
          align="split"
          kicker={units.kicker}
          /* The <Accent> is this section's gold. No second gold hairline. */
          rule={false}
          headingId="plans-title"
          heading={
            <>
              {units.title.a} <Accent>{units.title.b}</Accent>
            </>
          }
          lead={units.band.lead}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <figure className="lg:col-span-7">
            {/* ⚠️ THE PADDING IS NOT DECORATION. `rounded-figure` is a 24px
                radius and <PlanPlate> fills its box corner to corner, so with
                the drawing flush to the frame the radius bites four corners off
                the building — the north-east balcony was visibly clipped at
                390px. The inset also stops the outer wall reading as the
                frame's own border. */}
            <PlanPlate className="rounded-figure border-line border p-4 sm:p-6" />
            <figcaption className="sr-only">
              {units.band.previewLabel}
            </figcaption>
          </figure>

          <div className="lg:col-span-4 lg:col-start-9">
            {/* The five areas, as chips. Same construction as the room
                programme inside the viewer, so arriving on the plan page feels
                like the same object seen closer rather than a different one. */}
            <ul
              aria-label={units.band.areasLabel}
              className="flex flex-wrap gap-2"
            >
              {floorPlan.apartments.map((apartment) => (
                <li
                  key={apartment.no}
                  className="border-line text-caption text-fg-muted flex items-baseline gap-1.5 rounded-full border px-3 py-1"
                >
                  <span className="font-display text-body text-fg">
                    {apartment.area}
                  </span>
                  <span>{units.fields.unit}</span>
                </li>
              ))}
            </ul>

            <p className="text-body-sm text-fg-muted mt-6 text-pretty">
              {units.plan.idle}
            </p>

            <Button asChild variant="outline" className="mt-8">
              <Link href="/plans/d-66">{units.band.cta}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
