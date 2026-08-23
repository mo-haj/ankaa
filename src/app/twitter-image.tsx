/* -----------------------------------------------------------------------------
 * TWITTER / X CARD — the same image as the Open Graph card.
 *
 * `summary_large_image` (set in layout.tsx) uses the same 1200×630 frame, and a
 * second composition would be a second thing to keep true. Re-exported rather
 * than duplicated so there is exactly one file to edit.
 * -------------------------------------------------------------------------- */
/* ⚠️ `dynamic` is declared here rather than re-exported with the rest. Next
   parses this field statically at compile time and rejects a re-export:
   "Next.js can't recognize the exported `dynamic` field in route. It mustn't
   be reexported." Everything else on the line below re-exports fine. */
export const dynamic = "force-static";

export { alt, size, contentType, default } from "./opengraph-image";
