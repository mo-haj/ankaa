import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * BADGE — restyled to Ankaa by ASTRA.
 *
 * Sized at the 13px type floor, not 12px. shadcn's `text-xs` (12px) is below
 * this system's hard floor — SOVA 12.2: nothing under 13px ships, and killing
 * the sub-13px cluster is the single biggest luxury gain in the rebuild.
 * Height goes 20px -> 26px to give 13px text room to breathe in Arabic, whose
 * descenders and dots need more vertical space than Latin at the same size.
 *
 * `gold` is a gold element and counts against the section's budget of one.
 * -------------------------------------------------------------------------- */

const badgeVariants = cva(
  [
    "group/badge inline-flex h-[1.625rem] w-fit shrink-0 items-center justify-center gap-1.5",
    "overflow-hidden rounded-full border border-transparent px-3",
    "text-label font-semibold whitespace-nowrap",
    "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&>svg]:pointer-events-none [&>svg]:size-3.5!",
  ],
  {
    variants: {
      variant: {
        /** Quiet by default — a badge is metadata, not an announcement. */
        default: "bg-veil-10 text-fg [a]:hover:bg-veil-20",
        /** Hairline only. The most restrained option; prefer it on photography. */
        outline: "border-line-strong text-fg-muted [a]:hover:bg-veil-05",
        /** Solid brand. For a single status pill, never for a row of tags. */
        solid: "bg-btn-solid text-btn-solid-fg [a]:hover:bg-btn-solid-hover",
        /** GOLD BUDGET: counts as the section's one gold element. */
        gold: "border-accent-hair text-accent-gold [a]:hover:bg-veil-05",
        destructive: "bg-destructive/12 text-destructive [a]:hover:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
