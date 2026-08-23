import * as React from "react"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * INPUT — restyled to Ankaa by ASTRA.
 *
 * Height 48px, not shadcn's 32px: this is a public contact form filled on a
 * phone, not a dense admin table. 48px clears the touch-target minimum with
 * room for 17px Arabic, whose descenders sit lower than Latin's.
 *
 * Font size is `--text-body` (17px) at every breakpoint. shadcn drops to 14px
 * at md; do NOT reintroduce that. Under 16px, iOS Safari zooms the viewport on
 * focus, and on an Arabic form that zoom lands the user somewhere unexpected
 * because the page is mirrored.
 *
 * Radius `rounded-field` (8px) — the tightest rung on the mark's sqrt(2)
 * ladder. Fields are the one place this system is nearly square: it makes the
 * pill-shaped buttons read unambiguously as *actions*.
 *
 * Focus: the border goes to `--ring` (gold) AND a 2px outline appears. Colour
 * alone is never the only focus signal.
 * -------------------------------------------------------------------------- */

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "rounded-field border-line-strong h-12 w-full min-w-0 border bg-transparent px-4 py-2",
        "text-body text-fg font-body",
        "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
        "placeholder:text-fg-subtle",
        "hover:border-fg/35",
        "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        "file:text-fg file:me-3 file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-body-sm file:font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Input }
