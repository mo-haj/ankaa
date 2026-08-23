"use client";

import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  PLAN_GROUND,
  PLAN_POCHE,
  PLAN_TONE,
} from "@/components/sections/floor-plan-palette";
import { Button } from "@/components/ui/button";
import { floorPlan, type PlanApartment, type PlanRoom } from "@/content/floor-plan.generated";
import { units } from "@/content/units";
import { cn } from "@/lib/utils";

/* =============================================================================
 * <FloorPlanViewer> — the association's own typical floor, drawn and selectable.
 *
 * =============================================================================
 * WHAT IS ON SCREEN, AND WHERE EVERY LINE OF IT CAME FROM
 * =============================================================================
 * Every path is traced from `art66.dxf`, the association's AutoCAD file for
 * plot D-66, by `scripts/extract-floor-plan.py`. Walls, columns, door swings,
 * window openings, the stair, and one filled polygon per room. The five
 * apartment regions were not drawn by anyone here — they are the connected
 * components of the drawing's own room graph, and the areas beside them are
 * the figures the architect wrote into fifty apartment-allocation title blocks.
 *
 * The plate is POCHÉ: the footprint filled once in the wall colour, every room
 * painted on top, and whatever still shows between them is the wall. There is
 * no wall polygon and there does not need to be one. The tones and the whole
 * argument for them live in `floor-plan-palette.ts` — read that before
 * touching a colour here.
 *
 * ⛔ NOTHING IN THIS COMPONENT MAY INVENT GEOMETRY. If a wall looks wrong, the
 * fix is in the extractor or in the CAD file, never a nudged coordinate here.
 * This is the opposite posture from `regions-schematic.tsx`, whose shapes are
 * openly a composition because no survey exists — and the two must not drift
 * toward each other. That one may never gain a compass; this one has to have
 * one, because the architect recorded the orientations.
 *
 * =============================================================================
 * WHY THE ZOOM IS HONEST HERE AND WAS FORBIDDEN THERE
 * =============================================================================
 * The regions schematic was explicitly denied a zoom: magnifying a shape
 * composed by eye reads as a surveyed boundary, and "exactly where" was the
 * one thing that site had no data for. Here the drawing IS the survey — it is
 * dimensioned CAD at 1 cm resolution — so magnifying it reveals more truth
 * rather than inventing precision. Zooming in is the whole point: five room
 * labels at plate scale would be an unreadable pile, and at apartment scale
 * they are the answer to "what would I actually live in".
 *
 * =============================================================================
 * ⛔ THE DRAWING IS A POINTER AFFORDANCE. THE LIST IS THE CONTROL.
 * =============================================================================
 * The five regions are `aria-hidden` and carry no roles, no tabindex and no
 * keyboard handlers. Every one of them has an exact counterpart in the list
 * beside the drawing, which is five real `<button aria-pressed>` elements.
 *
 * That is deliberate and it is the accessible choice, not a shortcut. Giving
 * both the regions AND the list button semantics would put TEN tab stops on
 * one control surface, and a screen-reader user would meet each apartment
 * twice with no way to tell the two announcements apart. An irregular polygon
 * also cannot be described by a focus ring: the ring would be its bounding
 * box, which overlaps its neighbours here by metres.
 *
 * So the drawing is a redundant, pointer-only route to a control that is
 * complete without it — the same relationship a chart has to its data table.
 * ⛔ Do not add `role="button"` to the paths. Add the missing thing to the list.
 *
 * =============================================================================
 * THE VIEWBOX IS SET IMPERATIVELY, AND THAT IS DELIBERATE
 * =============================================================================
 * `viewBox` is an attribute, not a style, so CSS cannot transition it. Driving
 * it through React state would re-render the entire plate — 500-odd subpaths —
 * on every one of ~45 animation frames. `animate()` writes the attribute
 * straight onto the node instead, which touches one string per frame and never
 * re-renders anything.
 *
 * `boxRef` remembers where the camera actually is, so interrupting a zoom
 * half-way starts the next one from the frame on screen rather than snapping
 * back to where the last one was supposed to have finished.
 * ========================================================================== */

const { width: W, height: H, apartments } = floorPlan;
const ASPECT = W / H;

/** The whole plate. Also the SSR value, so the drawing is correct with no JS. */
const FULL: Box = [0, 0, W, H];

/** Centimetres of air left around a selected apartment. */
const ZOOM_PAD = 110;

const ZOOM_SECONDS = 0.72;

/** The house ease — `--ease-out-expo` in globals.css, as a cubic-bezier. */
const EASE = [0.16, 1, 0.3, 1] as const;

type Box = [number, number, number, number];

/**
 * Grow `bbox` to the plate's aspect ratio, then pad it.
 *
 * ⚠️ THE ASPECT MATCH IS LOAD-BEARING, NOT TIDINESS. `preserveAspectRatio`
 * defaults to `xMidYMid meet`, so a viewBox of a different shape to the
 * viewport gets letterboxed — and the room labels are HTML positioned as a
 * percentage of the CONTAINER, which would then be a percentage of the wrong
 * rectangle and drop every label into the wrong room. Matching the aspect
 * means the mapping from user units to container percentage is exact at every
 * zoom level, so the labels need no measurement and no ResizeObserver.
 */
function fitBox(bbox: readonly [number, number, number, number]): Box {
  let [x, y, w, h] = bbox;
  x -= ZOOM_PAD;
  y -= ZOOM_PAD;
  w += ZOOM_PAD * 2;
  h += ZOOM_PAD * 2;
  if (w / h < ASPECT) {
    const grown = h * ASPECT;
    x -= (grown - w) / 2;
    w = grown;
  } else {
    const grown = w / ASPECT;
    y -= (grown - h) / 2;
    h = grown;
  }
  return [x, y, w, h];
}

/**
 * Presentation order for the room programme, so the five apartments can be
 * compared line by line.
 *
 * ⛔ THIS ORDERS THE LABELS. IT DOES NOT RENAME THEM. Every string here is the
 * architect's own, verbatim off the drawing, and in particular apartment 1's
 * three rooms are labelled «غرفة» and NOT «نوم». That is not a slip to be
 * normalised: the site must not promise three BEDROOMS where the drawing says
 * three rooms. Anything unlisted sorts to the end rather than being dropped.
 */
const ROOM_ORDER = [
  "صالون",
  "معيشة",
  "نوم",
  "غرفة",
  "مطبخ",
  "حمام",
  "موزع",
  "برندا",
  "منور",
];

/* =============================================================================
 * ⛔ `left` AND `top`, PHYSICAL, AND THAT IS THE ONE PLACE ON THIS SITE WHERE
 * THEY ARE CORRECT — AGENTS §1 IS NOT BEING IGNORED, IT IS BEING APPLIED.
 * =============================================================================
 * Every annotation over the drawing — the five area chips and every room label
 * — is an HTML element positioned at a point in the CAD file's coordinate
 * space. A coordinate space does not mirror. The drawing already carries
 * `dir="ltr"` for exactly this reason, and this is the same rule reaching the
 * elements that sit on top of it.
 *
 * ⚠️ AND IT WAS ACTUALLY BROKEN. These used `insetInlineStart`, which looks
 * like the disciplined choice and is not: logical insets resolve against the
 * ELEMENT'S OWN direction, not its containing block's, and every one of these
 * elements carries `dir="rtl"` because the text inside it is Arabic. So
 * `inset-inline-start` became `right`, and the whole annotation layer was
 * mirrored across the plate: the 137 m² chip sat on the 125 m² apartment, and
 * «مطبخ» sat in a bedroom. Measured, not deduced — apartment 4's bbox centres
 * at 24% from the drawing's left edge and the chip was rendering at 71%.
 *
 * ⛔ DO NOT "FIX" THIS BACK TO A LOGICAL PROPERTY. If it must be logical, the
 * `dir="rtl"` has to move to an inner element first, and then this comment has
 * to move with it. The bug is not the physical property; the bug was mixing a
 * text direction and a coordinate direction on one element.
 *
 * `box` defaults to the whole plate, which is what the idle chips are measured
 * against; the room labels pass the zoom's TARGET box.
 */
function planPoint(
  x: number,
  y: number,
  box: Box = FULL,
): { left: string; top: string } {
  return {
    left: `${((x - box[0]) / box[2]) * 100}%`,
    top: `${((y - box[1]) / box[3]) * 100}%`,
  };
}

function programme(rooms: readonly PlanRoom[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const room of rooms) counts.set(room.name, (counts.get(room.name) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => {
    const ia = ROOM_ORDER.indexOf(a[0]);
    const ib = ROOM_ORDER.indexOf(b[0]);
    return (ia < 0 ? ROOM_ORDER.length : ia) - (ib < 0 ? ROOM_ORDER.length : ib);
  });
}

/* =============================================================================
 * THE THREE STATES OF THE DRAWING, AND WHY GREEN MEANS ONLY ONE THING
 * =============================================================================
 * The plate is always fully painted — the rooms are the drawing, not the
 * selection feedback, and they do not dim to make a control legible. What
 * changes is a layer of UI on top of them, in brand green and nothing else:
 *
 *   idle       one chip per apartment, sitting on it, carrying its area.
 *              ⛔ THIS IS THE ANSWER TO "ARE THE FIVE REGIONS PRESSABLE", AND
 *              A GREEN OUTLINE WAS NOT. The first version of the coloured plan
 *              drew a demising line around each apartment, which is the right
 *              convention on paper and invisible here: the apartment
 *              boundaries run down the middle of the party walls, so a
 *              hairline lands inside a band of near-black poché and cannot be
 *              seen at any size the page ever renders. The chips read as five
 *              controls, and they carry the fact a visitor came for.
 *   hover      a green wash over the one under the pointer.
 *   selected   ONE veil over the whole plate with the chosen apartment punched
 *              out of it, so the rest of the floor steps back toward the paper
 *              while the chosen rooms keep their real colour.
 *
 * ⚠️ THE VEIL IS A SINGLE PATH AND THAT IS THE POINT. Tinting the other four
 * apartments instead would leave the corridor, the stair and the shafts at
 * full strength between them — the plate would step back in patches. The
 * even-odd fill rule punches the hole, so it is one element, one opacity, one
 * transition, and everything that is not the selected apartment recedes by
 * exactly the same amount.
 *
 * ⛔ NOTHING ON THIS DRAWING IS GOLD. The section's one gold element is the
 * heading accent (AGENTS §8). Green here always means "you picked this" and
 * never means "this is a material" — which is why the material key in
 * `floor-plan-palette.ts` contains no green and no gold.
 * ========================================================================== */

/**
 * Hover, before anything has been picked: a green wash AND the outline the
 * selection will keep, at half strength.
 *
 * ⚠️ THE WASH ALONE WAS NOT ENOUGH AND IT IS WORTH KNOWING WHY. 7% of green
 * over rooms that are already coloured is a hue shift of a few ΔE — legible in
 * a side-by-side screenshot and invisible to somebody moving a pointer, who
 * has no side-by-side. The outline is what actually reports the hover, because
 * it appears where there was nothing rather than changing something that was
 * already there. The wash stays because it says which SIDE of the line is the
 * apartment.
 */
/* -----------------------------------------------------------------------------
 * Room-label nudges, keyed `apartment:name`, in DRAWING UNITS (cm).
 *
 * ⛔ THIS IS WHY THE GENERATED FILE STAYS UNTOUCHED. `floor-plan.generated.ts`
 * is derived data — the rule is that it is never hand-edited, only re-produced
 * by `scripts/extract-floor-plan.py`. A label's x/y there is the architect's own
 * TEXT ANCHOR, read out of the DXF, and it is correct as a record of what the
 * drawing says. Where it lands once that word is set in a 13px face at web
 * scale is a rendering question, and rendering questions belong here.
 *
 * ⚠️ IN CENTIMETRES, NOT PIXELS, SO THE NUDGE ZOOMS WITH THE PLATE. A pixel
 * offset would be the same 14px on a 340px phone plate and on a 700px desktop
 * one — i.e. twice the correction where none was needed. See the operator's
 * report: «الشقة 5» read wrong on a phone and fine on desktop, because the
 * label's pixel width is fixed while the drawing around it grows.
 *
 * ⛔ KEEP THIS LIST SHORT AND EARNED. One entry per label somebody actually
 * looked at and found sitting on a wall. It is not a styling hook, and a long
 * list here means the extractor's anchors are wrong and should be fixed there.
 * -------------------------------------------------------------------------- */
const LABEL_NUDGE: Record<string, readonly [number, number]> = {
  /* Operator, 2026-08-23: "«موزع» need to move a bit to the left". The
     architect anchored it hard against the partition between the corridor and
     the bedroom, so at phone scale the word crossed the wall line. -60cm walks
     it back into the middle of the موزع itself. */
  "5:موزع": [-60, 0],
};

const HOVER_WASH = 0.1;
const HOVER_LINE = 0.5;

/** How far the rest of the plate steps back once an apartment is picked. */
const VEIL = 0.74;

export function FloorPlanViewer() {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<Box>([...FULL] as Box);

  const active: PlanApartment | null =
    apartments.find((apartment) => apartment.no === selected) ?? null;
  const labelBox = active ? fitBox(active.bbox) : FULL;

  const apply = useCallback((box: Box) => {
    boxRef.current = box;
    svgRef.current?.setAttribute("viewBox", box.map((v) => Math.round(v)).join(" "));
  }, []);

  useEffect(() => {
    const target: Box = selected
      ? fitBox(apartments.find((a) => a.no === selected)!.bbox)
      : ([...FULL] as Box);
    const from = [...boxRef.current] as Box;
    if (reduced) {
      apply(target);
      return;
    }
    const controls = animate(0, 1, {
      duration: ZOOM_SECONDS,
      ease: [...EASE] as [number, number, number, number],
      onUpdate: (t) =>
        apply(from.map((v, i) => v + (target[i] - v) * t) as Box),
    });
    return () => controls.stop();
  }, [selected, reduced, apply]);

  /* Escape clears from anywhere, matching the regions schematic. */
  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      {/* ------------------------------------------------------- the drawing */}
      <figure className="lg:col-span-7">
        <div className="rounded-figure border-line bg-surface-0 overflow-hidden border">
          {/* ⛔ `dir="ltr"` ON THE DRAWING ONLY — never on the figure, never on
              the caption. A drawing is a coordinate space, not a text flow:
              mirroring it would put north on the wrong side and every room
              label in the wrong room. The caption below stays RTL so its full
              stops land at the correct end. This is the same split, and the
              same bug, as `regions-schematic.tsx`. */}
          <div
            dir="ltr"
            className="relative w-full"
            style={{ aspectRatio: `${W} / ${H}` }}
          >
            <svg
              ref={svgRef}
              viewBox={FULL.join(" ")}
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              {/* ---------------------------------------------- the drawing */}
              {/* Wall colour first, every room painted on top of it. The
                  openings go on last, in the same wall colour, so a door swing
                  and a window reveal read as lines cut into the floor rather
                  than as ink floating over it. */}
              <g style={{ pointerEvents: "none" }}>
                <path d={floorPlan.footprint} fill={PLAN_POCHE} />
                {floorPlan.spaces.map((space, index) => (
                  <path
                    /* Spaces have no id: they are geometry, and two rooms of
                       the same kind in the same apartment are not distinct to
                       anything here. The list order is stable across runs. */
                    key={index}
                    d={space.d}
                    fill={PLAN_TONE[space.kind]}
                  />
                ))}
                <g fill="none" stroke={PLAN_POCHE} vectorEffect="non-scaling-stroke">
                  {/* ⚠️ THE WALL LINE IS NOT REDUNDANT WITH THE POCHÉ, THOUGH
                      IT LOOKS IT. The rooms are traced from a raster whose
                      barriers are three pixels wide, so every painted room
                      stops about 1.5 cm short of the real wall face and its
                      edge is a simplified polygon, not a straight line. At
                      plate scale nobody can tell; zoomed into one apartment
                      the wall faces visibly waver. This is the architect's own
                      line, laid over the join, and it costs one path. */}
                  <path d={floorPlan.walls} strokeWidth={0.5} opacity={0.5} />
                  <path d={floorPlan.glazing} strokeWidth={0.75} opacity={0.55} />
                  <path d={floorPlan.stair} strokeWidth={0.75} opacity={0.5} />
                  <path d={floorPlan.doors} strokeWidth={0.75} opacity={0.35} />
                </g>
              </g>

              {/* ------------------------------------------------- the veil */}
              {/* The whole plate, with the selected apartment cut out of it by
                  the even-odd rule. See the note above the constants. */}
              <path
                d={`${floorPlan.footprint}${active?.d ?? ""}`}
                fill={PLAN_GROUND}
                fillRule="evenodd"
                className="transition-opacity duration-500"
                style={{ opacity: active ? VEIL : 0, pointerEvents: "none" }}
              />

              {/* ------------------------------------------- the five units */}
              {/* ⚠️ `pointerEvents: all` IS LOAD-BEARING. These paths are
                  transparent whenever nothing is hovered, and a fill that
                  paints nothing does not have to be hit-tested — which would
                  make the drawing a picture rather than a control. */}
              <g style={{ pointerEvents: "all" }}>
                {apartments.map((apartment) => (
                  <path
                    key={apartment.no}
                    d={apartment.d}
                    className={cn(
                      "fill-brand-600 stroke-brand-600 cursor-pointer",
                      "transition-[fill-opacity,stroke-opacity] duration-500",
                    )}
                    style={{
                      fillOpacity:
                        selected === null && hovered === apartment.no
                          ? HOVER_WASH
                          : 0,
                      strokeOpacity:
                        selected === apartment.no
                          ? 0.9
                          : selected === null && hovered === apartment.no
                            ? HOVER_LINE
                            : 0,
                    }}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    onClick={() =>
                      setSelected((current) =>
                        current === apartment.no ? null : apartment.no,
                      )
                    }
                    onPointerEnter={() => setHovered(apartment.no)}
                    onPointerLeave={() =>
                      setHovered((current) =>
                        current === apartment.no ? null : current,
                      )
                    }
                  />
                ))}
              </g>
            </svg>

            {/* --------------------------------------------- area callouts */}
            {/* One per apartment, idle only. They mark the five regions as
                five controls and carry the fact a visitor came for. They are
                `pointer-events-none` on purpose: the click falls through to
                the apartment path underneath, which is the real target, so a
                chip cannot become a second control with its own hit area. */}
            {apartments.map((apartment) => {
              const [bx, by, bw, bh] = apartment.bbox;
              return (
                <span
                  key={apartment.no}
                  aria-hidden
                  dir="rtl"
                  className={cn(
                    "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2",
                    "bg-surface-0/90 border-line rounded-full border px-2.5 py-1",
                    "font-display text-caption text-fg-muted whitespace-nowrap",
                    "transition-opacity duration-300",
                    selected === null ? "opacity-100" : "opacity-0",
                  )}
                  style={planPoint(bx + bw / 2, by + bh / 2)}
                >
                  {apartment.area} {units.fields.unit}
                </span>
              );
            })}

            {/* ------------------------------------------- the room labels */}
            {/* Positioned from the TARGET box, not the animating one, and
                faded in behind the zoom. Chasing the camera per frame would
                mean re-rendering these on every frame for a result nobody can
                read mid-flight anyway. */}
            {/* =====================================================================
                THEY SHOW ON A PHONE TOO, AND THEY DID NOT USE TO.
                =====================================================================
                This carried `hidden sm:block` and an argument for it: at 390px
                the drawing is ~330px wide, so ten labels at the 13px floor
                (AGENTS §9 — they may not go smaller) would collide with each
                other and with the walls, and the caption's chips were the
                better reading anyway.

                ⛔ THE ARGUMENT WAS WRONG AND IT WAS WRONG BECAUSE NOBODY
                MEASURED IT. Operator, 2026-08-23: "the names of each room on
                the phone size it not appear but in the desktop one its good".
                MEASURED on the live build, every apartment, both narrow
                widths, by rendering the labels and testing every pair of boxes
                for intersection:

                    390px   apt 1..5 → 7/8/8/10/9 labels, 0 overlaps, 0 outside
                    320px   apt 1..5 → 7/8/8/10/9 labels, 0 overlaps, 0 outside

                Including apartment 4, the ten-label case the old comment named
                as impossible. The reason is that Arabic room names are SHORT:
                «نوم» renders 16px wide, «حمام» 26px, «صالون» 33px — a third of
                what the estimate assumed. And these only ever render for the
                SELECTED apartment (`active?.rooms`), which is the zoomed state,
                where one flat has the whole plate to itself.

                ⚠️ RE-MEASURE, DO NOT RE-REASON, if the type scale, the label
                copy or the plate's aspect changes. The check is a pairwise
                intersection test over `[data-room-label]` at 320 and 390 with
                each apartment selected; it takes a minute and it is the only
                thing standing between this and a phone full of overlapping
                words. The chips in the caption stay either way — they carry
                the counts («نوم 2»), which the drawing cannot. */}
            {active?.rooms.map((room, index) => (
              <span
                key={`${room.name}-${index}`}
                aria-hidden
                dir="rtl"
                /* The handle the overlap check selects on — see the block
                   above. Nothing renders from it. */
                data-room-label
                className={cn(
                  "pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2",
                  "text-caption text-fg-muted whitespace-nowrap",
                  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500",
                  "motion-safe:fill-mode-both motion-safe:delay-300",
                )}
                style={planPoint(
                  room.x + (LABEL_NUDGE[`${active.no}:${room.name}`]?.[0] ?? 0),
                  room.y + (LABEL_NUDGE[`${active.no}:${room.name}`]?.[1] ?? 0),
                  labelBox,
                )}
              >
                {room.name}
              </span>
            ))}

            {/* ------------------------------------------------ the compass */}
            {/* ⛔ NORTH IS THE DRAWING'S LEFT. Derived, not assumed — see the
                header of `floor-plan.generated.ts`. Inside `dir="ltr"` the
                logical start IS the left edge, so the arrow and the word agree
                with the geometry without a physical property anywhere. */}
            {/* The chip is not decoration: the compass sits over the plate's
                bottom-left corner, which on this drawing is drawn linework,
                and the arrow read as part of the plan without it. */}
            <div
              aria-hidden
              className="text-fg-subtle bg-surface-0/85 absolute bottom-3 flex items-center gap-2 rounded-full px-2.5 py-1"
              style={{ insetInlineStart: "0.75rem" }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M21 12H4M4 12l6-5M4 12l6 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span dir="rtl" className="text-caption">
                {units.plan.north}
              </span>
            </div>
          </div>

          {/* ------------------------------------------------- the caption */}
          <figcaption className="border-line border-t p-6">
            {/* One live region, sized so the swap cannot move the page. The
                regions schematic shipped a 75px jump on a phone by letting a
                caption change height under the visitor's thumb. */}
            {/* MEASURED, not guessed — `npm run plan:caption`, 2026-08-23.
                Natural height of this block with the lock released, idle vs.
                the tallest of the five selections:

                    320px   idle 154   tallest 219
                    360px   idle  97   tallest 219
                    390px   idle  97   tallest 219
                    430px   idle  97   tallest 189
                   >=639px  idle  69   tallest 148

                ⚠️ THE TALLEST STATE IS NOT ALWAYS THE SAME APARTMENT. At 430px
                the five run 148 / 178 / 188 / 189 / 189 — the room chips wrap
                at different counts — so a lock derived from «شقة 1» alone would
                be 41px short. The script measures all five for that reason.

                So 14rem/224px below `sm` and 9.5rem/152px above it. The lock
                has to clear the TALLEST state at every width or selecting an
                apartment shoves the five-row list downward — and on a phone
                the list is directly below this card, so the row the visitor
                just tapped moves out from under their thumb. That is the bug
                the regions schematic shipped at 320px and it is not shipping
                twice.

                ⛔ THE NUMBERS ABOVE ARE A CLAIM AND `npm run plan:caption`
                PROVES IT. The script drives this page in a headless browser,
                strips the two classes below, and measures the block idle and
                against all five apartments at every width — then fails if the
                lock it finds in THIS FILE no longer clears the tallest state.
                Re-run it after any edit to the chips, the labels or the
                padding; it takes about a minute and it is the difference
                between a measured lock and a remembered one.

                ⚠️ `data-slot` and the `min-h-*` classes are the script's two
                handles. Rename either and read scripts/measure-caption.mjs
                before you do. */}
            <div
              data-slot="plan-caption"
              aria-live="polite"
              className="min-h-56 sm:min-h-[9.5rem]"
            >
              {active ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-h4 text-fg">
                      {units.fields.apartment} {active.no}
                    </h3>
                    <span className="text-caption text-fg-subtle">
                      {active.orientation}
                    </span>
                  </div>

                  {/* The room programme, exactly as the drawing labels it. The
                      count rides the chip rather than inflecting the noun —
                      «حمام 2» needs no dual and «غرفة» never silently becomes
                      «نوم». See ROOM_ORDER. */}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {programme(active.rooms).map(([name, count]) => (
                      <li
                        key={name}
                        className="border-line text-caption text-fg-muted flex items-baseline gap-1.5 rounded-full border px-3 py-1"
                      >
                        <span>{name}</span>
                        {count > 1 ? (
                          <span className="text-fg-subtle font-display">
                            {count}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  {/* ⛔ THE BASEMENT FIGURES LIVE HERE, NOT IN THE LIST. They
                      were a `<dl>` revealed inside the selected list row, which
                      grew that row by ~30px and pushed every row below it down
                      — under the pointer that had just clicked, on a control
                      surface where the next click is likely to be the row that
                      moved. The caption is already a fixed-height live region,
                      so the same facts cost nothing here.

                      They belong to the APARTMENT, not to the plate on screen:
                      this is the ground-and-typical plan, and the basement is
                      a different drawing with smaller flats and private
                      gardens. `notes.basement` says so in the section. */}
                  <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t pt-3">
                    <dl className="text-caption flex flex-wrap gap-x-6 gap-y-1">
                      <div>
                        <dt className="text-fg-subtle inline">
                          {units.fields.basement}:{" "}
                        </dt>
                        <dd className="text-fg-muted inline">
                          {active.basementArea} {units.fields.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-fg-subtle inline">
                          {units.fields.garden}:{" "}
                        </dt>
                        <dd className="text-fg-muted inline">
                          {active.gardenArea} {units.fields.unit}
                        </dd>
                      </div>
                    </dl>

                    {/* ⛔ THE WAY OUT SITS INSIDE WHAT IT UNDOES, AND ONLY WHEN
                        THERE IS SOMETHING TO UNDO. It was a permanently
                        rendered ghost button under the list, so the idle state
                        ended on a greyed-out disabled control — a dead
                        affordance advertising a state the visitor had not
                        reached. It is on this row rather than beside the
                        heading because at 320px it wrapped that row in two and
                        the card is height-locked, so every wrap is paid for on
                        every phone in blank space. Escape still clears from
                        anywhere. */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-me-3"
                      onClick={() => setSelected(null)}
                    >
                      {units.plan.clear}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-h4 text-fg">
                    {units.plan.label}
                  </h3>
                  <p className="text-body-sm text-fg-muted mt-3 text-pretty">
                    {units.plan.idle} {units.plan.hint}
                  </p>
                </>
              )}
            </div>
          </figcaption>
        </div>
      </figure>

      {/* ---------------------------------------------------------- the list */}
      <div className="lg:col-span-5">
        <ul aria-label={units.listLabel} className="flex flex-col">
          {apartments.map((apartment) => {
            const isActive = selected === apartment.no;
            return (
              <li
                key={apartment.no}
                className={cn(
                  "border-line border-t transition-colors",
                  isActive && "bg-veil-05",
                )}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  /* The handle `npm run plan:caption` drives the five states
                     by. Nothing renders from it — see scripts/measure-caption
                     .mjs, and the comment on the caption's live region. */
                  data-apartment={apartment.no}
                  onClick={() =>
                    setSelected((current) =>
                      current === apartment.no ? null : apartment.no,
                    )
                  }
                  onPointerEnter={() => setHovered(apartment.no)}
                  onPointerLeave={() =>
                    setHovered((current) =>
                      current === apartment.no ? null : current,
                    )
                  }
                  className={cn(
                    "group/row focus-visible:outline-ring -mx-4 flex w-[calc(100%+2rem)] min-h-11 flex-wrap",
                    "items-baseline justify-between gap-x-6 gap-y-1 rounded-md px-4 py-5",
                    "text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    !isActive && "hover:bg-veil-05",
                  )}
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-body text-fg">
                      {units.fields.apartment} {apartment.no}
                    </span>
                    <span className="text-caption text-fg-subtle">
                      {apartment.orientation}
                    </span>
                  </span>
                  <span className="font-display text-h4 text-fg">
                    {apartment.area}{" "}
                    <span className="text-caption text-fg-subtle">
                      {units.fields.unit}
                    </span>
                  </span>
                </button>

              </li>
            );
          })}
        </ul>
        {/* Closes the five rows the way every other list on the site closes:
            a hairline, not a control. The clear button moved into the caption
            beside the selection it clears. */}
        <div className="border-line border-t" />
      </div>
    </div>
  );
}
