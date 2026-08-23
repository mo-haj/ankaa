import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FactText } from "@/components/content/fact";
import { PlanPlate } from "@/components/sections/plan-plate";
import { Button } from "@/components/ui/button";
import {
  deliveryDate,
  instalmentPlan,
  pricing,
} from "@/content/placeholders";
import { projectDetail, projectImageAlt, type Project } from "@/content/projects";
import { units } from "@/content/units";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <ProjectDetailPanel> — the project detail, rendered identically by BOTH
 * `/projects/[slug]` (the real page) and the intercepted overlay.
 *
 * One component, two mountings. That is the whole reason the modal→route move
 * is safe: there is no second copy of this markup to drift.
 *
 * SPLIT IN TWO HALVES — the client's own framing. `projects.lead` says
 * «تجربة مقسومة إلى نصفين» ("an experience split into two halves"), so the
 * media and the facts are a true 50/50 at lg. The old modal did this and it
 * was right.
 *
 * ⛔ NO FAKE GALLERY. The live modal shows three thumbnails per project:
 * `project-1.webp`, `project-2.webp`, `living.webp` — i.e. it illustrates
 * الفردوس ١ with a photograph of الفردوس ٢ and an interior from somewhere else
 * entirely. Every project here shows the ONE image that belongs to it. When
 * SOVA §18 shot 6 lands (three real frames per project, ×6) this grows a
 * gallery; until then a thumbnail strip would be a lie with a UI around it.
 *
 * ⛔ NO PROCESS STEPS. `projectDetail.steps`
 * (الدراسة → الترخيص → التنفيذ → التسليم) stays in content and is NOT rendered
 * here: SOVA §11 row 8 promotes it to the `#process` section in wave 3, and
 * showing it twice would be exactly the duplication the promotion exists to
 * end.
 *
 * `titleSlot` is the only thing that differs between the two mountings: the
 * page passes an <h1>, the overlay passes a <DialogTitle> (which Radix needs
 * as the accessible name of the dialog). Everything else is byte-identical.
 *
 * Gold budget: the CTA is `variant="gold"` and is the panel's ONE gold element.
 * Nothing else in here is gold.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export interface ProjectDetailPanelProps {
  project: Project;
  /** <h1> on the page, <DialogTitle> in the overlay. */
  titleSlot: React.ReactNode;
  className?: string;
  priority?: boolean;
}

export function ProjectDetailPanel({
  project,
  titleSlot,
  className,
  priority,
}: ProjectDetailPanelProps) {
  const facts = [
    { label: projectDetail.facts.stage, value: project.stage },
    // Western digits: measured/counted values (SOVA §16.7). The old modal
    // pushed these through an Eastern-numeral map along with everything else,
    // which turned `85–145 م²` into `٨٥–١٤٥ م²`.
    { label: projectDetail.facts.units, value: String(project.units) },
    { label: projectDetail.facts.sizes, value: project.sizes },
  ];

  const pendingFacts = [
    { label: projectDetail.pending.price, fact: pricing },
    { label: projectDetail.pending.instalments, fact: instalmentPlan },
    { label: projectDetail.pending.delivery, fact: deliveryDate },
  ];

  return (
    <div
      data-slot="project-detail"
      className={cn("grid lg:grid-cols-2", className)}
    >
      {/* ---------------------------------------------------------- the media */}
      <figure
        data-slot="project-detail-media"
        className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[30rem]"
      >
        <Image
          src={project.image}
          alt={projectImageAlt(project.title)}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </figure>

      {/* ---------------------------------------------------------- the facts */}
      {/* NEON: the second half of the ∓8% panel slide in the overlay's
          circular reveal. `[data-slot="project-detail-media"]` is the first. */}
      {/* ⚠️ `lg:px-12 lg:py-8` — THE TWO AXES ARE NOT WORTH THE SAME HERE, and
          `lg:p-12` spent them as if they were. In a dialog capped at 92svh the
          vertical is the whole budget and the horizontal is free: 48px of side
          padding is what makes the column feel unhurried against a full-bleed
          photograph, while 48px top and bottom is 32px the panel does not have.
          MEASURED at 1440×850 with the plan tile in: 34px of scroll with p-12,
          none with py-8. Below `lg` the panel is stacked and scrolling anyway,
          so `p-8` stays square. */}
      <div
        data-slot="project-detail-body"
        className="flex flex-col justify-center p-8 lg:px-12 lg:py-8"
      >
        <p className="text-caption text-fg-subtle">{project.region}</p>

        {titleSlot}

        <p className="text-body text-fg-muted mt-4 max-w-[52ch] text-pretty">
          {projectDetail.summary}
        </p>

        {/* =====================================================================
            TWO ROWS OF THREE, AND THE SECOND ROW USED TO BE A STACK OF THREE.
            =====================================================================
            ⚠️ THIS IS A HEIGHT FIX AND THE NUMBERS ARE THE REASON — operator,
            2026-08-23: "lets make this pop up window without scroll". MEASURED
            in the overlay at 1440x800, the body was 993px against 704px of
            dialog: 291px of scroll. The pending block was the single largest
            thing in it at 231px — a label, then three full-width rows each with
            its own hairline — while the facts above said the same kind of thing,
            a label and a value, in a third of the height, because they share
            one row.

            So the pending three now use the same three-column construction and
            the two blocks read as one small table: what is known on top, what
            is not underneath it. That is also the more honest shape. The old
            stack made three missing answers look like three times as much
            content as the three real ones.

            ⛔ THE LABEL STAYS. `projectDetail.pending.title` is what stops the
            second row reading as three broken cells — named, not hidden. See
            the comment on `projectDetail.pending`. */}
        <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="border-line border-t pt-4">
              <dt className="text-caption text-fg-subtle">{fact.label}</dt>
              <dd className="text-h4 font-display text-fg mt-2">
                {/* Mixed Arabic + digits reorder without isolation (§16.8) —
                    `85–145 م²` can render reversed. */}
                <bdi>{fact.value}</bdi>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <p className="text-label text-fg-subtle font-semibold">
            {projectDetail.pending.title}
          </p>
          <dl className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {pendingFacts.map((row) => (
              <div key={row.label} className="border-line border-t pt-4">
                <dt className="text-caption text-fg-subtle">{row.label}</dt>
                <dd className="mt-2">
                  <FactText fact={row.fact} className="text-body-sm" />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------------------------------------------- the drawing */}
        {/* ⛔ THE SAME LINK ON ALL SIX PROJECTS. `art66.dxf` names plot D-66
            and never says which project that plot is, so a link shown on one
            project would be a claim nobody has made. Shown on every project it
            is what it says it is: the association has an architectural file,
            and this is the floor out of it. `units.fromProject.note` carries
            the caveat, and it is the reason this link is allowed to exist at
            all — see the block above `fromProject` in content/units.ts.

            =====================================================================
            WHY IT IS A TILE AND NOT A ROW OF TEXT — operator, 2026-08-23:
            "u can make the button more reavile like more shine to make the
            users want to press this button that the only thing we can do".
            =====================================================================
            They were right about the problem and right about the constraint.
            The problem: this was a label, a text link and an arrow on a
            hairline — the visual weight of a footnote, sitting under two
            <dl> blocks built out of labels and hairlines, so it read as a
            fourth row of the same table rather than as somewhere to go.

            ⛔ AND THE FIX IS NOT A SECOND BUTTON. The gold CTA below is this
            panel's one gold element and its one primary action (AGENTS §8);
            a filled control here would compete with «تواصل معنا» for the same
            click and lose, because contacting the association is the thing the
            panel exists for.

            So the pull comes from the drawing instead of from the chrome. This
            panel stands on `surface-inverse-2` — near-black green — and
            <PlanPlate> stands on its own paper, `PLAN_GROUND` #fbfaf6. A warm
            plate 80px wide on that ground is the brightest thing in the
            column after the photograph, and it is bright because of what it
            IS, not because of a gradient or a glow. It also previews the
            destination: a visitor sees the floor before they commit a tap.

            ⚠️ THE WHOLE TILE IS THE TARGET, VIA `after:absolute after:inset-0`
            ON THE LINK. Wrapping everything in the <a> instead would fold the
            caveat sentence into the link's accessible name — a ~90-character
            name announced on every pass — and the caveat is a thing to READ,
            not a thing to say out loud as a destination. The stretched
            pseudo-element keeps the name at «مخطط الطابق النموذجي» and the hit
            area at the full 320px. `has-[a:focus-visible]` then puts the ring
            around the tile rather than around the four words inside it.

            ⚠️ NO `hover:shadow-*` HERE. The elevation tokens are dark green
            (globals.css §1.6) and are invisible on a dark panel; the lift is
            `bg-veil-05` → `bg-veil-10`, which is a share of `--fg` and so
            lightens on dark and darkens on light without a second rule. */}
        <div
          data-slot="plan-tile"
          /* `mt-4`, where the blocks above it all use `mt-6` — the tile and the
             gold CTA under it are the panel's two actions, and pulling the
             first of them a rung closer to the data it answers groups them as
             the pair they are. It is also the last 8px of the height fight:
             1440×850 sat 2px into scroll with `mt-6`. */
          className="group/plan rounded-card border-line bg-veil-05 hover:border-line-strong hover:bg-veil-10 has-[a:focus-visible]:outline-ring relative mt-4 flex flex-col gap-3 border p-3 transition-[background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 sm:flex-row sm:items-center sm:gap-4"
        >
          {/* ⚠️ IT STACKS BELOW `sm` AND THAT IS A FIX, NOT A PREFERENCE.
              MEASURED at 390px, side by side: the tile is 276px wide, the plate
              and the arrow take 112 of it, and the text column lands at 124px —
              the four-word title broke over two lines and the caveat over five,
              for a 183px tile that looked snapped in half. Stacked, the same
              text gets the full 252px and the plate gets to be a real preview.

              ⛔ NO HEIGHT ON THE STACKED PLATE. `w-full` with the height left
              alone lets the `viewBox` set it — the box comes out at the
              drawing's own 1.30, so the plate fills it edge to edge. Pin a
              height instead and the plan letterboxes inside a band of blank
              paper, which is how it looked before this comment existed.

              `p-1` keeps the outer wall off the 8px radius. The scale is the
              tile's one authored moment — the drawing leaning in, which is
              literally what the click does. */}
          <PlanPlate
            className="rounded-field w-full shrink-0 p-1 sm:h-14 sm:w-20"
            svgClassName="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-quart)] motion-safe:group-hover/plan:scale-[1.06]"
          />

          <div className="min-w-0 flex-1">
            {/* The arrow rides the title's row rather than the tile's far edge,
                so it stays with the words when the tile stacks. `justify-
                between` still parks it at the end of the column, which on a
                wide tile is the same place it was. */}
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/plans/d-66"
                /* The ring is drawn by the tile, so this element suppresses
                   its own — see `has-[a:focus-visible]` above. */
                className="text-body text-fg font-semibold after:absolute after:inset-0 focus-visible:outline-none"
              >
                {units.fromProject.label}
              </Link>
              <ArrowRight
                aria-hidden
                /* Authored the way "forward" points in LTR and mirrored to
                   point start-ward here by the `data-direction` rule in
                   globals.css §7.1 — the mirror of the back link on the plan
                   page. ⛔ Do not add a translate on hover: `data-direction`
                   already spends this element's transform on `-scale-x-100`,
                   and a composed `scaleX(-1) translateX(-4px)` slides it the
                   wrong way. */
                data-direction
                className="text-fg-subtle group-hover/plan:text-fg size-4 shrink-0 transition-colors duration-[var(--dur-fast)]"
              />
            </div>
            <p className="text-caption text-fg-subtle mt-1 text-pretty">
              {units.fromProject.note}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild variant="gold" size="lg">
            <Link href="/#contact">{projectDetail.cta}</Link>
          </Button>
        </div>

        <p className="text-caption text-fg-subtle mt-4">{projectDetail.note}</p>
      </div>
    </div>
  );
}
