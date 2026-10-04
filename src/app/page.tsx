import type { Metadata } from "next";

import {
  FaqJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/json-ld";
import { PageMotion } from "@/components/motion/page-motion";
import {
  Contact,
  Faq,
  Hero,
  HowItWorks,
  Interior,
  LocationSection,
  Membership,
  President,
  Projects,
  Story,
  TrustStrip,
  UnitTypes,
} from "@/components/sections";

/* =============================================================================
 * HOME — جمعية البنيان السكنية
 *
 * The section order is SOVA §11, complete as of wave 3:
 *
 *    1. Hero          dark   surface-1   §17 Direction A
 *    2. Trust strip   dark   surface-1   stats + values + the licence credential
 *    3. Story         light  surface-0   sticky / flowing
 *    4. Projects      dark   surface-2   rail + the absorbed region filter
 *    5. Unit types    light  surface-1   a band; the drawing is /plans/d-66
 *    6. Interior      light  surface-0   three real photographs, three frames
 *    7. How it works  light  surface-2   `modal.steps` promoted out of a dialog
 *    8. Membership    dark   surface-1   the five conditions (the split)
 *    9. President     light  surface-1   the quote, legible without JS
 *   10. Location      light  surface-0   the project distribution + map slot
 *   11. FAQ           light  surface-0   four answered questions
 *   12. Contact       dark   surface-1   a Server Action that never lies
 *
 * (Project detail is §11 row 5 and is not a section — it is `/projects/[slug]`
 * plus the intercepted overlay in `src/app/@modal/`. The footer is §11 row 14
 * and lives in the root layout.)
 *
 * THE RHYTHM (SOVA §14.3, AGENTS §10) — a light↔dark flip gets `space="lg"`,
 * same-theme siblings get the default. Read down the column above: Hero→Trust
 * tight (both dark), Trust→Story `lg`, Story→Projects `lg`, Projects→Unit types
 * `lg`, Unit types→Interior→How it works default (a three-light run carried by
 * surface 1→0→2 instead of a flip), How it works→Membership `lg`,
 * Membership→President `lg`, President→Location→FAQ default (light run again,
 * 1→0→0), FAQ→Contact `lg`, Contact→Footer both dark.
 *
 * -----------------------------------------------------------------------------
 * WHY THIS PAGE READS `searchParams`
 *
 * `?region=` is the projects filter (SOVA §11 row 4). Reading it HERE, on the
 * server, is what makes a filtered view a real thing rather than a client-side
 * illusion: `/?region=fayhaa` is linkable, shareable, back-buttonable, renders
 * correctly on first paint with no flash of the unfiltered set, and works with
 * scripting disabled. The filter itself is five <Link>s — no state, no
 * `useSearchParams`, no client component anywhere in it. <LocationSection>
 * links into the same parameter from the region list, which is what makes the
 * filter discoverable as geography.
 *
 * THE COST, STATED PLAINLY: awaiting `searchParams` opts `/` out of static
 * prerendering, so the home page is server-rendered per request instead of
 * being served from the CDN as a static file. For a page whose content is
 * entirely compiled-in constants that is pure overhead, and the honest fix is
 * Partial Prerendering — a `next.config.ts` change that would affect every
 * wave, so it is flagged for the squad rather than taken unilaterally here.
 * ========================================================================== */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string | string[] }>;
}) {
  const { region } = await searchParams;
  // `?region=a&region=b` is legal in a URL and arrives as an array. Take the
  // first; <Projects> falls back to "all" for anything it does not recognise.
  const activeRegion = Array.isArray(region) ? region[0] : region;

  return (
    // `main` is the skip link's target — see <SiteHeader>.
    <main id="main" className="flex-1">
      {/* NEON's client island: every scroll-driven timeline on this page, in
          one file so the "two animated groups per viewport" ceiling
          (SOVA §15.2) is auditable. Renders nothing. */}
      <PageMotion />

      <Hero />
      <TrustStrip />
      <Story />
      <Projects region={activeRegion} />
      <UnitTypes />
      <Interior />
      <HowItWorks />
      <Membership />
      <President />
      <LocationSection />
      <Faq />
      <Contact />

      {/* Structured data. Every property is conditional on a resolved fact —
          see src/components/seo/json-ld.tsx for what is omitted and why. */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FaqJsonLd />
    </main>
  );
}
