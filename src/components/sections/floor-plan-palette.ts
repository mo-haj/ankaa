import type { PlanSpace } from "@/content/floor-plan.generated";

/* =============================================================================
 * THE MATERIAL KEY — why the plan is coloured and not a line drawing.
 *
 * "i dont like the look at the image as just lines its more for معماريين not
 * for a normal user" — the operator, and they were right. Hairlines on white
 * is how a plan is issued to a contractor. It is not how a building is shown
 * to somebody deciding where their family will live, and this section's whole
 * job is the second one.
 *
 * So the plate is drawn the way a property listing draws one: the footprint
 * filled once in the wall colour, every room painted on top of it, and what
 * still shows between the rooms IS the wall. Poché. No wall polygon is
 * computed and none is needed — see `FloorPlan.footprint` in
 * `floor-plan.generated.ts`.
 *
 * ⛔ THE TONES ARE A MATERIAL KEY, NOT DECORATION, AND NOT A SPECIFICATION.
 * They say "this is a wet room, that is a living space", which is the one
 * thing a non-architect reads off a plan instantly and cannot get from an
 * outline. They do NOT say the floor is oak: no finish schedule exists —
 * `materialSamples` in placeholders.ts is still an open request — so nothing
 * here is captioned with a material name anywhere in the interface, and no
 * tone below is named after one in the code either.
 *
 * Each room's tone comes from the ARCHITECT'S OWN LABEL, never from its shape
 * or its size: a 4 m² cell is a bathroom because the drawing says حمام. See
 * `ROOM_TYPE` in `scripts/extract-floor-plan.py`.
 *
 * =============================================================================
 * ⚠️ LITERALS, DELIBERATELY, AND THEY MUST NOT BECOME TOKENS.
 * =============================================================================
 * This is a chart palette for one drawing, not part of the design system.
 * Putting eight material tones into `globals.css` would add eight colours the
 * rest of the site can reach for, and none of them belong on a button. AGENTS
 * §11 asks that new TOKENS be registered in `utils.ts`; the answer here is to
 * not make them tokens. They are sampled to sit inside the warm neutral family
 * the page already uses, all of them between `--color-surface-0` (#fbfaf6) and
 * `--color-surface-2` (#ece8dc) in weight, so the plate reads as one material
 * and the differences read as rooms rather than as colours.
 *
 * ⛔ NOTHING HERE IS GOLD AND NOTHING HERE IS BRAND GREEN. The section's one
 * gold element is the heading accent (AGENTS §8); brand green is reserved for
 * the selection UI in `floor-plan-viewer.tsx`, so that green on this drawing
 * always means "you picked this" and never means "this is a material".
 *
 * ⛔ THIS FILE IS THE ONE COPY. `scripts/render-plan-png.mjs` imports it to
 * paint the export, so the PNG handed to anyone is provably the same drawing
 * as the one on the page. Do not inline a hex anywhere else.
 * ========================================================================== */

/** The wall. Everything the rooms do not cover is left showing as this. */
export const PLAN_POCHE = "#37423e";

/** The sheet the plate is drawn on — `--color-surface-0`, as a literal. */
export const PLAN_GROUND = "#fbfaf6";

/**
 * One tone per room type.
 *
 * The ladder is warm → cool, not light → dark: the rooms a family lives in are
 * the warmest, the wet rooms are the coolest, and outdoors is cooler still.
 * A visitor reads that in one glance without a legend, which is the point.
 */
export const PLAN_TONE: Record<PlanSpace["kind"], string> = {
  /** صالون / معيشة — the warmest, and the widest rooms on the plate. */
  living: "#e6dcc3",
  /** نوم / غرفة — the same family, a step quieter. */
  bed: "#efe8d8",
  /** مطبخ — a working room: stone, not oat. */
  kitchen: "#ddd7c8",
  /** حمام — wet rooms, and the only tone that turns cool. */
  bath: "#d2d6d1",
  /** موزع — circulation inside the apartment, between the two. */
  hall: "#e5e0d3",
  /** برندا — outdoors. Cooler and lighter: this is not heated floor. */
  balcony: "#e7e9e2",
  /** منور — a light shaft. Not floor at all; the darkest tone here. */
  void: "#c7c7bf",
  /** Corridor, stair, shafts — the public parts, and grey on purpose. */
  core: "#dbd9d1",
};
