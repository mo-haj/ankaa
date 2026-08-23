"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * ACCORDION — restyled to Ankaa by ASTRA. This is the FAQ.
 *
 * Three deliberate departures from the shadcn default:
 *
 * 1. NO UNDERLINE ON HOVER. shadcn underlines the trigger; on Arabic that
 *    draws a rule through the descenders of ج ح خ ع غ م and looks like a
 *    rendering fault. The hover signal is the ink going to full `--fg` and the
 *    icon taking the gold.
 *
 * 2. A ROTATING PLUS, not a swapped chevron pair. A chevron is directional and
 *    would have to mirror in RTL; a plus rotating 45 degrees to a cross is
 *    direction-free, so there is nothing for CYPHER to audit. It also matches
 *    a hairline system better than a filled caret.
 *
 * 3. Generous vertical padding (24px) and a `--line` rule between items rather
 *    than a bordered card per row. The FAQ should read as a list of hairlines.
 *
 * Ground-aware, so the same component is correct in a dark FAQ band.
 * -------------------------------------------------------------------------- */

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("border-line flex w-full flex-col border-t", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-line border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          /* `min-w-0` — a flex item defaults to `min-width: auto`, i.e. it
             refuses to shrink below its MIN-CONTENT width. One long Arabic
             word in a question was enough to push this button 4px past a
             360px viewport and widen the document (VIPER V-4, found on
             /styleguide, but the FAQ has the same shape). With it the text
             wraps instead. */
          "group/accordion-trigger flex min-w-0 flex-1 items-start justify-between gap-6 py-6",
          "font-display text-h4 text-fg-muted text-start font-semibold text-balance",
          "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
          "hover:text-fg aria-expanded:text-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <PlusIcon
          data-slot="accordion-trigger-icon"
          aria-hidden
          className={cn(
            "text-fg-subtle mt-1.5 size-5 shrink-0",
            "transition-[transform,color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
            "group-hover/accordion-trigger:text-accent-gold",
            "group-aria-expanded/accordion-trigger:text-accent-gold group-aria-expanded/accordion-trigger:rotate-45"
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "text-body text-fg-muted h-(--radix-accordion-content-height) max-w-[62ch] pt-0 pb-8 text-pretty",
          "[&_a]:text-accent-gold [&_a]:underline [&_a]:underline-offset-4",
          "[&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
