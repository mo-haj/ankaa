/* -----------------------------------------------------------------------------
 * THE HERO FRAME — one condition, three consumers.
 *
 * ⛔ THIS FILE EXISTS BECAUSE THE SAME SETTING USED TO BE WRITTEN TWICE.
 * `hero.tsx` carried `md:object-center` and `hidden md:block`, and
 * `hero-motion.tsx` carried a bare `window.matchMedia("(min-width: 768px)")`,
 * with a comment on both saying "if that class changes, change this with it".
 * That is a rule a human has to remember. It is now a constant.
 *
 * =============================================================================
 * WHY AN ASPECT RATIO AND NOT A WIDTH
 * =============================================================================
 * The hero is `min-h-svh`, so its box is as tall as the viewport, and the
 * render inside it is `object-cover`. What decides how much of a photograph
 * survives that is not the viewport's WIDTH — it is the box's ASPECT against
 * the image's. `hero.webp` is 1672x941 (1.777). Measured share of the frame
 * left on screen:
 *
 *     1440x900  1.600   90%        768x900   0.853   48%   ← half the picture
 *     1024x900  1.138   64%        430x900   0.478   27%   ← three quarters gone
 *
 * At 430 the tower's roof was cut and only a sliver of its width survived: the
 * building is ~0.57 aspect and a phone hero box is ~0.48, so NO crop of a
 * landscape source can hold it. The fix is a second render, not a cleverer
 * `object-position` — `main-vertical.webp` (1086x1448, 0.750) is the same
 * building at the same golden hour, shot portrait, and it was already in
 * `public/images/` unused.
 *
 * The crossover is 1/1, and it is measured rather than picked. Below it the
 * portrait render is dramatically better (768x1024 is a 0% crop — the box and
 * the image are the same shape; 768x900 keeps the whole tower). Above it the
 * portrait render would start cropping the tower's top vertically while the
 * landscape one still holds it, so 1/1 is where they swap places.
 * -------------------------------------------------------------------------- */

/**
 * True when the hero box is landscape-or-square, i.e. when `hero.webp` is the
 * render on screen. Its complement selects `main-vertical.webp`.
 */
export const HERO_LANDSCAPE = "(min-aspect-ratio: 1/1)";

/** The complement, for the `<source>` that swaps in the portrait render. */
export const HERO_PORTRAIT = "(max-aspect-ratio: 1/1)";

/* -----------------------------------------------------------------------------
 * THE DRAWING'S CONDITION.
 *
 * `<HeroBlueprint>` is drawn in `hero.webp`'s own 1672x941 space and stretched
 * over the image's box with `preserveAspectRatio="xMidYMid slice"` — the SVG
 * spelling of `object-cover` + `object-center`. So it is only ever registered
 * to the LANDSCAPE render. Draw it over `main-vertical.webp` and it is a ghost
 * outline lying on nothing, which is the exact failure SOVA §17 called the
 * sequence's one stated risk.
 *
 * It therefore needs BOTH terms: the landscape render must be the one on
 * screen, AND there must be room for the drawing at all (the old `md` floor,
 * kept — below it the intro skips the blueprint beat entirely rather than
 * playing 1.5s of animation on a `display: none` SVG).
 * -------------------------------------------------------------------------- */
/* ⛔ `aspect-ratio > 1/1`, A STRICT GREATER-THAN, AND NOT `min-aspect-ratio`.
   `min-aspect-ratio: 1/1` and `max-aspect-ratio: 1/1` BOTH match at exactly
   1/1 — they overlap rather than complement. Written that way this shipped a
   900x900 viewport showing the PORTRAIT render with the blueprint still
   `display: block` over it: an outline traced from a different photograph,
   which is the one failure this constant exists to make impossible.

   The <source> list resolves the same tie the other way round and needs no
   range syntax: a browser takes the FIRST matching <source>, `HERO_PORTRAIT`
   is first, so a square box gets the portrait render. This says `> 1/1`, so a
   square box gets no drawing. The two agree at every ratio including the
   boundary. Range syntax is Chrome 104+ / Safari 16.4+ / Firefox 102+, and it
   is used here in CSS and in `matchMedia` alike. */
export const HERO_BLUEPRINT_VISIBLE =
  "(min-width: 768px) and (aspect-ratio > 1/1)";
