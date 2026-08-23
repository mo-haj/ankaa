import { ImageResponse } from "next/og";

import { markDataUri, OG_GOLD, OG_GREEN } from "./_brand/mark-svg";

/* -----------------------------------------------------------------------------
 * FAVICON — SOVA §9 #15 ("no favicon, no OG/Twitter tags").
 *
 * Generated from <AnkaaMark />'s own path data, so the tab icon is the real
 * brand trace rather than a framework default. The scaffold's Next.js triangle
 * `favicon.ico` was deleted in the same commit — while it existed it won the
 * `/favicon.ico` route and this file was decorative.
 *
 * Green ground, gold mark: at 32px the mark's silhouette is what reads, and a
 * gold-on-green square is identifiable in a tab strip at a glance. A
 * transparent version was tried and lost — the phoenix is a thin trace and
 * disappears against a dark browser chrome.
 * -------------------------------------------------------------------------- */

/* Both build targets generate this once, at build time — nothing in it reads
   the request. Declaring that is REQUIRED by `output: "export"` (the Pages
   target), which refuses to collect a metadata image route without it, and is
   a no-op on Vercel where it was already static. */
export const dynamic = "force-static";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: OG_GREEN,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse
            renders with Satori, which has no next/image runtime. */}
        <img src={markDataUri(OG_GOLD)} width={24} height={23} alt="" />
      </div>
    ),
    size,
  );
}
