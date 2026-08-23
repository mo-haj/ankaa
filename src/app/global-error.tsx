"use client";

import { errors } from "@/content/errors";

/* =============================================================================
 * GLOBAL ERROR — the last-resort boundary.
 *
 * This renders when the ROOT LAYOUT itself throws. `error.tsx` cannot catch
 * that: it is mounted *inside* the layout it would have to replace. So this
 * file REPLACES the root layout — and with it the header, the footer, the
 * `<DirectionProvider>`, `next/font`, and `globals.css`.
 *
 * -----------------------------------------------------------------------------
 * ⛔ EVERY ASSUMPTION THE REST OF THE CODEBASE MAKES IS FALSE IN THIS FILE.
 * -----------------------------------------------------------------------------
 *   · NO Tailwind. A `className="text-body text-fg"` here resolves to nothing
 *     — and it FAILS SILENTLY: the build is green, lint is green, and the page
 *     ships as unstyled black-on-white Times. Every rule below is inline CSS.
 *   · NO `dir="rtl"` from the layout, NO `lang="ar"`. Both are declared here,
 *     on this file's own <html>, or an Arabic error page ships left-aligned.
 *   · NO Alexandria / IBM Plex Sans Arabic. `next/font` is injected by the
 *     layout. The stack below is OS Arabic faces only — Segoe UI is the
 *     Windows Arabic default, Geeza Pro / Damascus the Apple ones, Noto
 *     Naskh/Sans Arabic the Linux and Android ones. A web font here would be a
 *     network request on the one screen that exists because something already
 *     failed.
 *   · `letter-spacing: 0` is set EXPLICITLY. globals.css locks it for the
 *     whole RTL tree (AGENTS §2) and globals.css is not loaded — a UA or an
 *     extension default of anything non-zero severs Arabic letter joins.
 *   · `line-height: 1.8` for the same reason: the Arabic body value is a
 *     deliberate token, not a Latin default.
 *
 * The values are the ASTRA tokens copied literally — surface-inverse-1
 * #002724, ink-inv-1/2, gold-300 #d7cca9, the 8px/999px radii, the 4px space
 * ladder. Copied and not imported, because importing globals.css into this
 * file would pull the entire stylesheet into the failure path. IF THE PALETTE
 * EVER CHANGES, THIS FILE DOES NOT FOLLOW AUTOMATICALLY.
 *
 * GOLD BUDGET (AGENTS §8): exactly one gold element — the 28px hairline above
 * the heading, the same `.kicker-rule` motif the design system uses. The
 * buttons are paper and outline, not gold.
 *
 * Metadata exports are not supported in a client boundary, so the document
 * title is React 19's <title> element.
 *
 * ⚠ THIS IS ALSO A DEV-ONLY TRAP: since Next 15.2 `global-error` renders in
 * development too, behind the dev overlay. If you are testing it locally and
 * see the red error overlay instead, that is the overlay on top — the page
 * underneath is this one.
 * ========================================================================== */

/**
 * Self-contained. Kept as one string so it is obvious that nothing here can
 * come from the design system at runtime.
 */
const CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html {
  /* AGENTS §2 — Arabic is cursive. Tracking severs the letter joins, and this
     document has no globals.css to lock it to 0. */
  letter-spacing: 0;
  -webkit-text-size-adjust: 100%;
}
body {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  /* surface-inverse-1 — the brand green. */
  background-color: #002724;
  color: #ffffff;
  font-family: "Segoe UI", "Geeza Pro", "Damascus", "Noto Naskh Arabic",
    "Noto Sans Arabic", "Tahoma", system-ui, sans-serif;
  font-size: 1.0625rem; /* --text-body, 17px */
  line-height: 1.8;     /* the Arabic body value */
  -webkit-font-smoothing: antialiased;
}
.wrap {
  /* --shell-prose 44rem, with the 24px mobile gutter. */
  width: 100%;
  max-width: 44rem;
  margin-inline: auto;
  padding-inline: 1.5rem;
  padding-block: 4rem;
}
/* The kicker hairline — this page's ONE gold element. gold-300 #d7cca9 is the
   only gold the system allows as a mark on a dark ground. */
.rule {
  width: 28px;
  height: 1px;
  background-color: #d7cca9;
  margin-block-end: 1.5rem;
}
h1 {
  margin: 0;
  /* --text-h1: clamp(2rem, 3.6vw, 3rem) at weight 600, line-height 1.28. */
  font-size: clamp(2rem, 3.6vw, 3rem);
  font-weight: 600;
  line-height: 1.28;
  text-wrap: balance;
}
p.lead {
  margin: 1.5rem 0 0;
  /* ink-inv-2 — 10:1 on this ground. */
  color: rgba(255, 255, 255, 0.78);
  max-width: 62ch;
  text-wrap: pretty;
}
.actions {
  margin-block-start: 3rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.btn {
  /* The house control: a pill, 44px — the iOS/Android touch minimum. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding-inline: 1.5rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 0.9375rem; /* --text-body-sm, 15px */
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}
.btn-solid { background-color: #fbfaf6; color: #002724; }
.btn-solid:hover { background-color: #ece8dc; }
.btn-outline {
  background-color: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.28);
}
.btn-outline:hover { border-color: rgba(255, 255, 255, 0.55); }
/* AGENTS §11 trap 1 — never pair outline:none with a focus-visible outline.
   Nothing here removes the outline; this only makes the ring the system's
   gold at the system's offset. */
.btn:focus-visible { outline: 2px solid #d7cca9; outline-offset: 2px; }
.digest {
  margin-block-start: 4rem;
  padding-block-start: 1.5rem;
  border-block-start: 1px solid rgba(255, 255, 255, 0.14);
  /* --text-caption, 13px — the hard floor. Nothing on this site goes under it. */
  font-size: 0.8125rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.58);
}
.digest code {
  font-family: ui-monospace, "Cascadia Mono", "SF Mono", Menlo, monospace;
  font-size: 0.8125rem;
}
`;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  reset?: () => void;
}) {
  return (
    // This file owns the document. `lang` and `dir` are declared HERE because
    // the root layout that normally declares them is what just failed.
    <html lang="ar" dir="rtl">
      <body>
        <title>{errors.globalError.title}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />

        <main className="wrap">
          <div className="rule" aria-hidden />
          <h1>{errors.globalError.title}</h1>
          <p className="lead">{errors.globalError.body}</p>

          <div className="actions">
            {/* `retry()` re-fetches the segment before re-rendering; `reset()`
                only clears the boundary, so a server-side failure reproduces
                immediately. Next 16.3 made `retry` stable and its own docs
                say to prefer it. */}
            <button type="button" className="btn btn-solid" onClick={() => retry()}>
              {errors.globalError.retry}
            </button>
            {/* A plain <a>, not next/link — DELIBERATE, and the lint rule
                below is suppressed with cause, not silenced. `next/link` does
                a client-side transition through the very router that sits
                ABOVE this boundary; if the root layout is what threw, that
                router is the broken thing and the transition either fails or
                re-mounts straight back into this screen. A full document load
                is the only recovery that actually starts over. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see above: a hard navigation is required to escape a failed root layout. */}
            <a className="btn btn-outline" href="/">
              {errors.globalError.home}
            </a>
          </div>

          {error.digest ? (
            <p className="digest">
              {errors.globalError.digestLabel}{" "}
              {/* Latin hash inside an RTL paragraph: its own bidi isolate and
                  its own direction, or the visitor reads it out reordered. */}
              <bdi dir="ltr">
                <code>{error.digest}</code>
              </bdi>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
