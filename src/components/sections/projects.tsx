import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { ProjectCard } from "@/components/sections/project-card";
import { ProjectsRail } from "@/components/sections/projects-rail";
import { projects } from "@/content/projects";
import { allRegions, regions } from "@/content/regions";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <Projects> (#projects) — SOVA §11 row 4. Dark, surface-2.
 *
 * THIS SECTION ABSORBS THE REGIONS SECTION. The standalone `#regions` block is
 * CUT: it was a filter with an H2 on top of it, sitting between the story and
 * the thing it filtered, and it is the first thing the old page shows a
 * visitor — SOVA §10.4, "it leads with a filter widget". Its five buttons are
 * folded into this header, its framing copy is preserved but not rendered
 * (`cutRegionsSection` in content/regions.ts), and its four names also survive
 * as the plain list in the story's sticky column.
 *
 * THE FILTER IS FIVE LINKS, NOT FIVE BUTTONS.
 * `?region=<slug>` is a real search param, so a filtered view is linkable,
 * shareable, back-button-able and server-rendered — the filtering happens
 * HERE, in a Server Component, from `region` passed down by the page. There is
 * no `useSearchParams`, no client state and no JS of any kind in the filter:
 * a <Link> whose href carries the param is the whole mechanism, and it works
 * with scripting disabled. (Cost, stated plainly: reading a search param makes
 * `/` a dynamically-rendered route. See the note in src/app/page.tsx.)
 *
 * GOLD BUDGET (AGENTS §8): `<Accent>` on `رؤية واحدة.` is this section's ONE
 * gold element. Hence `rule={false}` on the header — the kicker's 28px
 * hairline is gold-500 and would be a second one — and hence the active filter
 * chip is a veil + hairline rather than the obvious gold pill.
 *
 * Server Component. The rail is a client island for Embla only; every card it
 * renders is server markup passed through as children.
 * -------------------------------------------------------------------------- */

export interface ProjectsProps {
  /** `?region=` — a region slug. Anything unrecognised falls back to "all". */
  region?: string;
}

export function Projects({ region }: ProjectsProps) {
  const active = regions.find((r) => r.slug === region) ?? null;
  const items = active
    ? projects.items.filter((p) => p.region === active.name)
    : projects.items;

  /** `الكل` first, then the client's four, in the client's order (§5.5). */
  const chips = [
    { slug: null, name: allRegions.label, count: allRegions.count },
    ...regions,
  ];

  return (
    <Section
      id="projects"
      theme="dark"
      surface={2}
      /* light → dark flip: SOVA §14.3 gives the transition the big rhythm. */
      space="lg"
      container={false}
      aria-labelledby="projects-title"
    >
      <Container>
        <SectionHeader
          align="split"
          kicker={projects.kicker}
          /* The heading's <Accent> is the gold. No second gold hairline. */
          rule={false}
          headingId="projects-title"
          heading={
            <>
              {projects.title.a} <Accent>{projects.title.b}</Accent>
            </>
          }
          lead={projects.lead}
        />

        {/* ------------------------------------------------------- the filter */}
        <div className="border-line mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-t pt-6">
          {/* HIDDEN ON THE GITHUB PAGES PREVIEW, not deleted. The chips
              link to `/?region=<slug>`, which <HomePage> reads server-side;
              a static export has no server, so every chip would navigate and
              filter nothing while the first chip stayed lit. A filter that
              visibly does nothing is worse than no filter. The flag is unset
              everywhere else, so dev and any server-hosted deploy render it
              normally. Set in next.config.ts under GITHUB_PAGES. */}
          {process.env.NEXT_PUBLIC_PAGES_PREVIEW !== "true" && (
            <nav aria-label={site.a11y.regionChoice}>
              <ul className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => {
                  const isActive = chip.slug === (active?.slug ?? null);
                  return (
                    <li key={chip.slug ?? "all"}>
                      <Link
                        href={
                          chip.slug ? `/?region=${chip.slug}#projects` : "/#projects"
                        }
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "text-body-sm inline-flex h-11 items-center gap-3 rounded-full border px-6 transition-colors duration-[var(--dur-fast)]",
                          isActive
                            ? "border-line-strong bg-veil-10 text-fg"
                            : "border-line text-fg-muted hover:text-fg hover:bg-veil-05",
                        )}
                      >
                        {chip.name}
                        <span className="text-caption text-fg-subtle">
                          {chip.count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* The rail's affordance, in the client's own words. The arrow is
              `data-direction` + mirrored: "onward" in an RTL document points
              left, and this is exactly the icon CYPHER audits for. */}
          <p
            aria-hidden
            className="text-label text-fg-subtle flex items-center gap-3 font-semibold"
          >
            {projects.hint}
            <ArrowRight
              data-direction
              className="size-4 shrink-0 rtl:-scale-x-100"
            />
          </p>
        </div>
      </Container>

      {/* ----------------------------------------------------------- the rail */}
      <div className="mt-12">
        <ProjectsRail>
          {items.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              priority={i === 0}
              className="w-[80%] sm:w-[22rem] lg:w-[26rem]"
            />
          ))}
        </ProjectsRail>
      </div>

      {/* --------------------------------------------------------- disclaimer
          `provisional` is the client's own flag on their own data. When the
          real schedule lands it flips to false in content/projects.ts and this
          line disappears on its own — it is not a decoration to be deleted by
          hand. */}
      {projects.provisional ? (
        <Container className="mt-12">
          <p className="text-caption text-fg-subtle border-line max-w-[62ch] border-t pt-6">
            {projects.disclaimer}
          </p>
        </Container>
      ) : null}
    </Section>
  );
}
