"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/* -----------------------------------------------------------------------------
 * MOTION ENVIRONMENT — the four things every motion file in this folder needs.
 * Owner: NEON. Spec: SOVA §15.
 *
 * =============================================================================
 * 1. THE OWNERSHIP RULE (SOVA §15.1) — it is structural, not advisory
 * =============================================================================
 *
 *   GSAP + Lenis own everything driven by SCROLL POSITION.
 *   Framer Motion owns everything driven by STATE or POINTER.
 *   No element is ever touched by both.
 *
 * Enforced by vocabulary: GSAP only ever selects through `data-*` attributes
 * (the DOM contracts waves 1–3 left in the section files); Framer only ever
 * drives `motion.*` components and `animate()` calls it owns end to end. A
 * violation is therefore visible in the source — if you find a `motion.div`
 * with a `data-` hook that a ScrollTrigger also selects, that is the bug.
 *
 * =============================================================================
 * 2. PACING (SOVA §15.2) — this is what makes it read as cinematic
 * =============================================================================
 * Entrances 1.0–1.6s on `expo.out`. Staggers 0.06–0.12. Scrubs 1.0–1.2.
 * The old site ran 0.65–1.15s on power3/power4 and felt hurried. Slow is the
 * point. Ceiling: no more than TWO animated groups in flight per viewport.
 *
 * =============================================================================
 * 3. THE RTL TRAP (SOVA §16.10) — `dirX` is mandatory
 * =============================================================================
 * GSAP's `x` / `xPercent` are PHYSICAL. They do not mirror with `dir="rtl"`.
 * A literal `x: 42` is 42 physical pixels to the right whatever the document
 * says, so the same tween enters from opposite edges in the two directions.
 * `dirX(42)` is the same intent expressed logically — "42px toward the
 * inline-START edge" — and resolves per direction. See its doc comment for the
 * sign, which is not the one you would guess.
 *
 * ⛔ EVERY horizontal tween in this codebase goes through `dirX`, the projects
 * track included. There are no exceptions.
 *
 * =============================================================================
 * 4. REDUCED MOTION (SOVA §15.4)
 * =============================================================================
 * `prefersReducedMotion()` is checked before ANY timeline is built. When true:
 * no Lenis, no scrubs, no pin, no intro, no parallax — only opacity fades of
 * ≤150ms. Every element's base CSS state is already its final visual state
 * (waves 1–3 guaranteed that), so "do nothing" is always a correct fallback.
 * -------------------------------------------------------------------------- */

let registered = false;

/**
 * Register the plugins exactly once. GSAP 3.13 made every plugin free —
 * SplitText and ScrollTrigger included — so these are plain imports with no
 * Club membership and no CDN workaround.
 */
export function registerMotion() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  registered = true;
}

/** True while the visitor has asked the OS for less motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True on a pointing device that can hover — desktop, not touch. */
export function hasFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** The document's writing direction. Read once per call; it never changes. */
export function isRtl() {
  if (typeof document === "undefined") return true;
  return document.documentElement.dir !== "ltr";
}

/**
 * ⛔ THE ONLY WAY A HORIZONTAL DISTANCE IS WRITTEN IN THIS CODEBASE.
 *
 * `dirX(58)` means "58px toward the inline-START edge". In Arabic the start
 * edge is the RIGHT, so it returns +58 (physically rightward); in an LTR
 * document it returns −58. GSAP will not do this for you: `x` and `xPercent`
 * are physical pixels on the physical axis (SOVA §16.10).
 *
 * ⚠ THE SIGN IS THE OPPOSITE OF WHAT IT LOOKS LIKE, AND IT WAS VERIFIED, NOT
 * ASSUMED. Two independent checks:
 *
 *   · the live site's own values. `script.js` runs in the same RTL document
 *     and writes `gsap.from(".story-card", { x: 42 })` and
 *     `{ x: 58 }` for the membership steps — POSITIVE, i.e. entering from the
 *     right. `dirX(42)` reproduces that exactly, and would flip it correctly
 *     if this document ever became LTR.
 *   · the projects track. In an RTL flex row the overflow hangs off the LEFT
 *     edge of the container, so the track has to travel toward POSITIVE x to
 *     bring the last card into view — `x: dirX(travel)`. The live site writes
 *     the same positive travel by hand. (The motion brief's note that the
 *     track "travels negative x in RTL" is the one place it is wrong; the
 *     sign below is what the browser actually does, checked in a screenshot
 *     of the pinned rail at mid-timeline.)
 */
export function dirX(distance: number) {
  return isRtl() ? distance : -distance;
}

/** The house ease (`--ease-out-expo`) as GSAP spells it. */
export const EASE = "expo.out";

/** Entrance durations, in seconds. SOVA §15.2's 1.0–1.6s band. */
export const DUR = {
  /** Small elements, hairlines, captions. */
  quick: 1,
  /** The default entrance. */
  base: 1.2,
  /** Figures, headlines, anything large. */
  slow: 1.4,
  /** The hero's own beats. */
  hero: 1.6,
} as const;

/** Scrub value for every scrubbed timeline (SOVA §15.2 says 1.0–1.2). */
export const SCRUB = 1.15;

/**
 * `useReducedMotion` for the two components that must RENDER differently
 * rather than merely animate differently (the Lenis root, the card hover).
 *
 * The lazy initialiser reads the media query during the first client render.
 * That is safe here because neither consumer changes the DOM it produces —
 * only whether a behaviour is attached — so hydration sees identical markup.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
