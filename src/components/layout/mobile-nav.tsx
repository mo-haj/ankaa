"use client";

/* -----------------------------------------------------------------------------
 * MOBILE NAVIGATION — the ONLY client component in the app shell.
 *
 * "use client" is genuinely required here and nowhere else in the header: the
 * Sheet is a Radix Dialog, which needs state, a portal, focus trapping and
 * Escape handling. Everything else in <SiteHeader> is static markup and stays
 * a Server Component.
 *
 * RTL: `side="left"` is Radix's PHYSICAL side, and in this document the
 * physical left edge IS the inline-end — which is where the trigger sits. The
 * panel therefore opens from under the button that opened it. This is the one
 * place a physical direction is correct, and it is deliberate.
 *
 * Accessibility (SOVA §10.9 documents the old site failing all of this):
 *   · the trigger is a real <button> with an Arabic aria-label
 *   · Radix traps focus in the panel and restores it to the trigger on close
 *   · Escape closes; the overlay closes on click
 *   · every link closes the sheet, so the page does not scroll behind an open
 *     panel
 *   · the panel is titled for screen readers (visually hidden)
 * -------------------------------------------------------------------------- */

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { AnkaaMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@/content/nav";
import { site } from "@/content/site";

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          /* Hidden by globals.css §9 under `(scripting: none)`, where this
             button cannot possibly work — a Radix Dialog needs state — and the
             header's static `[data-slot="header-nojs-nav"]` strip takes over.
             The hook is an attribute rather than a class because the rule that
             reads it is a media query in the stylesheet, not a variant. */
          data-mobile-nav-trigger
          className="lg:hidden"
          aria-label={site.a11y.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        /* The panel carries its own ground so it is dark like the rest of the
           shell — a portalled panel sits outside every <Section>, so without
           this it would inherit :root (light) and flash white. */
        data-theme="dark"
        data-surface={2}
        /* Radix asks for a description; this panel is a bare list of links and
           a title says everything there is to say. */
        aria-describedby={undefined}
        /* `border-s` puts the hairline on the panel's page-facing edge: the
           vendored component only draws `border-e`, which for a physically-left
           panel in an RTL document is the off-screen side. */
        className="border-line w-[86%] gap-0 border-s p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">{site.a11y.mainNav}</SheetTitle>

        <div className="border-line flex items-center justify-between border-b p-6">
          <span className="flex items-center gap-3">
            <AnkaaMark className="text-accent-hair w-7" />
            <span className="font-display text-body text-fg font-semibold">
              {site.brand.name}
            </span>
          </span>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label={site.closeMenu}>
              <X className="size-4" />
            </Button>
          </SheetClose>
        </div>

        <nav aria-label={site.a11y.mainNav} className="p-6">
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href} className="border-line border-b last:border-b-0">
                {/* ⛔ NOT `<SheetClose asChild>` — AND IT CANNOT GO BACK.
                    2026-08-22, with <FragmentLinks> in `smooth-scroll.tsx`.

                    Radix wires a `Close` by wrapping the child's own handler:
                    `composeEventHandlers(childOnClick, () =>
                    onOpenChange(false))`, which SKIPS the second half when
                    `event.defaultPrevented` is true. <FragmentLinks> catches
                    every same-page fragment click in the capture phase and
                    prevents default so the URL never grows a `#` — so from
                    the moment it shipped, every item in this sheet scrolled
                    the page correctly and left the sheet sitting open over
                    it.

                    `onClick` on the <Link> is React's own prop and runs
                    whether or not default was prevented, so the sheet closes
                    in both worlds: with scripting on, after the handler
                    scrolls; with <FragmentLinks> absent, after the browser
                    follows the fragment. The X button above is still a real
                    <SheetClose> — it is a button, not an anchor, and nothing
                    prevents its default. */}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-h4 text-fg-muted hover:text-fg font-display block py-4 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-caption text-fg-subtle mt-auto p-6">
          {site.brand.tagline}
        </p>
      </SheetContent>
    </Sheet>
  );
}
