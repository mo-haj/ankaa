import { notFound } from "next/navigation";

import { ProjectDetailPanel } from "@/components/sections/project-detail-panel";
import { ProjectOverlay } from "@/components/sections/project-overlay";
import { DialogTitle } from "@/components/ui/dialog";
import { projects } from "@/content/projects";

/* =============================================================================
 * INTERCEPTED /projects/[slug] — the overlay half of SOVA §11 row 5.
 *
 * `(.)projects` intercepts the SAME level: `@modal` is a parallel SLOT, not a
 * route segment, so `/projects/[slug]` is one segment away even though the
 * file sits two directories deep. Reached only by a client-side navigation
 * from `/` — a direct visit, a refresh or a shared link falls through to
 * `src/app/projects/[slug]/page.tsx` and renders the full page.
 *
 * A Server Component. The client boundary starts at <ProjectOverlay>, and the
 * panel it wraps is server markup handed through as children — so opening a
 * project ships the Dialog, not the content.
 *
 * <DialogTitle> is rendered from here (a Server Component) into the client
 * Dialog tree. That is the interleaving pattern from the Next.js parallel-
 * routes docs, and it is why the panel needs no "use client" of its own.
 * ========================================================================== */

export default async function InterceptedProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.items.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <ProjectOverlay>
      <ProjectDetailPanel
        project={project}
        titleSlot={
          <DialogTitle className="font-display text-h2 text-fg mt-2 text-balance">
            {project.title}
          </DialogTitle>
        }
      />
    </ProjectOverlay>
  );
}
