"use client";

import dynamic from "next/dynamic";

/* -----------------------------------------------------------------------------
 * <SmoothScrollMount> — the four lines that keep 336KB of GSAP off every route.
 *
 * CHAMBER C2-1 measured 336KB of gsap / ScrollTrigger / lenis in the shared
 * chunk group of EVERY prerendered route, including the 404, where it was about
 * 35% of the page's JavaScript. The cause was a static import of the smooth
 * scroll module in the root layout; `smooth-scroll.tsx` explains the other half
 * of the fix (it stopped wrapping `{children}`, which is what made deferring it
 * possible at all).
 *
 * ⛔ WHY THIS FILE EXISTS AT ALL. `next/dynamic` with `ssr: false` is a client
 * boundary and `layout.tsx` is a Server Component — App Router rejects the
 * combination outright. So the `"use client"` boundary has to be its own module,
 * and this is the smallest one that can hold it. It is statically imported by
 * the layout, which is fine: what ships eagerly is these four lines, not gsap.
 *
 * `ssr: false` is correct rather than merely convenient. Lenis attaches to
 * `window`, `ScrollTrigger` measures a laid-out document, and both render
 * nothing — there is no markup to prerender and nothing to hydrate, so there is
 * no flash and no mismatch.
 * -------------------------------------------------------------------------- */

const SmoothScroll = dynamic(
  () => import("@/components/motion/smooth-scroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

export function SmoothScrollMount() {
  return <SmoothScroll />;
}
