import { ImageResponse } from "next/og";

import { markDataUri, OG_GOLD, OG_GREEN } from "./_brand/mark-svg";

/* -----------------------------------------------------------------------------
 * APPLE TOUCH ICON — 180×180, the size iOS asks for when a visitor adds the
 * site to a home screen. Same mark, same ground, more air: at 180px the icon
 * is rendered large enough for the three towers under the wing to read, so the
 * mark is inset rather than filling the square.
 *
 * iOS composites this onto its own rounded-rectangle mask and does not respect
 * transparency, which is the second reason the ground is painted.
 * -------------------------------------------------------------------------- */

/* Both build targets generate this once, at build time — nothing in it reads
   the request. Declaring that is REQUIRED by `output: "export"` (the Pages
   target), which refuses to collect a metadata image route without it, and is
   a no-op on Vercel where it was already static. */
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori. */}
        <img src={markDataUri(OG_GOLD)} width={116} height={112} alt="" />
      </div>
    ),
    size,
  );
}
