import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * BUTTON — restyled to Ankaa by ASTRA.
 *
 * The one idea that makes this work: every variant is written against the
 * GROUND tokens (--btn-solid-*, --btn-gold-*, --fg, --line), never against a
 * fixed colour. So a single set of variants is correct on a light section AND
 * on a dark one — <Section theme="dark"> flips the values underneath.
 * There is no `onDark` prop and there must never be one.
 *
 * Shape: pill (`rounded-full`). The mark's language is arcs, not boxes; a
 * fully-rounded control is the only radius that reads as the same family as a
 * 38-degree wing sweep. Cards and fields keep real corners so the pill stays
 * the *action* signal.
 *
 * Sizes are bigger than shadcn's defaults on purpose. shadcn ships an h-8
 * (32px) default for dense app UI; this is a marketing site read on phones,
 * so the default is h-11 (44px) — the iOS/Android minimum target — and `lg`
 * is h-13 (52px) for hero CTAs.
 *
 * Focus: 2px gold ring at 2px offset. `--ring` is gold-700 on light (5.54:1)
 * and gold-300 on dark (9.96:1), so the indicator clears WCAG 1.4.11 on every
 * surface in the system. Verified in /styleguide.
 *
 * GOLD BUDGET: `gold` is a gold element. One per section (SOVA 13.4 rule 2).
 * -------------------------------------------------------------------------- */

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-full border border-transparent bg-clip-padding",
    "font-body font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,opacity] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // Directional icons must mirror in the RTL tree. An arrow drawn for LTR
    // points the wrong way on an Arabic page — CYPHER's #1 audit item.
    "[&_svg[data-direction]]:rtl:-scale-x-100",
  ],
  {
    variants: {
      variant: {
        /** The workhorse. Brand green on light, paper on dark. 15.28:1 both ways. */
        default:
          "bg-btn-solid text-btn-solid-fg hover:bg-btn-solid-hover",
        /** The one gold CTA a section is allowed. gold-700 on light, gold-300 on dark. */
        gold: "bg-btn-gold text-btn-gold-fg hover:bg-btn-gold-hover",
        /** Hairline outline — the quiet secondary. Reads on both grounds. */
        outline:
          "border-line-strong text-fg hover:bg-veil-05 hover:border-fg/40",
        /** Filled but recessive. */
        secondary: "bg-veil-10 text-fg hover:bg-veil-20",
        /** No chrome until touched. */
        ghost: "text-fg hover:bg-veil-05",
        /** Inline, in a paragraph. Underline is the affordance, not colour. */
        link: "h-auto rounded-none px-0 text-accent-gold underline underline-offset-[6px] decoration-[1px] decoration-accent-hair hover:decoration-current",
        destructive:
          "bg-destructive/12 text-destructive hover:bg-destructive/20 focus-visible:outline-destructive",
      },
      size: {
        /** 44px — the mobile touch minimum. */
        default: "h-11 px-6 text-body-sm",
        /** 36px — dense rows, filter chips, card footers. Never the primary CTA. */
        sm: "h-9 px-4 text-label",
        /** 52px — hero and section CTAs. */
        lg: "h-13 px-8 text-body-sm",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
