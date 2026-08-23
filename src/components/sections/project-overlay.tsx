"use client";

/* -----------------------------------------------------------------------------
 * <ProjectOverlay> — the intercepted-route overlay for /projects/[slug].
 *
 * "use client" because it needs `useRouter` and Radix's Dialog. Its child —
 * the entire detail panel — is server-rendered and passed through as
 * `children`, so no project content crosses the boundary.
 *
 * WHY A ROUTE AND NOT A MODAL (SOVA §11 row 5):
 * the live site's project view is a `<div class="project-modal">` toggled with
 * `aria-hidden`. It is not linkable, not shareable, not indexable, does not
 * survive a refresh, and the browser back button leaves the page instead of
 * closing it. Here the same URL is a real page; clicking a card from `/` only
 * *intercepts* it into this overlay.
 *
 * FOCUS — the thing the old modal never did (SOVA §10.9: "the modal toggles
 * aria-hidden but never traps or restores focus"). Radix's Dialog:
 *   · traps Tab inside the panel while it is open — VERIFIED by SAGE, zero
 *     escapes in either direction across a full open→close→reopen cycle
 *   · ⚠ does NOT, on its own, return focus to the element that had it when
 *     the dialog opened. The card is still mounted (the parallel slot works
 *     as described), but closing is a navigation and the App Router's focus
 *     move lands after Radix's restore and overwrites it. `onCloseAutoFocus`
 *     below owns the restore instead — see the SAGE block in the body.
 *   · closes on Escape and on an overlay click, both of which route back
 *   · marks the rest of the page inert for assistive tech, correctly, instead
 *     of hand-toggling aria-hidden
 *
 * NEON — the circular clip-path reveal (SOVA §15.3, "the best interaction on
 * the current site"). The activation point is already on <html> as
 * `--project-reveal-x` / `--project-reveal-y` in viewport px, written by
 * <ProjectsRail> on pointer-down or on keyboard activation. Animate this
 * element's `clip-path`:
 *
 *     circle(0 at var(--project-reveal-x, 50%) var(--project-reveal-y, 50%))
 *       → circle(<hypot to the furthest corner> at <same>)
 *     0.85s power4.inOut, panels xPercent ∓8
 *
 * The FALLBACKS matter: a direct visit to /projects/[slug] never sets those
 * properties, and 50%/50% must still be a correct centre-out reveal. The base
 * state below carries no clip-path at all — fully revealed, which is what a
 * visitor sees if your timeline never runs.
 *
 * =============================================================================
 * ⛔ A LINK OUT OF THE PANEL IS NOT A LINK — NEON N5. READ THIS BEFORE ADDING
 * ANY <Link> TO `<ProjectDetailPanel>`.
 * =============================================================================
 * MEASURED, production build, 1440 and 430. Open a card at the rail, click the
 * panel's `تواصل معنا` CTA (`<Link href="/#contact">`):
 *
 *   step        url                     scrollY   overlay
 *   at the rail /                        2851     no
 *   opened      /projects/firdous-1      2851     yes
 *   CTA clicked /#contact               12538     ⛔ STILL YES
 *   then Esc    /projects/firdous-1      3168     no
 *
 * Three failures in one click. The overlay stays up while the page BEHIND it
 * scrolls to `#contact`; the visitor then has no way out that works, because
 * `router.back()` now pops the `/#contact` entry instead of the overlay's; and
 * they are left on the rail under a url that claims to be a project page.
 *
 * WHY. This is a parallel slot, and Next keeps a slot's previously-active
 * state across a SOFT navigation — so navigating from the intercepted route to
 * `/#contact` does not unmount `@modal`, it only changes the url under it.
 * `router.replace` behaves the same way; there is no forward navigation that
 * closes this overlay. POPPING ITS OWN HISTORY ENTRY IS THE ONLY THING THAT
 * DOES, which is exactly what `onOpenChange` below already does and why.
 *
 * So a fragment on the page underneath cannot be reached by an anchor from in
 * here at all. `onClickCapture` takes those clicks off the anchor before
 * `next/link` sees them (it returns early on `defaultPrevented`) and turns
 * them into what they actually are: CLOSE, THEN GO.
 *
 * ⚠ THE ORDER IS THE FIX AND BOTH HALVES ARE LOAD-BEARING.
 *   · `router.back()` first — one close path, one history entry consumed, the
 *     stack left exactly as balanced as an Escape leaves it.
 *   · the fragment navigation second, and only once the pop has been APPLIED
 *     (`popstate`, then one frame). Issued earlier it races the pop and Next
 *     coalesces the two into a slot that never unmounts — the original bug.
 *
 * ⚠ AND IT SUPPRESSES THE FOCUS RESTORE (`handOff` below). Radix fires
 * `onCloseAutoFocus` when this panel UNMOUNTS, not only when it is dismissed,
 * so without the guard `restoreFocus()` would put focus back on the rail card
 * — and focusing an element scrolls it into view, which would drag the page
 * off `#contact` and back to the rail 1.2s after it arrived. A visitor who
 * asked to go somewhere is not restoring anything.
 *
 * ⚠ `<ScrollRestoration>` (smooth-scroll.tsx) IS IN THIS FLOW. The pop arms a
 * restore to the home page's saved position; it lands on the first frame
 * because `/` never unmounted and is already tall enough, and the pump stops
 * the moment it lands. The fragment navigation therefore goes AFTER it, in the
 * next frame, and wins. Verified at 1440 and 430 — if that ever inverts, the
 * symptom is the CTA landing on the rail instead of on `#contact`.
 *
 * A link that stays inside this panel is untouched, and so is the same CTA on
 * the real `/projects/[slug]` page, where there is no overlay and a plain
 * anchor is exactly right. `<ProjectDetailPanel>` is a Server Component shared
 * by both mountings and does not know which one it is in — which is why the
 * difference lives HERE and not in the panel.
 *
 *   → DONE. `useProjectReveal` (src/components/motion/project-reveal.ts).
 *     Note it rebases the two viewport-pixel properties through this panel's
 *     own rect, because clip-path lengths resolve against the element's border
 *     box and not the viewport. ⚠ It finds this element by SELECTOR: a `ref`
 *     on <DialogContent> type-checks and is never populated at runtime. It does NOT animate on close: Radix unmounts
 *     the panel, and keeping it mounted to play an exit would mean owning the
 *     focus restore by hand — the exact thing this component exists to stop
 *     doing (SOVA §10.9).
 * -------------------------------------------------------------------------- */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

import { useProjectReveal } from "@/components/motion/project-reveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { projectDetail } from "@/content/projects";
import { site } from "@/content/site";

export function ProjectOverlay({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // NEON — the ported clip-path reveal. Everything about the origin, the
  // fallback, the reduced-motion path and why it finds the panel by selector
  // rather than by ref is in `project-reveal.ts`.
  useProjectReveal();

  /* ---------------------------------------------------------------------
   * SAGE — FOCUS RESTORE. The comment at the top of this file says Radix
   * returns focus to the card on close. MEASURED: it does not. After Esc,
   * `document.activeElement` is `<body>` — SOVA §10.9's second failure,
   * reproduced, and it also kills the reopen cycle, because Enter on
   * `<body>` does nothing.
   *
   * The card is NOT the problem: it stays mounted and `isConnected` through
   * the whole cycle (the parallel slot works exactly as documented), and
   * re-focusing it by hand afterwards succeeds. What happens is that
   * closing is a NAVIGATION — `router.back()` — and the App Router moves
   * focus for its route announcer *after* Radix has restored, overwriting
   * it. Radix cannot win a race it finishes first.
   *
   * So: capture the opener on FIRST RENDER (a `useEffect` here is already too
   * late — child effects run before parent ones, so Radix's focus scope has
   * moved focus by then), suppress Radix's own restore, and re-assert focus
   * after the navigation settles.
   *
   * The capture uses a lazy `useState` initializer rather than writing a ref
   * during render. Same timing — once per mount, before children mount — but
   * it is the sanctioned way to seed state from an external value. Mutating a
   * ref during render is a `react-hooks/refs` violation and is unsafe under
   * concurrent rendering, where a render may be discarded and replayed.
   * ------------------------------------------------------------------ */
  const [opener] = React.useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    const active = document.activeElement;
    return active instanceof HTMLElement && active !== document.body
      ? active
      : null;
  });
  // The overlay's own URL. Read now: after `router.back()` this is "/".
  const openerHref = React.useRef(pathname);

  const restoreFocus = React.useCallback(() => {
    const target =
      opener?.isConnected
        ? opener
        : // Fallback for a close that outlived its opener: the rail card for
          // this project. Scoped to the card so it cannot land on the unit
          // schedule's link to the same href.
          document.querySelector<HTMLElement>(
            `[data-slot="project-card"] a[href="${openerHref.current}"]`,
          );
    if (!target) return;

    // Re-assert only while NOTHING owns focus. If the visitor has already
    // moved on, stealing it back would be worse than not restoring at all.
    let tries = 0;
    const tick = () => {
      if (!target.isConnected) return;
      const active = document.activeElement;
      if (active === target) return;
      if (active && active !== document.body) return;
      target.focus();
      if (++tries < 40) window.setTimeout(tick, 30);
    };
    tick();
  }, [opener]);

  /* ---------------------------------------------------------------------
   * NEON N5 — CLOSE, THEN GO. The reasoning is in the block at the top of
   * this file; this is only the mechanism.
   *
   * ⛔ `handOff` IS SET ONCE AND NEVER CLEARED, AND THAT IS DELIBERATE. It is
   * also the flag `onCloseAutoFocus` reads, and Radix fires that from its
   * unmount cleanup — which lands AFTER the pop, on React's own schedule, not
   * on ours. Clearing it when the navigation is issued lost that race and the
   * focus restore ran anyway. A panel that has begun handing off is finished
   * either way, so the flag has nothing left to be wrong about; it doubles as
   * the re-entry guard for a second click on the same CTA.
   * ------------------------------------------------------------------ */
  const handOff = React.useRef<string | null>(null);

  const closeThenNavigate = React.useCallback(
    (href: string) => {
      handOff.current = href;

      const settle = () => {
        window.removeEventListener("popstate", settle);
        window.clearTimeout(fallback);
        /* One frame after the pop is applied: the slot has unmounted and any
           scroll restoration the pop armed has already landed and stopped. */
        window.requestAnimationFrame(() => router.push(href));
      };

      /* The pop is what closes the overlay, so it is also what says "now".
         The timer is only for a browser that swallows the event — without it
         a failed pop would strand the visitor in a panel whose CTA is dead. */
      const fallback = window.setTimeout(settle, 600);
      window.addEventListener("popstate", settle);
      router.back();
    },
    [router],
  );

  const onContentClick = React.useCallback(
    (event: React.MouseEvent) => {
      // Leave anything the browser would not treat as a plain navigation to
      // the browser: new tab, new window, download, and every modified click.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      // A hand-off is already under way and this panel is on its way out. A
      // second click would pop a second history entry.
      if (handOff.current) {
        event.preventDefault();
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[href]",
      );
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // No fragment, or a fragment inside this panel: an ordinary link, and
      // ordinary is correct. Only a section of the document UNDERNEATH the
      // overlay is unreachable from in here.
      if (!url.hash || url.pathname === window.location.pathname) return;

      event.preventDefault();
      closeThenNavigate(`${url.pathname}${url.search}${url.hash}`);
    },
    [closeThenNavigate],
  );

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        // Closing IS a navigation. `back()` pops the intercepted entry, which
        // unmounts this slot and leaves the home page exactly where it was —
        // including its scroll position and its `?region=` filter.
        if (!open) router.back();
      }}
    >
      <DialogContent
        data-slot="project-overlay"
        /* A portalled panel sits outside every <Section>, so it declares its
           own ground or it inherits :root and flashes light. surface-2 matches
           the projects section it came from. Note the wave-1 trap: the
           unlayered `[data-theme] { background-color: var(--bg) }` rule beats
           the vendored `bg-popover` utility — which is harmless here, because
           on a dark ground --popover IS surface-inverse-2. */
        data-theme="dark"
        data-surface={2}
        showCloseButton={false}
        /* The panel's accessible name is the <DialogTitle> inside `children`.
           There is no separate description element; the summary reads as
           content. Same call wave 1 made for the mobile nav sheet. */
        aria-describedby={undefined}
        /* NEON N5 — capture phase, so it runs before `next/link`'s own onClick
           (which returns early on `defaultPrevented`). See the N5 block above. */
        onClickCapture={onContentClick}
        /* See the SAGE block above: Radix's restore is overwritten by the
           router's own focus move, so we suppress it and re-assert.
           ⛔ …unless this close has a destination (N5). Focusing the rail card
           scrolls it into view, which would pull the page off the section the
           visitor just asked for. */
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (handOff.current) return;
          restoreFocus();
        }}
        className="rounded-media border-line max-h-[92svh] gap-0 overflow-y-auto border p-0 ring-0 sm:max-w-[72rem]"
      >
        {children}

        <DialogClose asChild>
          <Button
            variant="secondary"
            size="sm"
            aria-label={site.a11y.closeProject}
            className="absolute top-4 end-4 z-10 supports-backdrop-filter:backdrop-blur-md"
          >
            {projectDetail.close}
            <X aria-hidden className="size-4" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
