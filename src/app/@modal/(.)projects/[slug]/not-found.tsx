import Link from "next/link";

import { ProjectOverlay } from "@/components/sections/project-overlay";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { errors } from "@/content/errors";
import { projectDetail, projects } from "@/content/projects";

/* =============================================================================
 * NOT-FOUND FOR THE INTERCEPTED OVERLAY.
 *
 * WHY THIS FILE HAS TO EXIST, AND IT IS NOT OBVIOUS.
 * `@modal/(.)projects/[slug]/page.tsx` calls `notFound()` for an unknown slug,
 * exactly like the standalone page does. But `@modal` is a PARALLEL SLOT: it
 * renders ALONGSIDE `children`, not instead of it. With no boundary inside the
 * slot the `notFound()` unwinds to the nearest one above it — the root
 * `not-found.tsx` — and the root 404 is a full `<main>` with its own `hero`
 * spacing. Rendered into the modal slot that is a second complete page
 * stapled underneath the still-mounted home page: two `<main id="main">`
 * elements in one document, two `<h1>`s, and no way to dismiss the thing,
 * because the overlay that owned Escape never mounted.
 *
 * A slot-local boundary keeps the failure inside the slot. The visitor gets
 * the overlay they asked for, containing an honest "not this one, here are the
 * six", closable with Escape or the overlay click like any other project —
 * because it IS <ProjectOverlay>, with its focus trap, its focus restore and
 * its `router.back()` on close.
 *
 * REACHABILITY: this is the ONLY live not-found in the project family.
 * `projects/[slug]/page.tsx` now declares `dynamicParams = false`, so a bad
 * slug typed into the address bar 404s at the routing layer and never enters
 * that segment — the root `not-found.tsx` answers it (read the block at the
 * top of that page for the measurement behind the flag). The intercepted route
 * here has no `generateStaticParams` and stays dynamic, so a CLIENT-SIDE
 * navigation to a stale project link still lands in the slot, and this is what
 * it renders.
 *
 * VERIFIED, not assumed: a real `<Link>` click to `/projects/nope` from `/` in
 * headless Edge produced `overlayPresent: true`, `role="dialog"`, the Arabic
 * dialog title, six project links, `dir="rtl"`, and exactly ONE `<main
 * id="main">` and ONE `<h1>` in the document — i.e. the duplicate-page failure
 * described above did not occur.
 *
 * <DialogTitle> is mandatory, not decoration: Radix's Dialog logs a violation
 * and the panel has no accessible name without it. It is rendered here, from a
 * Server Component, into the client Dialog tree — the same interleaving
 * pattern `page.tsx` in this folder uses.
 * ========================================================================== */

export default function InterceptedProjectNotFound() {
  return (
    <ProjectOverlay>
      {/* The overlay panel declares its own dark ground (see <ProjectOverlay>),
          so ordinary ground tokens are correct in here with no dark: variants.

          `max-w-[44rem] mx-auto` — MEASURED, not taste. <DialogContent> is
          `sm:max-w-[72rem]` because the real detail panel is a two-column
          image|text split that fills it. This has no image, so at 1440 the
          text hugged the inline-start edge of a 1150px panel with the other
          half empty. Constraining to the prose measure (the same 44rem
          <Container width="prose"> uses) and centring it makes the panel read
          as deliberate instead of half-loaded. */}
      <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-8 p-8 sm:p-12">
        <div>
          <span className="text-label text-fg-subtle font-semibold">
            {errors.projectNotFound.kicker}
          </span>
          <DialogTitle className="font-display text-h2 text-fg mt-3 text-balance">
            {errors.projectNotFound.title.a} {errors.projectNotFound.title.b}
          </DialogTitle>
          <p className="text-body text-fg-muted mt-4 max-w-[62ch] text-pretty">
            {errors.projectNotFound.lead}
          </p>
        </div>

        <nav aria-label={errors.projectNotFound.listLabel}>
          <h3 className="text-label text-fg-subtle font-semibold">
            {errors.projectNotFound.listTitle}
          </h3>
          <ul className="mt-3 flex flex-col">
            {projects.items.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="border-line group/row flex items-baseline gap-4 border-b py-3 last:border-b-0"
                >
                  {/* Western digits inside an RTL run need their own bidi
                      isolate — same `<bdi>` as <ProjectCard> (SOVA §16.8). */}
                  <span className="text-label text-fg-subtle shrink-0 font-semibold">
                    <bdi>{project.n}</bdi>
                  </span>
                  <span className="text-body text-fg-muted group-hover/row:text-fg transition-colors duration-[var(--dur-fast)]">
                    {project.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Button asChild variant="outline" className="self-start">
          <Link href="/#projects">{projectDetail.back}</Link>
        </Button>
      </div>
    </ProjectOverlay>
  );
}
