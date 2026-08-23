import Link from "next/link";

import { AnkaaMark } from "@/components/brand";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderMotion } from "@/components/motion/header-motion";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/content/nav";
import { site } from "@/content/site";

/* -----------------------------------------------------------------------------
 * <SiteHeader> — transparent over the dark hero, solid once you scroll.
 *
 * A SERVER COMPONENT. The only interactive part is <MobileNav>, which is a
 * client island. There is no scroll listener here on purpose:
 *
 *   NEON — the scroll contract is one attribute. Set `data-scrolled="true"` on
 *   this <header> (it is `data-slot="site-header"`) once the page has moved
 *   past ~80px, and the backdrop, the hairline and the compaction all animate
 *   themselves in CSS. Remove it and they animate out. Nothing else to wire.
 *   Both states are styled here, so the header is correct in either one with
 *   JS disabled, and correct at first paint before your effect has run.
 *
 * THE GROUND TRAP (worth knowing — it cost an hour):
 * globals.css declares `[data-theme] { background-color: var(--bg) }` OUTSIDE
 * any @layer. Unlayered rules beat layered ones, so a plain `bg-transparent`
 * utility LOSES to it and this header would paint solid green over the hero
 * with no build error. `bg-transparent!` (an important declaration) is what
 * actually wins. The header still needs `data-theme="dark"` so its ink, its
 * hairlines and the shadcn layer beneath it are correct over the dark hero —
 * so the ground is declared, and only its paint is opted out of.
 *
 * The header is dark in BOTH states by design: it is transparent over the dark
 * hero, and once solid it stays dark as it travels over the light sections
 * below. One set of ink values, correct everywhere, no per-section swapping.
 * -------------------------------------------------------------------------- */

export function SiteHeader() {
  const navItems = primaryNav.slice(0, -1);
  const ctaItem = primaryNav[primaryNav.length - 1];

  return (
    <header
      data-slot="site-header"
      data-theme="dark"
      data-surface={1}
      data-scrolled="false"
      className="group/header fixed inset-x-0 top-0 z-50 bg-transparent!"
    >
      {/* NEON's client island — the only interactive part of this bar besides
          <MobileNav>. It sets `data-scrolled` above and renders the reading
          progress rule at the bar's foot. Everything else here stays a Server
          Component. See `header-motion.tsx` for why the "no hero on this
          route" case is a CSS rule and not this component's job. */}
      <HeaderMotion />

      {/* Skip link — first focusable element on the page. The old site had
          none (SOVA §10.9). */}
      <a
        href="#main"
        className="bg-btn-solid text-btn-solid-fg text-label sr-only rounded-full px-6 py-3 font-semibold focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-10"
      >
        {site.skipToContent}
      </a>

      {/* The solid state, as a separate layer so it can cross-fade instead of
          snapping. Hidden until `data-scrolled="true"`. */}
      <div
        aria-hidden
        data-slot="header-backdrop"
        className="bg-bg/92 border-line absolute inset-0 -z-10 border-b opacity-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-quart)] supports-backdrop-filter:backdrop-blur-md group-data-[scrolled=true]/header:opacity-100"
      />

      {/* ⛔ `justify-between` UNDER `lg`, `justify-start` FROM `lg` — operator,
          2026-08-22, item 5: "the nav bar need to be on the right a bit cz
          it['s] hitting the background… if the nav went to the right and let
          an area for the image to be fully visible it's better".

          WHAT THEY WERE LOOKING AT. The hero render puts the building on the
          INLINE-END half of the frame (physically the left, in this RTL
          document) and open sky on the inline-start half. `justify-between`
          pinned the brand to the start and threw the nav and the «تواصل معنا»
          pill all the way to the far end — i.e. it put the loudest element in
          the bar, a solid-outlined pill, directly on top of the building's
          roofline. Measured at 1100: the pill's box ended 32px from the
          viewport edge, over the building; the 500px between it and the brand
          was empty sky.

          SO THE WHOLE BAR NOW CLUSTERS AT THE START. Brand, then a 48px gap,
          then the links and the pill — all of it over sky, with the building's
          top-left corner clear. `gap-12` is what makes it read as one grouped
          lockup rather than as a bar whose contents failed to justify.

          ⚠️ THE BREAKPOINT IS LOAD-BEARING, NOT COSMETIC. Below `lg` the <nav>
          and the pill are both `hidden` and the only things in this row are
          the brand and <MobileNav>'s hamburger. Cluster THOSE at the start and
          the hamburger sits glued to the wordmark with the whole width empty
          beside it, which is wrong on every phone. So the mobile bar keeps
          `justify-between` and only the desktop bar clusters — which is also
          the width at which the hero art has a building in it to protect. */}
      <Container className="flex items-center justify-between gap-6 py-6 transition-[padding] duration-[var(--dur-base)] ease-[var(--ease-out-quart)] group-data-[scrolled=true]/header:py-4 lg:justify-start lg:gap-12">
        {/* Brand lockup. The mark does NOT mirror in RTL — a logo keeps its
            handedness in every language (AGENTS §12). It is also this
            section's single gold element. */}
        <Link
          href="/"
          className="group/brand flex items-center gap-3 rounded-full"
          aria-label={site.a11y.backToTop}
        >
          <AnkaaMark className="text-accent-hair w-8 shrink-0 transition-opacity duration-[var(--dur-fast)] group-hover/brand:opacity-80 sm:w-9" />
          <span className="flex flex-col">
            <span className="font-display text-body text-fg leading-tight font-semibold">
              {site.brand.name}
            </span>
            <span className="text-caption text-fg-subtle leading-tight">
              {site.brand.tagline}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label={site.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    /* `py-1` — WCAG 2.5.8 (AA). At `text-body-sm` the link
                       box is 22px tall; the AA minimum for a pointer target is
                       24. 4px of block padding takes it to 30 and changes
                       nothing visually: the row is `items-center` and the
                       brand lockup beside it is already 44px, so the bar's
                       height is unmoved. Audited 2026-08-22 — every nav link
                       on every route failed this. */
                    className="text-body-sm text-fg-muted hover:text-fg rounded-full py-1 transition-colors duration-[var(--dur-fast)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href={ctaItem.href}>{ctaItem.label}</Link>
          </Button>

          <MobileNav items={primaryNav} />
        </div>
      </Container>

      {/* ------------------------------------------------- no-JS navigation
          FADE 5: with scripting disabled the hamburger is visible, focusable
          and COMPLETELY INERT — <MobileNav> is a Radix Dialog and needs state.
          Navigation survived only in the footer, roughly 19,000px down the
          home page. A visible control that does nothing is worse than no
          control, so under `(scripting: none)` globals.css §9 hides the
          trigger and shows this strip instead.

          It is `display: none` by default, which means it costs a no-JS
          visitor nothing to receive and a JS visitor nothing to render. It is
          `lg:hidden` because at `lg` the real <nav> above is already visible
          and static — that one never needed JS. */}
      <div data-slot="header-nojs-nav" className="border-line border-t lg:hidden">
        <Container>
          <nav aria-label={site.a11y.mainNav}>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    /* `py-1`, same WCAG 2.5.8 reason as the desktop nav. */
                    className="text-body-sm text-fg-muted hover:text-fg rounded-full py-1 transition-colors duration-[var(--dur-fast)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </header>
  );
}
