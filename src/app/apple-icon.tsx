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
