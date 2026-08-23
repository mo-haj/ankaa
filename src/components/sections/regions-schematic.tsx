"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { location } from "@/content/location";
import { regionsMap } from "@/content/placeholders";

/* =============================================================================
 * <RegionsSchematic> — the four operating areas as a DRAFTED PLAN, not a map.
 *
 * =============================================================================
 * ⛔ THE ONE RULE THIS FILE EXISTS UNDER — READ IT BEFORE MOVING A COORDINATE
 * =============================================================================
 * `content/location.ts` and `location.tsx` both open with the same standing
 * order: THERE ARE NO COORDINATES, AND NONE MAY BE INFERRED. SOVA §9 #11 —
 * "four region names, zero geography". A pin is a claim about where a
 * stranger's savings are going to build a house.
 *
 * That order has not been relaxed and this drawing does not break it. Every
 * number in `PARCELS` below is a COMPOSITION on a sheet — four shapes laid
 * into the four quadrants of a frame — and NOT a position. The plan is
 * captioned in the client's language as a schematic, and the sheet carries no
 * compass and no scale bar, because both would assert an orientation and a
 * distance nobody has given us.
 *
 * ⚠️ THE SHEET MAKES NO SPATIAL STATEMENT AT ALL. It briefly carried one — an
 * arrow and «باتجاه مركز دمشق» in a title block — on the argument that a
 * DIRECTION is permissible where a POSITION is not, because «ريف دمشق الغربي»
 * (the countryside WEST of Damascus) is the association's OWN published
 * phrase, verbatim from the FAQ answer «أين تقع المشاريع؟» (SOVA §5.14). The
 * operator cut it on 2026-08-22 and nothing was lost: this section's heading
 * already reads «أربع مناطق في ريف دمشق الغربي».
 *
 * ⛔ THE ARGUMENT IS RECORDED BECAUSE IT SETS THE CEILING, NOT BECAUSE THE
 * MARKER SHOULD COME BACK. A direction quoted from the client is the MOST any
 * future addition here may assert. A compass, a scale bar, a distance or a pin
 * is past it and none of them may be added.
 *
 * ⚠️ THE PARCELS ARE NOT ORDERED NORTH-TO-SOUTH OR BY DISTANCE. They run in
 * `regions.ts` order — the client's order — laid TL, TR, BL, BR. Any
 * arrangement that looked like a ranking would be read as one.
 *
 * =============================================================================
 * ⛔ SELECTION, NOT ZOOM — OPERATOR, 2026-08-22, AND WHY IT IS THE HONEST HALF
 * =============================================================================
 * The ask was: clicking an area should make the map "show exactly where this
 * project is located", instead of jumping the visitor up to the projects rail.
 *
 * HALF OF THAT IS RIGHT AND IS BUILT. The jump WAS wrong — the visitor asked
 * for a plot and got a scroll, which reads as a bug. A plot is now a
 * `<button>` that selects in place; the other three dim, the card below swaps
 * to that area's projects, and going to the rail became a LINK the visitor
 * chooses («عرض المشاريع») rather than a surprise.
 *
 * THE OTHER HALF CANNOT BE BUILT AND MUST NOT BE FAKED. "Exactly where" is the
 * one thing this site has no data for. Zooming into a plot whose outline was
 * composed by eye would be the same invention as a pin, only with more
 * apparent precision — a visitor would read a magnified shape as a surveyed
 * boundary. So selection reveals INFORMATION WE ACTUALLY HAVE (which projects
 * are in that area, and how many) and changes no geometry.
 *
 * ⛔ WHEN THE ASSOCIATION'S REAL MAP ARRIVES, THIS INTERACTION CARRIES OVER
 * UNCHANGED. Only the artwork behind it is replaced. Do not implement zoom
 * then either, unless the map ships with coordinates the association has
 * confirmed in writing may be published.
 *
 * =============================================================================
 * WHY IT LOOKS LIKE A BLUEPRINT
 * =============================================================================
 * Because the site already speaks that language and because it is the honest
 * register. `<HeroBlueprint>` draws the building as `fill="none"
 * stroke="currentColor"` hairlines with `vector-effect="non-scaling-stroke"`,
 * under the hero's own line «من المخطط إلى البيت» — from the plan to the home.
 * A drafted sheet reads as a DRAWING at a glance; a filled, coloured, tiled
 * map reads as a survey. The first is what this is, so it is what it looks
 * like — the ruled border, the 20px grid, the hatched plots.
 *
 * =============================================================================
 * ⛔ `regionsMap` STAYS PENDING. THIS IS THE INTERIM, NOT THE DELIVERY.
 * =============================================================================
 * The association's real approved map is still an open request and this
 * component does NOT close it. The frame keeps `data-fact` and `data-pending`
 * so `grep data-pending` over a built page remains the complete audit that
 * `placeholders.ts` promises it is — removing them to "tidy up" would silently
 * drop this gap out of the launch report. Same posture `/privacy` takes for
 * the unwritten policy: a real interim, loudly still open.
 *
 * =============================================================================
 * ⛔ THE LABELS ARE HTML IN A 2×2 GRID, AND THAT IS A BUG FIX, NOT A STYLE
 * =============================================================================
 * They were absolutely positioned at each parcel's centroid in percentages.
 * MEASURED at 390px: «ضاحية الفردوس» and «الفيحاء» overlapped each other and
 * both spilled outside their plots, because an HTML label keeps its font size
 * while the SVG around it scales with the container — so the narrower the
 * viewport, the larger the label is RELATIVE to the plot it names.
 *
 * `cqw`/`vw` sizing is not the fix either: it would put the labels under
 * AGENTS §9's hard 13px floor on a phone.
 *
 * A 2×2 grid overlay fixes it structurally. Each label owns a quadrant and is
 * centred in it, so two labels CANNOT collide at any width and each one has
 * half the frame to wrap inside. The parcels are drawn to fill the same
 * quadrants generously, so the label lands on its plot at every size.
 *
 * =============================================================================
 * ACCESSIBILITY
 * =============================================================================
 * The drawing is `aria-hidden` — decoration carrying nothing the labels do not.
 *
 * ⛔ THE PLOTS ARE `<button aria-pressed>`, NOT LINKS, AND THE DISTINCTION IS
 * THE WHOLE POINT OF THE REWRITE. They were `<Link>`s while activating one
 * navigated. A control that changes what is on screen without going anywhere
 * is a button; announcing "link" and then not moving is exactly the surprise
 * the operator reported, restated to a screen-reader user. The one thing that
 * still NAVIGATES — «عرض المشاريع» in the card — is still a `<Link>`.
 *
 * The card is `aria-live="polite"` so the swap is announced without stealing
 * focus, `Escape` clears the selection from anywhere, and every control keeps
 * the site's `focus-visible` ring and a 44px minimum target (WCAG 2.5.8).
 *
 * ⚠️ CLIENT COMPONENT — the only one in this section, and only for `useState`.
 * `areas` arrives already flattened from `<LocationSection>` so `projects.ts`
 * and `regions.ts` stay out of the client bundle.
 * ========================================================================== */

export interface SchematicArea {
  readonly slug: string;
  readonly name: string;
  /** The client's own count label. Not a recount. */
  readonly count: string;
  /** Project titles in this area, in the client's order. */
  readonly projects: readonly string[];
}

/**
 * The sheet.
 *
 * ⚠️ IT WAS 720×520 WITH A TITLE BLOCK ACROSS THE BOTTOM, holding an arrow and
 * «باتجاه مركز دمشق». The operator cut both on 2026-08-22, so the strip they
 * lived in went with them and the four plots took the space back — an empty
 * ruled band under a drawing reads as a missing element, not as breathing
 * room. See `content/location.ts` for the note on what was removed.
 */
const SHEET = { w: 720, h: 460 } as const;

/**
 * One drawn plot per area, in `regions.ts` order — TL, TR, BL, BR.
 *
 * ⛔ `points` IS A COMPOSITION, NOT A BOUNDARY. Four irregular quadrilaterals,
 * shaped and tilted by eye so the sheet reads as a surveyor's plan rather than
 * as four rectangles: a chart of squares would look like data, and this is not
 * data. Each fills its quadrant so the label centred over it lands inside it.
 */
const PARCELS = [
  { slug: "firdous", points: "70,58 330,43 345,198 82,213" },
  { slug: "fayhaa", points: "400,48 660,66 645,208 388,190" },
  { slug: "jamraya", points: "62,252 322,265 310,402 50,388" },
  { slug: "hama", points: "396,262 656,249 668,388 408,402" },
] as const;

/**
 * Plot stroke opacity by state.
 *
 * ⛔ SELECTION IS CARRIED BY WEIGHT AND FILL, NEVER BY GOLD. AGENTS §8 allows
 * this section ONE gold element and it is spent on the <Accent> in the
 * heading. `location.tsx` documents a deliberate exception for `hover:` gold
 * on the area links — a hover is not a resting state, it needs a pointer, and
 * at most one row can be in it. A SELECTED plot IS a resting state, so gold
 * here would be a genuine second gold element and that exception does not
 * stretch to cover it.
 */
const PLOT = { idle: 0.55, active: 1, muted: 0.18 } as const;

export function RegionsSchematic({
  areas,
}: {
  areas: readonly SchematicArea[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  /* `useId` because the <pattern> ids are document-global. Hard-coded ones
     would collide the moment this component appears twice on a page, and the
     second copy would silently render with the first one's fills. */
  const uid = useId();
  const bySlug = new Map(areas.map((area) => [area.slug, area]));
  const active = selected ? (bySlug.get(selected) ?? null) : null;

  /* Escape clears the selection — the convention for "back out of what I just
     opened". The listener is on the document because focus may legitimately be
     on the card's link rather than on a plot when the visitor backs out. */
  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <figure
      data-fact={regionsMap.id}
      data-pending=""
      data-regions-schematic
      className="rounded-figure border-line overflow-hidden border"
    >
      {/* ⛔ `dir="ltr"` BELONGS ON THE DRAWING AND NOWHERE ELSE.
          It was on the <figure> for one build and the <figcaption> inherited
          it — which put the full stop of every Arabic sentence in the caption
          at the WRONG END of its line, visible in a screenshot as a leading
          «.» . A drawing genuinely is left-to-right: its coordinate space is
          fixed, and mirroring it with the document would reverse the plan's
          composition against the labels laid over it. Arabic PROSE is not
          left-to-right. The site already draws this line twice — brand marks
          keep their handedness in every language (AGENTS §12), and the enquiry
          form's phone box declares `dir="ltr"` on the field only, not on its
          label. Logical properties below still work; they simply resolve
          left-to-right inside a box that genuinely is. */}
      <div
        dir="ltr"
        className="bg-veil-05 relative"
        style={{ aspectRatio: `${SHEET.w} / ${SHEET.h}` }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}
          className="text-fg absolute inset-0 size-full"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            {/* The drafting grid, 20px pitch — the figure `<HeroBlueprint>`
                uses for the same job. */}
            <pattern
              id={`${uid}-grid`}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0H0V20"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
                opacity={0.16}
              />
            </pattern>
            {/* Hatching — the drafting convention for "this is the subject",
                and what makes a plot read as surveyed ground rather than as an
                empty polygon. */}
            <pattern
              id={`${uid}-hatch`}
              width={8}
              height={8}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <path
                d="M0 0V8"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
                opacity={0.3}
              />
            </pattern>
          </defs>

          <rect width={SHEET.w} height={SHEET.h} fill={`url(#${uid}-grid)`} />

          {/* The sheet border. A drawing has an edge. */}
          <rect
            x={16}
            y={16}
            width={SHEET.w - 32}
            height={SHEET.h - 32}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            opacity={0.22}
          />

          {/* ------------------------------------------------------ the plots */}
          {PARCELS.map((parcel) => {
            const isActive = selected === parcel.slug;
            const opacity = !selected
              ? PLOT.idle
              : isActive
                ? PLOT.active
                : PLOT.muted;

            return (
              <g
                key={parcel.slug}
                data-parcel={parcel.slug}
                data-active={isActive ? "" : undefined}
                /* A CSS transition, not a Framer or GSAP tween: this is a
                   reversible state change on four polygons, and globals.css
                   already neuters transitions under prefers-reduced-motion. */
                className="transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-quart)]"
                style={{ opacity }}
              >
                <polygon points={parcel.points} fill={`url(#${uid}-hatch)`} />
                {/* The selected plot gains a solid tint under its hatch, which
                    is what makes it read as CHOSEN rather than merely as the
                    one the others faded away from. `currentColor` at 8% is the
                    same weight the board page's portrait watermark uses. */}
                {isActive ? (
                  <polygon
                    points={parcel.points}
                    fill="currentColor"
                    opacity={0.08}
                  />
                ) : null}
                <polygon
                  points={parcel.points}
                  strokeWidth={isActive ? 2.4 : 1.4}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/* ------------------------------------------- the hotspots, 2×2
            See the block at the top of this file for why this is a grid and
            not four positioned labels, and why they are buttons. */}
        <ul className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {PARCELS.map((parcel) => {
            const area = bySlug.get(parcel.slug);
            if (!area) return null;
            const isActive = selected === parcel.slug;

            return (
              <li
                key={parcel.slug}
                className="flex items-center justify-center"
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${area.name} — ${location.schematic.hotspotAction}`}
                  onClick={() =>
                    setSelected((current) =>
                      current === parcel.slug ? null : parcel.slug,
                    )
                  }
                  /* `text-fg` sits on the BUTTON, not on the name inside it: a
                     colour on the child would win over the parent's
                     `hover:text-accent-gold` and the hover would do nothing.
                     `min-h-11` is the 44px touch floor (WCAG 2.5.8) — a plot
                     on a plan is exactly the kind of target hit with a thumb,
                     and the visible text is only ~24px tall. */
                  className="text-fg hover:text-accent-gold focus-visible:outline-ring rounded-field flex min-h-11 cursor-pointer flex-col items-center justify-center px-2 py-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="font-display text-body-sm sm:text-body font-semibold">
                    {area.name}
                  </span>
                  <span className="text-caption text-fg-subtle mt-0.5">
                    {area.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* =====================================================================
          ⛔ THE TWO DISCLAIMERS ARE OUTSIDE THE SWAP, AND THAT IS AN HONESTY
          FIX BEFORE IT IS A LAYOUT ONE.
          =====================================================================
          They used to live INSIDE the part that swaps, so selecting جمرايا
          replaced «مخطط توضيحي … وليس خريطة جغرافية» with that area's project
          list — leaving a visitor looking at one highlighted, thickened plot
          with every word that says it is not a map now gone from the screen.
          That is the exact moment the drawing is most likely to be misread as
          a location, and it was the moment the caveat disappeared.

          They are now permanent, below the swapping block, in both states.

          ⚠️ IT ALSO FIXED A MEASURED LAYOUT SHIFT. With four paragraphs in the
          swap, the card's height moved between states by 3px at 1440 and by
          75px at 320 (idle 297 → selected 222) — a visible jump on a phone,
          right where the visitor is looking. Moving the two fixed paragraphs
          out shrank the swapping region to the point where one `min-h` covers
          both states at every width. Do not move them back in.

          `<figcaption>` rather than a <p> so the tie between the drawing and
          its disclaimer is in the markup and not only in the layout. */}
      <figcaption className="border-line border-t p-6">
        {/* ⛔ THE LIVE REGION IS THIS BLOCK ONLY. Wrapping the whole caption
            would re-announce the two unchanging disclaimers on every press.
            `aria-live="polite"` announces the swap without stealing focus: the
            visitor pressed a button, so focus belongs where they left it. */}
        <div aria-live="polite" className="min-h-[8.5rem]">
          {active ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-display text-h4 text-fg">{active.name}</h3>
                {/* The client's own count label, not a recount. */}
                <span className="text-caption text-fg-subtle">
                  {active.count}
                </span>
              </div>

              <p className="text-body-sm text-fg-muted mt-3 text-pretty">
                {active.projects.join("، ")}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {/* ⛔ THE ONE THING THAT NAVIGATES IS THE ONLY LINK. This is
                    what a plot used to do on click, and the whole change is
                    that the visitor now chooses it instead of being sent. */}
                <Button asChild size="sm">
                  <Link href={`/?region=${active.slug}#projects`}>
                    {location.schematic.showProjects}
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                >
                  {location.schematic.clear}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-display text-h4 text-fg">
                {location.map.title}
              </h3>
              {/* Discoverability. Four plots that respond to a press look
                  identical to four plots that do not, and nothing else on the
                  sheet says otherwise. */}
              <p className="text-body-sm text-fg-muted mt-3 text-pretty">
                {location.schematic.hint}
              </p>
            </>
          )}
        </div>

        {/* Permanent, in both states. See the block above. */}
        <div className="border-line mt-5 border-t pt-5">
          <p className="text-body-sm text-fg-muted text-pretty">
            {location.schematic.caption}
          </p>
          <p className="text-caption text-fg-subtle mt-3 text-pretty">
            {location.map.note}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
