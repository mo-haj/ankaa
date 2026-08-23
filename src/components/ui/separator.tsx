"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * SEPARATOR — restyled to Ankaa by ASTRA.
 *
 * Ground-aware: `--line` is rgb(0 39 36 / .12) on light and
 * rgb(255 255 255 / .14) on dark, so one component covers both. That replaces
 * the ~46 hand-written rgba values the old stylesheet used for exactly this.
 *
 * `tone="gold"` is the 28px kicker rule at full width — the section-divider
 * form of the brand hairline. It is a gold element: one per section.
 * For a divider that carries the wing's actual curvature instead of running
 * flat, use <WingRule> from @/components/brand.
 * -------------------------------------------------------------------------- */

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  tone = "line",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  tone?: "line" | "strong" | "gold"
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-tone={tone}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        tone === "line" && "bg-line",
        tone === "strong" && "bg-line-strong",
        tone === "gold" && "bg-accent-hair",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
