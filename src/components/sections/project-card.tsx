import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { HoverMedia } from "@/components/motion/hover-media";
import { projects as projectsContent, projectImageAlt, type Project } from "@/content/projects";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <ProjectCard> — one project in the rail.
 *
 * ⛔ THE POINT OF THIS FILE: **the whole card is a real <Link>.**
 *
 * SOVA §10.9: on the live site each card is an `<article>` with a click
 * listener, and the `<button>استكشف</button>` inside it has no handler at all —
 * it "works" only because the click bubbles to the article. That means the
 * cards are unreachable by keyboard, invisible to a screen reader as
 * navigation, un-middle-clickable, un-openable in a new tab, and invisible to
 * a crawler. Six project pages that nothing could link to.
 *
 * Here: `<Link>` is the outer element, the `استكشف` affordance is a <span>
 * inside it (a nested <button> inside an <a> is invalid HTML and would be the
 * same bug with better manners), and the focus ring is ASTRA's.
 *
 * Server Component. No handlers, no state.
 *
 * -----------------------------------------------------------------------------
 * NEON — hooks on this element:
 *
 *   [data-slot="project-card"]      the flex item. `data-region` and
 *                                   `data-index` are on it. (`data-project-slug`
 *                                   was here too, and on
 *                                   `project-detail-panel.tsx`; nothing ever
 *                                   read either one — CHAMBER C5 — and the
 *                                   slug is already in the <Link> href.)
 *   [data-project-image]            the <img>. YOURS for the Framer
 *                                   `whileHover` scale 1.04 / 0.9s quart.
 *
 * OWNERSHIP NOTE: the hover scale used to ship as a CSS transition on
 * [data-project-image]. NEON took it over with Framer (<HoverMedia>) and, per
 * JETT's own instruction, DELETED those utilities — CSS and Framer must not
 * both drive `transform` (§15.1 is about GSAP vs Framer, but the same rule
 * applies to a CSS transition). Two consequences worth knowing:
 *   · the hover is now `(pointer: fine)` only and off under reduced motion,
 *     which is what SOVA §15.3 asks for and what CSS `:hover` could not do
 *     without sticking on touch;
 *   · the decorative layers above the image are `pointer-events-none` so the
 *     pointer reaches the media layer from anywhere on the card. Nothing in
 *     them is interactive — the whole card is one <Link> — so nothing is lost.
 * -------------------------------------------------------------------------- */

export interface ProjectCardProps {
  project: Project;
  index: number;
  /** Card widths differ between the rail and the (narrower) related list. */
  className?: string;
  /** `priority` for the first card only — it is above the fold on desktop. */
  priority?: boolean;
}

export function ProjectCard({ project, index, className, priority }: ProjectCardProps) {
  return (
    <li
      data-slot="project-card"
      data-region={project.region}
      data-index={index}
      className={cn("shrink-0 snap-start", className)}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group/card rounded-figure focus-visible:outline-ring block focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="rounded-figure border-line relative aspect-[4/5] w-full overflow-hidden border">
          {/* NEON took the hover scale over in Framer, so the CSS transition
              that used to live on the <Image> is gone — CSS and Framer must
              never both drive `transform`. The scrim and the caption block
              below are `pointer-events-none` so the pointer always reaches
              this layer; see `hover-media.tsx`. */}
          <HoverMedia className="absolute inset-0">
            <Image
              data-project-image
              src={project.image}
              alt={projectImageAlt(project.title)}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 26rem, (min-width: 640px) 22rem, 80vw"
              /* `text-transparent` is for the FAILED state, not the loaded one.
                 FADE 6 blocked every image format and found the cards degrade
                 well — title, region, stage and area all survive — except for a
                 ~10px broken-image glyph in each card's top-start corner. The
                 glyph is the UA rendering `color`; the Arabic `alt` is never
                 surfaced here anyway, because this <img> is a full-bleed cover
                 layer under two scrims and a caption block. Transparent ink
                 removes the artefact and costs nothing when the image loads. */
              className="object-cover text-transparent"
            />
          </HoverMedia>

          {/* Solid enough that the ink below never sits on bare photograph.
              Vertical only — direction-neutral, so nothing to mirror
              (SOVA §16.11 — gradients do not flip). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_39_36/0.10)_0%,rgb(0_39_36/0.55)_52%,rgb(0_39_36/0.93)_100%)]"
          />

          {/* Local corner scrim — carries the index ONLY, and deliberately does
              not touch the vertical scrim above.

              The index measured 1.85:1 against bare sky (SAGE-2: `02` 1.85 @768
              and 1.86 @430, `01` 2.52, `03` 2.08, `04` 2.17, `05` 3.20 @1440).
              No ink change can fix it — pure `#ffffff` on that same pixel is
              only 2.81 — so the remedy has to be scrim, and the art call was to
              keep it LOCAL rather than darken the top band of all six renders.

              Authored for LTR (`at left top`) and mirrored with `rtl:-scale-x-100`,
              which is this codebase's one convention for direction-flipping a
              gradient — globals.css §"gradients do not flip" and the
              `[&_svg[data-direction]]:rtl:-scale-x-100` rule. Do NOT add a
              second `at right top` gradient; that is the duplication the
              convention exists to prevent. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(112px_112px_at_left_top,rgb(0_39_36/0.75)_0%,rgb(0_39_36/0.55)_45%,transparent_100%)] rtl:-scale-x-100"
          />

          {/* Western digits: an index is counted, not decorative (SOVA §16.7).
              The old site converted these to ٠١ along with everything else.

              ⚠️ Ink is `text-fg` (full), not `text-fg-subtle` (0.58) — a
              semi-transparent ink over a scrim spends the scrim's own gain, and
              the corner scrim above was sized on the assumption of solid ink.
              These two are a matched pair; changing either alone re-breaks the
              1.4.3 failure the pair exists to fix. */}
          <span className="text-label text-fg pointer-events-none absolute top-6 start-6 font-semibold">
            <bdi>{project.n}</bdi>
          </span>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
            {/* ⛔ `text-fg-muted` (0.78), NOT `text-fg-subtle` (0.58) — SAGE-2,
                and it is the same correction SAGE made to the hero's bottom
                row for the same reason. `--color-ink-inv-3` is documented as a
                6.16:1 floor against the three dark SURFACES. This line is not
                on a surface: it is on the render, and it is the TOPMOST line of
                the caption block, where the vertical scrim is still climbing
                out of its 0.55 mid-stop and has not reached 0.93.

                MEASURED by sampling the composited screenshot at the brightest
                background pixel actually under a glyph, alpha composited:

                  width   at 0.58        at 0.78 (shipped)
                  430     3.31  ✗ AA     4.57  ✓
                  768     3.52  ✗ AA     4.93  ✓
                  1440    3.68  ✗ AA     5.21  ✓

                axe never sees this — `color-contrast` skips any element over a
                background image — which is why it has to be sampled.
                The scrim stops themselves are NOT touched. */}
            <p className="text-caption text-fg-muted">{project.region}</p>

            <h3 className="font-display text-h3 text-fg mt-2 text-balance">
              {project.title}
            </h3>

            <p className="text-body-sm text-fg-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              {project.stage}
              <span aria-hidden className="bg-veil-40 h-px w-4 shrink-0" />
              {/* The en-dash range reverses without <bdi> (SOVA §16.8). */}
              <bdi>{project.sizes}</bdi>
            </p>

            <span className="text-label text-fg border-line group-hover/card:border-fg/40 mt-6 flex items-center gap-2 border-t pt-4 font-semibold transition-colors">
              {projectsContent.cardCta}
              <ArrowUpRight
                aria-hidden
                data-direction
                className="size-4 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/card:-translate-y-1 rtl:-scale-x-100"
              />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
