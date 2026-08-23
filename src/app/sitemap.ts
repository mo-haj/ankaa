import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/site-url";

/* -----------------------------------------------------------------------------
 * sitemap.xml — SOVA §9 #15.
 *
 * ⛔ THE SIX PROJECT URLS ARE DELIBERATELY WITHHELD, AND THE GATE IS REAL CODE.
 *
 * `/projects/[slug]` slugs are AUTHORED from project names the client's own
 * copy flags as tentative — «جميع الأسماء والمساحات والأرقام المعروضة في
 * النسخة الحالية تجريبية» (SOVA §9 gaps 3 and 5). Wave 2 flagged this in
 * `projects/[slug]/page.tsx`: when the real names land the slugs change, and
 * six URLs we submitted for indexing become six 404s with their link equity
 * pointing nowhere.
 *
 * The pages themselves are still prerendered, still linked from the rail and
 * the schedule, and still perfectly indexable — a sitemap is a submission, not
 * a permission. When `projects.provisional` flips to false they appear here
 * automatically. That flag is the switch; nothing in this file needs editing.
 *
 * `/styleguide` is never listed (and is disallowed in robots.ts).
 * -------------------------------------------------------------------------- */
/* Build-time only — nothing here reads the request. `output: "export"` (the
   Pages target) refuses to collect this route without the declaration, and it
   is a no-op on Vercel where it was already static. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    /* `/plans/d-66` IS listed, where the six project URLs are not, and the
       difference is where the name comes from. A project slug is authored from
       a project name the client flags as tentative, so submitting it risks six
       404s later. This slug is the PLOT NUMBER the architect wrote into all
       fifty title blocks of `art66.dxf` — it cannot be renamed by anyone
       approving anything, because it is not a name we chose. */
    { url: absoluteUrl("/plans/d-66"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  if (!projects.provisional) {
    for (const project of projects.items) {
      entries.push({
        url: absoluteUrl(`/projects/${project.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
