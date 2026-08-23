import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { FloorPlanViewer } from "@/components/sections/floor-plan-viewer";
import { floorPlan } from "@/content/floor-plan.generated";
import { planProject } from "@/content/placeholders";
import { units } from "@/content/units";

/* =============================================================================
 * /plans/d-66 — the association's typical floor, on its own page.
 *
 * =============================================================================
 * WHY THIS IS A ROUTE AND NOT A SECTION ANY MORE — 2026-08-23
 * =============================================================================
 * It was `<UnitTypes>` on the home page and it was too heavy for that job.
 * MEASURED on the live build before the move:
 *
 *     desktop 1440   1,748px   12.7% of the page   1.7 screens
 *     phone    390   2,749px   15.4% of the page   3.3 screens
 *
 * On a phone that made it the largest section on the site — bigger than the
 * projects rail, which is the part a visitor is actually shopping in. The home
 * page now carries a ~1-screen band that says what exists and links here; the
 * drawing, the plot metadata, the floor stack and the caveats all live on this
 * page, where an interactive plan has room to be interactive.
 *
 * =============================================================================
 * ⛔ THE URL NAMES A PLOT. IT MUST NEVER NAME A PROJECT.
 * =============================================================================
 * The operator's instinct was to hang this off a project — "every project may
 * have its own مخطط" — and that is exactly right as an end state. It is also
 * the one thing this drawing cannot support today: `art66.dxf` writes its plot
 * number, D-66, into all fifty title blocks and says nothing whatsoever about
 * which of the association's six projects that plot belongs to. `planProject`
 * in placeholders.ts is that open question and it is rendered below as a gap.
 *
 * Put this plan inside الفردوس ١'s overlay and the PLACEMENT answers the
 * question the drawing refused to answer. A caveat underneath does not undo
 * that — nobody reads a disclaimer that contradicts where the thing is sitting
 * — and if D-66 turns out to be الروابي we have shown the wrong building to
 * everyone who browsed الفردوس.
 *
 * So the URL is the plot, which is what the file actually asserts. When the
 * client sends the mapping, a project page links HERE. One plot can serve one
 * project and one project can have several drawings; a link carries both, and
 * nesting forces a single parent that may be the wrong one.
 *
 * ⛔ AND WHEN THE SECOND DRAWING ARRIVES, THIS FOLDER BECOMES `[plot]`. Not
 * before. A registry with one entry is an abstraction with nothing to abstract
 * — `planProject.requires` already asks the client for the other projects' DWG
 * files, and the day they land is the day the parameter earns its keep.
 *
 * Server Component. `<FloorPlanViewer>` is the only client boundary, and it is
 * a client component solely because selecting an apartment is state.
 * ========================================================================== */

/** The plot number the architect wrote in every title block. */
const PLOT = "D-66";

export const metadata: Metadata = {
  title: units.page.metaTitle,
  description: units.page.metaDescription,
  alternates: { canonical: "/plans/d-66" },
};

export default function PlanPage() {
  return (
    // `main` carries id="main" for the header's skip link on every route.
    <main id="main" className="flex-1">
      <Section
        theme="light"
        surface={0}
        /* `hero` (120→200px) is the opening every document route takes
           (`/privacy`, `/board`) and it is also the clearance the fixed header
           needs — this section starts at the top of the document. */
        space="hero"
        container={false}
        aria-labelledby="plan-title"
      >
        <Container>
          <Link
            /* ⛔ `/#projects`, NOT `/#plans` — that anchor left the home page
               with <UnitTypes> on 2026-08-23. This is also the truer target:
               every route into this page now starts at a project. */
            href="/#projects"
            /* `py-1` — WCAG 2.5.8 (AA). Same construction as the back link on
               `/projects/[slug]`; this is the page's only way back without the
               browser button. */
            className="text-label text-fg-muted hover:text-fg inline-flex items-center gap-2 rounded-full py-1 font-semibold transition-colors"
          >
            <ArrowLeft
              aria-hidden
              /* Authored pointing the way "back" points in LTR and mirrored to
                 point right here by the `data-direction` rule in globals.css
                 §7.1. See the same link on the project route. */
              data-direction
              className="size-4 shrink-0"
            />
            {units.page.back}
          </Link>

          <SectionHeader
            className="mt-8"
            align="split"
            kicker={units.kicker}
            /* The <Accent> is this page's one gold element (AGENTS §8), so no
               second gold hairline. Nothing in the drawing is gold. */
            rule={false}
            headingId="plan-title"
            as="h1"
            size="h1"
            heading={
              <>
                {units.title.a} <Accent>{units.title.b}</Accent>
              </>
            }
            lead={units.lead}
          />

          {/* ------------------------------------------------- the model */}
          {/* ⛔ THE RENDER COMES FIRST AND THE DRAWING SECOND, ON PURPOSE.
              This page opened with a heading and then went straight into a
              measured technical plate — correct, and nothing for a family to
              feel. The model sells, the plan proves; a visitor who has just
              seen the floor furnished reads the drawing underneath as the same
              floor rather than as a diagram.

              ⚠️ THE GEOMETRY IS REAL AND THE FURNITURE IS NOT, and
              `units.model.caption` is what says so. Read the block above
              `model` in content/units.ts before touching either. */}
          <figure className="mt-16">
            <Image
              src="/images/plan-d-66-model.webp"
              alt={units.model.alt}
              width={2400}
              height={1792}
              /* The page's LCP element — it is the first thing below the
                 heading and there is no other image on the route. */
              priority
              /* The <Container> is `min(100% - 2*gutter, 80rem)`, so 1280 is
                 the widest this can ever paint. Asking for `100vw` above that
                 would fetch a 1920 variant to draw at 1280. */
              sizes="(min-width: 1360px) 1280px, 100vw"
              className="rounded-figure border-line w-full border"
            />
            <figcaption className="text-caption text-fg-subtle mt-4 max-w-[60ch] text-pretty">
              {units.model.caption}
            </figcaption>
          </figure>

          <div className="mt-16">
            <FloorPlanViewer />
          </div>

          {/* ------------------------------------------------- what it is of */}
          {/* ⛔ «المقسم» IS ANSWERED AND «المشروع» IS NOT, AND SHOWING THEM SIDE
              BY SIDE IS THE POINT. The drawing names its plot and stops there.
              Putting the gap next to the answer is the honest reading of what
              the file actually says; picking one of the six project names to
              fill the second cell would attach a dimensioned building to a
              location nobody has confirmed — and would make this page's URL a
              lie as well. See `planProject` in placeholders.ts. */}
          <dl className="border-line mt-16 grid gap-x-8 gap-y-8 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-caption text-fg-subtle">
                {units.meta.plotLabel}
              </dt>
              {/* A plot code is Latin and numeric — isolated, or the hyphen and
                  the digits reorder against the Arabic label (SOVA §16.8). */}
              <dd className="font-display text-h4 text-fg mt-2">
                <bdi>{PLOT}</bdi>
              </dd>
            </div>

            <div>
              <dt className="text-caption text-fg-subtle">
                {units.meta.projectLabel}
              </dt>
              <dd className="text-body mt-2">
                <FactText fact={planProject} />
              </dd>
            </div>

            <div>
              <dt className="text-caption text-fg-subtle">
                {units.stack.floorsLabel}
              </dt>
              <dd className="font-display text-h4 text-fg mt-2">
                {units.stack.floors}
              </dd>
            </div>

            <div>
              <dt className="text-caption text-fg-subtle">
                {units.stack.totalLabel}
              </dt>
              <dd className="font-display text-h4 text-fg mt-2">
                {units.stack.total}
              </dd>
            </div>
          </dl>

          {/* ------------------------------------------------------ the stack */}
          <div className="mt-16">
            <h2 className="text-label text-fg-subtle font-semibold">
              {units.stack.title}
            </h2>
            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-3">
              {units.stack.levels.map((level) => (
                <div key={level.name} className="border-line border-t pt-4">
                  <dt className="text-body text-fg">{level.name}</dt>
                  <dd className="text-body-sm text-fg-muted mt-2 text-pretty">
                    {level.note}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ------------------------------------------- the caveats, and out */}
          <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              {/* Three notes, and each says a different thing: where the
                  numbers come from, that the drawing may still change, and
                  that the basement is not the plate on screen. NOT a fourth
                  restatement of `projects.disclaimer` — SOVA §10.3 counts nine
                  disclaimers on the live site as the thing that tips careful
                  into unconfident. */}
              <p className="text-body-sm text-fg-muted text-pretty">
                {units.notes.source}
              </p>
              <p className="text-caption text-fg-subtle mt-3 text-pretty">
                {units.notes.status}
              </p>
              <p className="text-caption text-fg-subtle mt-3 text-pretty">
                {units.notes.basement}
              </p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <Button asChild variant="outline">
                <Link href={units.cta.href}>{units.cta.label}</Link>
              </Button>
            </div>
          </div>

          {/* The block the whole page is drawn from, for anyone reading the DOM
              rather than the source. Costs nothing and dates the drawing to a
              specific entity in a specific file. */}
          <span hidden data-plan-source={`art66.dxf:${floorPlan.block}`} />
        </Container>
      </Section>
    </main>
  );
}
