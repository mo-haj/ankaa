"use client";

import { useEffect } from "react";
import { animate } from "motion/react";

import { dirX, prefersReducedMotion } from "@/components/motion/motion-env";

/* -----------------------------------------------------------------------------
 * useProjectReveal — the circular clip-path reveal from the click coordinates.
 * SOVA calls this the best interaction on the current site (§15.3, "Project
 * detail transition"), and it is the one thing here that is a PORT rather than
 * a rebuild: `circle(0 → hypot)` over 0.85s on `power4.inOut`, panels ∓8%.
 *
 * Framer's territory — it is a route/pointer transition, not a scrub.
 *
 * =============================================================================
 * WHERE THE ORIGIN COMES FROM, AND WHY IT NEEDS CONVERTING
 * =============================================================================
 * <ProjectsRail> captures the activation point once at the track level and
 * writes it to <html> as `--project-reveal-x` / `--project-reveal-y` in
 * VIEWPORT pixels (pointer position on a click, the card's own centre on a
 * keyboard Enter — the reveal always starts from the thing the visitor acted
 * on). `clip-path` lengths, however, are resolved against the ELEMENT's border
 * box, not the viewport, so both values are rebased through the panel's own
 * rect here. Skipping that conversion is the classic version of this bug: it
 * looks right on a full-bleed modal and wrong on a centred one.
 *
 * THE FALLBACK IS LOAD-BEARING. A direct visit to /projects/[slug] never sets
 * those properties, so `parseFloat("")` is NaN and the origin falls back to the
 * panel's centre — still a correct centre-out reveal, never a reveal from the
 * corner. And under reduced motion nothing is applied at all: the panel's base
 * state carries no clip-path, so it is simply already open.
 *
 * The inline offset is `dirX` like every other horizontal value in this build:
 * each panel enters from its OWN outer edge, and which physical edge that is
 * depends on the document's direction (SOVA §16.10). In this RTL grid the
 * media figure is the first column and therefore sits at the physical right.
 *
 * ⚠ NOT ANIMATED ON CLOSE. Radix unmounts the panel on close, and holding it
 * mounted with `forceMount` to play an exit would mean owning the focus
 * restore and the `inert` sweep by hand — which is exactly what the old site's
 * hand-rolled modal got wrong (SOVA §10.9). Radix's own 100ms fade-out plays
 * instead. That is a deliberate trade, not an omission.
 *
 * ⛔ WHY THIS QUERIES THE DOM INSTEAD OF TAKING A ref. It took one, and the
 * ref was ALWAYS null. `<DialogContent>` is shadcn's wrapper around
 * `DialogPrimitive.Content` and it spreads `...props` through — TypeScript
 * accepts `ref` on it and the build is green — but at runtime the ref never
 * reaches the DOM node, so the hook returned early on every open and the
 * reveal silently did not exist. Nothing failed: the panel appeared, just
 * instantly. Caught only by sampling `clip-path` frame by frame in a real
 * browser after the click.
 *
 * `[data-slot="project-overlay"]` is portalled and there is exactly one of it
 * on the page, so the query is unambiguous. If someone later fixes the ref
 * forwarding in `ui/dialog.tsx`, this can go back to a ref — but check it in a
 * browser, because the type system will not tell you either way.
 *
 * ⛔ AND WHY IT WAITS FOR THE NODE WITH A MutationObserver. Radix's
 * `<DialogPortal>` does not create its portal during the first render — it sets
 * a mounted flag in a layout effect and portals on the render after — so this
 * component's own effect runs while the panel does not exist yet, even with
 * `defaultOpen`. Querying once found nothing and the reveal never started (the
 * second version of the same silent bug). A MutationObserver fires as a
 * microtask the moment the node is inserted, which is BEFORE the browser paints
 * it, so the panel is never seen unclipped. Polling on rAF would have cost a
 * visible frame of the un-revealed panel.
 * -------------------------------------------------------------------------- */

/** The portalled panel. Exactly one exists while an overlay is open. */
const PANEL_SELECTOR = '[data-slot="project-overlay"]';

/** 0.85s `power4.inOut`, as a cubic-bezier Framer understands. */
const REVEAL = { duration: 0.85, ease: [0.77, 0, 0.175, 1] } as const;
const PANEL = { duration: 0.85, ease: [0.16, 1, 0.3, 1] } as const;

export function useProjectReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let stop: (() => void) | undefined;

    const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);
    if (panel) {
      stop = reveal(panel);
    } else {
      const observer = new MutationObserver(() => {
        const found = document.querySelector<HTMLElement>(PANEL_SELECTOR);
        if (!found) return;
        observer.disconnect();
        stop = reveal(found);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const disconnect = () => observer.disconnect();
      return () => {
        disconnect();
        stop?.();
      };
    }

    return () => stop?.();
  }, []);
}

/**
 * Runs the reveal on a panel that is known to be in the DOM. Returns a stopper.
 *
 * ⚠ THE PANEL IS MID-TRANSFORM WHEN THIS RUNS. Radix's own 100ms
 * `zoom-in-95` is playing and the panel is centred with a translate, so
 * `getBoundingClientRect()` reports the SCALED box while `clip-path` lengths
 * resolve against the UNSCALED border box. Dimensions therefore come from
 * `offsetWidth`/`offsetHeight` and the origin is divided back through the
 * scale — otherwise the circle stops a few pixels short of the far corner and
 * leaves a sliver of the panel unrevealed at the very end of the wipe.
 */
function reveal(panel: HTMLElement) {
  const rect = panel.getBoundingClientRect();
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  if (!width || !height || !rect.width || !rect.height) return undefined;

  const scaleX = rect.width / width;
  const scaleY = rect.height / height;

  const root = getComputedStyle(document.documentElement);
  const viewportX = Number.parseFloat(root.getPropertyValue("--project-reveal-x"));
  const viewportY = Number.parseFloat(root.getPropertyValue("--project-reveal-y"));
  const x = Number.isFinite(viewportX) ? (viewportX - rect.left) / scaleX : width / 2;
  const y = Number.isFinite(viewportY) ? (viewportY - rect.top) / scaleY : height / 2;

  /* READ ONCE, THEN CLEAR — CYPHER. <ProjectsRail> writes these on <html> and
     nothing ever removed them, so they outlived the panel they were captured
     for: any later route change into /projects/[slug] that did NOT go through
     a card (a `<Link>` elsewhere, a history restore) started its wipe from
     stale coordinates instead of falling back to the panel's own centre.
     Clearing here makes the fallback in the two lines above the truth for
     every activation that did not just supply a point of its own. */
  document.documentElement.style.removeProperty("--project-reveal-x");
  document.documentElement.style.removeProperty("--project-reveal-y");

  // The furthest corner — anything smaller leaves an unrevealed wedge.
  const radius = Math.ceil(
    Math.max(
      Math.hypot(x, y),
      Math.hypot(width - x, y),
      Math.hypot(x, height - y),
      Math.hypot(width - x, height - y),
    ),
  );

  // Applied SYNCHRONOUSLY, before `animate()` schedules its first frame. The
  // MutationObserver runs before paint, but Framer starts on its own tick — so
  // without this line the panel gets exactly one painted frame at full size
  // before the circle closes over it, which reads as a flash.
  panel.style.clipPath = `circle(0px at ${x}px ${y}px)`;

  const wipe = animate(
    panel,
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    REVEAL,
  );
  // Hand the element back to CSS once it is fully open, so a later resize
  // cannot leave the panel clipped to a stale radius. One frame after the
  // finish, because Framer commits its own final value on the finishing frame
  // and would otherwise write it straight back.
  wipe.then(() => {
    requestAnimationFrame(() => {
      panel.style.clipPath = "";
    });
  });

  const media = panel.querySelector<HTMLElement>('[data-slot="project-detail-media"]');
  const body = panel.querySelector<HTMLElement>('[data-slot="project-detail-body"]');
  const panels = ([[media, dirX(8)], [body, dirX(-8)]] as const)
    .filter((entry): entry is readonly [HTMLElement, number] => Boolean(entry[0]))
    .map(([element, offset]) => animate(element, { x: [`${offset}%`, "0%"] }, PANEL));

  return () => {
    wipe.stop();
    panels.forEach((control) => control.stop());
    panel.style.clipPath = "";
  };
}
