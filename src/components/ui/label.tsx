"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * LABEL — restyled to Ankaa by ASTRA.
 *
 * 13px at weight 600 — the type floor and the label token. Arabic is UNICASE:
 * there is no small-caps or tracked-out-uppercase move available to mark a
 * label, so weight carries the entire job. That is also why the body face
 * (IBM Plex Sans Arabic) matters here — it has genuine 400/500/600 separation
 * where many Arabic families do not.
 *
 * `line-height` is 1.6 rather than shadcn's `leading-none`. A 1.0 leading
 * clips Arabic descenders and any tashkeel outright.
 * -------------------------------------------------------------------------- */

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-label text-fg flex items-center gap-2 font-semibold select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
