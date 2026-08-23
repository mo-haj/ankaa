"use client"

/* -----------------------------------------------------------------------------
 * ⛔ NOTHING MOUNTS THIS, AND THAT IS ON PURPOSE. DO NOT DELETE IT AS DEAD CODE,
 * AND DO NOT RE-ADD <Toaster /> "JUST IN CASE".
 *
 * The intent for this file was written in `layout.tsx` — a different file from
 * the code, which is why CHAMBER C1 found it as one of five dead components and
 * BRIMSTONE flagged its two dependencies as unused. Both were reading the tree
 * correctly. The reason lives here now.
 *
 * WHY IT IS NOT MOUNTED. It was, in the root layout. `toast()` is called
 * nowhere in this codebase (`grep -rn "toast(" src/` returns only comments), so
 * what it actually shipped on every route was an empty
 * `<section aria-label="Notifications alt+T" aria-live="polite">`: an ENGLISH
 * landmark AND a live region inside a `lang="ar"` document, enumerated by every
 * screen reader that lists landmarks, for a feature that does not exist. SAGE
 * removed it.
 *
 * WHY THE FILE STAYS. Re-adding toasts is one line in `layout.tsx` plus an
 * Arabic `aria-label` — cheaper to keep than to re-derive. The contact form has
 * its own `role="status"` region and needs nothing from sonner.
 *
 * WHAT IT COSTS. Nothing at runtime: no module imports this one, so `sonner`
 * and `next-themes` are never pulled into a bundle. They stay in
 * `package.json` `dependencies` because THIS FILE imports them — dropping the
 * deps without deleting the file breaks `tsc` and `lint`. The two go together
 * in either direction.
 * -------------------------------------------------------------------------- */

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
