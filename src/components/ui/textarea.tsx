import * as React from "react"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * TEXTAREA — restyled to Ankaa by ASTRA. Matches <Input>: same border, radius,
 * focus treatment and 17px body size (see input.tsx for why 17px is a floor,
 * not a preference).
 *
 * `line-height` comes from --text-body (1.9). That is the Arabic value and it
 * is deliberate — a textarea of Arabic at 1.5 has its dots and tashkeel
 * colliding between lines.
 * -------------------------------------------------------------------------- */

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "rounded-field border-line-strong field-sizing-content flex min-h-32 w-full border bg-transparent px-4 py-3",
        "text-body text-fg font-body",
        "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
        "placeholder:text-fg-subtle",
        "hover:border-fg/35",
        "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
