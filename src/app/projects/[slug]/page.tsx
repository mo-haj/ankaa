import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProjectDetailPanel } from "@/components/sections/project-detail-panel";
import { projectDetail, projects } from "@/content/projects";
import { site } from "@/content/site";

/* =============================================================================
 * /projects/[slug] — the STANDALONE project page. SOVA §11 row 5.
 *
 * This is the half of the modal→route move that the old site could never have:
 * a real URL, prerendered at build time, indexable, shareable, and correct on
 * a refresh. `src/app/@modal/(.)projects/[slug]/page.tsx` intercepts the same
 * URL when it is reached by clicking a card on `/`, and renders the overlay
 * instead — same component, same content, no second copy of the markup.
 *
 * Six pages, six slugs, all static. `generateStaticParams` is what makes them
 * so; without it these would render on demand for a fixed set of six records
 * that are compiled into the bundle.
 *
 * ⚠ The slugs are AUTHORED (see `Project.slug` in content/projects.ts) and all
 * six project names are client-flagged as tentative. When the real names land,
 * the slugs change with them and these URLs change — which is a reason to hold
 * the sitemap until the names are approved, not a reason to guess now.
 * ========================================================================== */

interface ProjectRouteProps {
  params: Promise<{ slug: string }>;
}

/* -----------------------------------------------------------------------------
 * `dynamicParams = false` — BRIMSTONE, and it closes a MEASURED bug.
 *
 * The slug set is CLOSED: six records compiled into the bundle, and
 * `generateStaticParams` below enumerates all six. There is no such thing as a
 * valid seventh slug, so declaring the set closed is simply true.
 *
 * WHAT IT FIXES. Without it, `/projects/<unknown>` was rendered ON DEMAND, the
 * `notFound()` two functions below threw mid-render, and Next served its
 * internal error document. MEASURED on a production build:
 *
 *     <html id="__next_error__">        ← no lang="ar", no dir="rtl"
 *     <body><div hidden><!--$--><!--/$--></div>…
 *
 * i.e. an EMPTY BODY in an LTR, language-less document. The 404 content existed
 * only inside the RSC flight payload, so it appeared solely after hydration:
 * with `Emulation.setScriptExecutionDisabled` the page had zero `<h1>` elements
 * and `getComputedStyle(document.documentElement).direction` was `ltr`. A
 * link-preview scraper or a non-JS crawler saw nothing at all. This was NOT
 * caused by adding a `not-found.tsx` here — it reproduced with no such file.
 *
 * With the flag, an unknown slug 404s at the ROUTING layer and Next serves the
 * prerendered root `not-found.tsx` instead. Same measurement, after:
 * `<html lang="ar" dir="rtl" …>`, a real `<h1>` in the served HTML, `direction:
 * rtl` with scripting disabled. It is also cheaper — a static 404 rather than a
 * server invocation.
 *
 * ⛔ THE CONSEQUENCE, so nobody re-adds it by accident: a segment-level
 * `not-found.tsx` in this folder is now UNREACHABLE — a routing-level 404 never
 * enters the segment. One was written and then deleted rather than shipped as
 * decoration. The intercepted overlay is a different, still-dynamic segment, so
 * `src/app/@modal/(.)projects/[slug]/not-found.tsx` IS live and is what a bad
 * slug reached by client-side navigation renders. Verified: overlay present,
 * `role="dialog"`, six project links, one `<main>`, one `<h1>`.
 * -------------------------------------------------------------------------- */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.items.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.items.find((item) => item.slug === slug);
  if (!project) return {};

  return {
    title: project.title,
    description: projectDetail.summary,
    openGraph: {
      title: `${project.title} | ${site.meta.title}`,
      description: projectDetail.summary,
      images: [{ url: project.image }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const project = projects.items.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    // `main` carries id="main" for the header's skip link on every route.
    <main id="main" className="flex-1">
      <Section
        theme="dark"
        surface={2}
        /* `hero` (120→200px) is the top rhythm AND the clearance the fixed
           header needs — this section starts at the top of the document. */
        space="hero"
        container={false}
        aria-labelledby="project-title"
      >
        <Container>
          <Link
            href="/#projects"
            /* `py-1` — WCAG 2.5.8 (AA). `text-label` gives a 21px box on a
               link that is this page's only way back without the browser
               button; the AA minimum is 24. Audited 2026-08-22. */
            className="text-label text-fg-muted hover:text-fg inline-flex items-center gap-2 rounded-full py-1 font-semibold transition-colors"
          >
            <ArrowLeft
              aria-hidden
              data-direction
              /* CYPHER: authored pointing the way it points in LTR — "back" is
                 leftward there — and mirrored to point RIGHT here by the
                 `data-direction` rule in globals.css §7.1. It used to be an
                 unmirrored <ArrowRight> with a comment claiming the attribute
                 would flip it for an LTR build; nothing flipped it, because
                 the only mirror rule in the codebase lived inside <Button>.
                 Renders identically in this document, correctly in the other. */
              className="size-4 shrink-0"
            />
            {projectDetail.back}
          </Link>

          <div className="rounded-media border-line mt-8 overflow-hidden border">
            <ProjectDetailPanel
              project={project}
              priority
              titleSlot={
                <h1
                  id="project-title"
                  className="font-display text-h1 text-fg mt-2 text-balance"
                >
                  {project.title}
                </h1>
              }
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
