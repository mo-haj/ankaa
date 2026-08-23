/* -----------------------------------------------------------------------------
 * The @modal slot's catch-all. Renders nothing, and that is its whole job.
 *
 * ⛔ THIS FILE CLOSES THE OVERLAY. DELETING IT REOPENS A REAL BUG — 2026-08-23,
 * reported by the operator: "when i clicked in the مخطط الطابق النموذجي the
 * popup window didnt close when it open the page".
 *
 * WHY IT HAPPENS. Parallel slots keep their active subpage across a CLIENT-SIDE
 * navigation. `next/dist/docs/01-app/03-api-reference/03-file-conventions/
 * parallel-routes.md` says it plainly: "client-side navigations to a route that
 * no longer match the slot will remain visible". So opening a project overlay
 * (`/projects/[slug]` intercepted over `/`) and then following the plan link to
 * `/plans/d-66` left the @modal slot still rendering the project dialog on top
 * of the plan page — the URL changed, the page underneath changed, and the
 * dialog stayed.
 *
 * `default.tsx` does NOT cover this. It is the fallback for a HARD navigation
 * or a refresh, which is a different moment entirely: on a soft navigation Next
 * never asks for it.
 *
 * The documented fix is exactly this file — a slot route that matches anything
 * else and returns null, so the slot has a match and that match is nothing.
 *
 * ⚠️ IT DOES NOT SHADOW THE INTERCEPTOR. `(.)projects/[slug]` is the more
 * specific match and still wins for a project URL reached by clicking a card;
 * this only picks up the routes the slot has no opinion about. `/` itself has
 * no segments, so it never reaches here — `default.tsx` handles that one, and
 * both files have to exist.
 * -------------------------------------------------------------------------- */
export default function ModalCatchAll() {
  return null;
}
