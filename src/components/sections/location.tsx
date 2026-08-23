import Link from "next/link";

import { FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { RegionsSchematic } from "@/components/sections/regions-schematic";
import { location } from "@/content/location";
import { travelTimes } from "@/content/placeholders";
import { projects } from "@/content/projects";
import { regions } from "@/content/regions";

/* -----------------------------------------------------------------------------
 * <LocationSection> (#location) — SOVA §11 row 11. NEW. Light, surface-0.
 *
 * =============================================================================
 * JETT'S CALL ON THIS SECTION — read before changing it
 * =============================================================================
 * The brief allowed me to gate this behind a flag if I judged a
 * coordinate-less map section to be dishonest or empty. It is ON, and the
 * reason is that what I built is not a map section.
 *
 * WHAT I WOULD NOT BUILD: a styled map graphic with four pins on it. We have
 * no coordinates (SOVA §9 #11), and a pin is a claim about where a stranger's
 * savings are going to build a house. Nor a third flat list of the same four
 * region names — they already appear in <Story> and as the projects filter,
 * and a page that says the same four words three times has not added a
 * section, it has added repetition.
 *
 * WHAT THIS IS INSTEAD: the DISTRIBUTION. Which of the six projects sits in
 * which of the four areas — real client data (`projects.items[].region`), and
 * the one thing about location this site has never actually said. Each area is
 * a live link into `/?region=<slug>`, the search-param filter wave 2 built, so
 * the section is also the only place that filter is discoverable as
 * geography rather than as five chips. That is a section with a job.
 *
 * The map and the travel times are then two honest, named slots beside it —
 * the request to the client, rendered on the page, exactly as `planProject`
 * is on `/plans/d-66`.
 *
 * ⛔ NOTHING HERE MAY BE FILLED IN WITHOUT THE CLIENT. Not a distance, not a
 * drive time, not a pin, not a bounding box. `ريف دمشق الغربي` in the heading
 * is the client's own phrase from the FAQ (SOVA §5.14) and is the only
 * geographic statement the section makes.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, "Location map")
 * =============================================================================
 *   [data-location-area]     each area row. SOVA asks for a marker drop +
 *                            label fade on `whileInView`; these rows are the
 *                            labels.
 *                            → BUILT, but in GSAP, not Framer:
 *                              `page-motion.tsx:297` runs one `gsap.from` over
 *                              the whole NodeList with `stagger: 0.09`, so the
 *                              rows share the Process steps' ease and band
 *                              (§15.1 holds because nothing else touches
 *                              them). A `data-area-index` was written here for
 *                              a per-element approach that was never used;
 *                              CHAMBER C5 found it inert and it is gone. A
 *                              GSAP stagger needs no index.
 *   [data-location-map]      the map frame. When `regionsMap` resolves, the
 *                            marker-drop animation targets go inside it. While
 *                            it is pending it holds one sentence, and animating
 *                            an empty frame is worse than leaving it still.
 *
 * Base state = final state: every row is in place and readable.
 *
 * Gold budget: the <Accent> on «ريف دمشق الغربي.» is the one gold element, so
 * the kicker drops its rule and the CTA is `outline`.
 *
 * ⚠️ THE AREA LINKS' `hover:text-accent-gold` IS DELIBERATE, AND IT IS THE
 * SECOND THING IN THIS SECTION THAT CAN BE GOLD. CHAMBER C6 flagged it as a
 * budget violation; it is being kept, and the reason is written here so the
 * next audit does not re-open it.
 *
 * AGENTS §8's budget is about what a viewport LOOKS like at rest — "gold never
 * exceeds ~5% of a viewport", "no gold panels, cards or grounds". A hover is
 * not a resting element: it needs a pointer, it lasts as long as the pointer
 * stays, at most one row can be in it, and it is unreachable on touch. The
 * codebase already made this exact call once — `faq.tsx` keeps the accordion
 * icon's `--accent-gold` on hover/expanded for the same reason, in a section
 * whose budget is also spent on an <Accent>.
 *
 * If that ruling is ever reversed it must be reversed in BOTH files, and
 * `hover:text-fg` is the replacement here — the row already has
 * `transition-colors` and a focus ring, so nothing is carried by the metal.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

/**
 * The single switch. Flip to `false` and the section disappears entirely.
 *
 * ⚠ IF YOU TURN THIS OFF: <President> (light, surface-1) would sit directly
 * against <Faq> (light, surface-0) with nothing between them. That is legal
 * but the light run loses a beat — give <Faq> `space="lg"` if you do it.
 */
export const LOCATION_ENABLED = true;

export function LocationSection() {
  if (!LOCATION_ENABLED) return null;

  // Grouped from the client's own data. `region` on a project is the region's
  // `name`, so the join is by name and there is no second source of truth.
  const areas = regions.map((region) => ({
    region,
    items: projects.items.filter((project) => project.region === region.name),
  }));

  return (
    <Section
      id="location"
      theme="light"
      surface={0}
      /* President (light, surface-1) → here (light, surface-0). Same ground,
         so the default rhythm (SOVA §14.3). */
      space="default"
      container={false}
      aria-labelledby="location-title"
    >
      <Container>
        <SectionHeader
          align="split"
          kicker={location.kicker}
          /* The <Accent> is this section's gold. */
          rule={false}
          headingId="location-title"
          heading={
            <>
              {location.title.a} <Accent>{location.title.b}</Accent>
            </>
          }
          lead={location.lead}
        />

        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------ the distribution */}
          <div className="lg:col-span-6">
            <ul
              aria-label={location.distributionLabel}
              className="flex flex-col"
            >
              {areas.map((area) => (
                <li
                  key={area.region.slug}
                  data-location-area
                  className="border-line border-t py-6 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <Link
                      href={`/?region=${area.region.slug}#projects`}
                      className="font-display text-h3 text-fg hover:text-accent-gold focus-visible:outline-ring rounded-field transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {area.region.name}
                    </Link>
                    {/* The client's own count label, not a recount. */}
                    <span className="text-caption text-fg-subtle">
                      {area.region.count}
                    </span>
                  </div>

                  <p className="text-body-sm text-fg-muted mt-3">
                    {area.items.map((project, j) => (
                      <span key={project.slug}>
                        {j > 0 ? "، " : null}
                        {project.title}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>

            <Button asChild variant="outline" className="mt-12">
              <Link href={location.cta.href}>{location.cta.label}</Link>
            </Button>
          </div>

          {/* -------------------------------------------- map + travel slots */}
          <div className="lg:col-span-5 lg:col-start-8">
            {/* ⛔ WAS AN EMPTY <FactMedia> FRAME UNTIL 2026-08-22. It rendered
                «تضاف خريطة مناطق العمل» in a 16:10 box — honest, and a hole in
                the middle of the section. It is now a drafted schematic with
                four live hotspots into the region filter.

                THE FACT DID NOT CHANGE. `regionsMap` is still `src: null`,
                still pending, still in the launch report, and
                `<RegionsSchematic>` still emits its `data-fact` /
                `data-pending` pair so the DOM audit stays complete. Read that
                file's header before touching a single coordinate in it — the
                "no geography" rule at the top of THIS file governs it too, and
                it is obeyed by drawing a diagram rather than a map. */}
            {/* ⛔ THE AREAS ARE FLATTENED HERE, ON THE SERVER, ON PURPOSE.
                `<RegionsSchematic>` became a Client Component when the plots
                gained selection, and passing it `regions.ts` + `projects.ts`
                to filter for itself would ship both content modules into the
                browser bundle for four names and six titles. It receives
                exactly what it renders. `areas` is already computed above for
                the distribution list, so there is still ONE grouping in this
                file and no second source of truth. */}
            <div data-location-map>
              <RegionsSchematic
                areas={areas.map((area) => ({
                  slug: area.region.slug,
                  name: area.region.name,
                  count: area.region.count,
                  projects: area.items.map((project) => project.title),
                }))}
              />
            </div>

            <div className="border-line mt-8 border-t pt-6">
              <h3 className="text-label text-fg-subtle font-semibold">
                {location.travel.title}
              </h3>
              <p className="text-body-sm mt-3">
                <FactText fact={travelTimes} />
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
