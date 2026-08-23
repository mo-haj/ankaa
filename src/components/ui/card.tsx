import * as React from "react"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * CARD — restyled to Ankaa by ASTRA.
 *
 * A hairline, not a box. shadcn's default card is a filled panel with a ring
 * and a shadow; this system is built from 1px rules and whitespace, so the
 * default here is a 1px `--line` border on the section's own ground, no fill
 * and no shadow. That is what stops a 3-up row of cards reading as an app UI.
 *
 * Variants earn their fill:
 *   plain     transparent — the default. Borrows the section ground.
 *   raised    a half-step up the surface ladder + a hairline. For a card that
 *             must separate from a busy ground.
 *   elevated  the only place --shadow-lg is allowed. Overlays and modals.
 *
 * Radius is `rounded-card` (16px, the SOVA radius-md rung on the mark's sqrt(2)
 * ladder). Media inside gets `rounded-figure` (24px) so a photo's corner is
 * visibly rounder than its frame's — the wing arc reading, applied.
 *
 * Ground-aware throughout: drop a card into <Section theme="dark"> and its
 * border, ink and fill all flip. No `onDark` prop.
 * -------------------------------------------------------------------------- */

function Card({
  className,
  size = "default",
  variant = "plain",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: "plain" | "raised" | "elevated"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card rounded-card flex flex-col overflow-hidden",
        "gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(6)]",
        "text-body-sm text-fg-muted",
        "transition-[border-color,background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-quart)]",
        "data-[size=sm]:[--card-spacing:--spacing(4)]",
        // media flush to the frame edge
        "has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-card *:[img:last-child]:rounded-b-card",
        "has-data-[slot=card-footer]:pb-0",
        variant === "plain" && "border-line border",
        variant === "raised" && "border-line bg-veil-05 border",
        variant === "elevated" && "bg-card text-card-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header group/card-header grid auto-rows-min items-start gap-2 px-(--card-spacing)",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-display text-h4 text-fg leading-snug font-semibold text-balance",
        "group-data-[size=sm]/card:text-body",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-sm text-fg-muted text-pretty", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "rounded-b-card border-line flex items-center border-t p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

/**
 * The one decorative flourish a card is allowed: a 28px gold hairline above the
 * title — the same mark the section kicker uses, at card scale. Place it inside
 * a padded slot (CardHeader / CardContent); it carries no margin of its own.
 * Counts against the section's gold budget.
 */
function CardRule({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-rule"
      aria-hidden
      className={cn(
        "bg-accent-hair h-px w-7 shrink-0",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardRule,
}
