import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { errors } from "@/content/errors";
import { footerNav } from "@/content/nav";

/* =============================================================================
 * 404 — the whole site's not-found.
 *
 * THE BUG THIS CLOSES. `src/app/` shipped with no `not-found.tsx` at any
 * level, so every unmatched URL — a typo, a stale bookmark, a crawler probing
 * `/wp-login.php`, and every `notFound()` call in the tree — rendered Next's
 * built-in page: English, LTR, system sans, "404 | This page could not be
 * found", on a white ground, inside an `lang="ar" dir="rtl"` document. On an
 * Arabic site that is not a missing polish item, it is a broken page.
 *
 * WHY IT LOOKS LIKE /privacy. Both are standalone document routes rather than
 * sections of the home page, and that ground is already browser-verified:
 * light / surface-0 / `space="hero"`. The `hero` rhythm is not decoration —
 * it is the clearance the FIXED header needs when a section starts at the top
 * of the document. Halve it and the heading slides under the bar.
 *
 * The header is solid here with no JavaScript at all: globals.css §8.2 keys
 * the solid state on `body:not(:has([data-slot="hero-media"]))`, and this page
 * has no hero. Nothing to wire.
 *
 * GOLD BUDGET (AGENTS §8). One element: the <Accent> on the second half of the
 * heading. Hence `rule={false}` — the kicker's 28px hairline is `--accent-hair`
 * and would be a second. The CTA is `default` (brand solid), not `gold`.
 *
 * NO METADATA EXPORT. `not-found.tsx` is rendered for a 404 response and Next
 * injects `<meta name="robots" content="noindex">` itself; the document keeps
 * the root layout's title. A `metadata` export here would be ignored for
 * unmatched URLs anyway — see `errors.notFound.metaTitle`, which is kept in
 * the content file for the day `global-not-found` graduates from experimental.
 *
 * ⚠ SAGE-2 TRIED AND REVERTED THE OBVIOUS FIX. WCAG 2.4.2 (Level A) wants this
 * page titled for its topic, and today a 404 is called «جمعية العنقاء السكنية»
 * — identical to the home page. The React 19 <title> ELEMENT is the mechanism
 * that works where a `metadata` export does not, and `global-error.tsx` already
 * relies on it. It does NOT work here. MEASURED on a production build: the head
 * ended up with THREE <title> elements — the layout's, this one, and the
 * layout's again — and `document.title` was still the generic one, so the
 * change cost a duplicate tag and bought nothing. The same technique DOES work
 * in `error.tsx` (2 tags, ours wins), which is why it is kept there and not
 * here. The real fix is `global-not-found.tsx` once it is stable.
 *
 * ⛔ NOT A CLIENT COMPONENT, and it must stay that way. `usePathname()` to
 * echo the bad URL back at the visitor is the obvious next idea; it would ship
 * a client bundle on the one route that should be the cheapest on the site,
 * and reflecting an attacker-supplied path into the page is how a 404 becomes
 * an XSS reporting surface.
 * ========================================================================== */

export default function NotFound() {
  return (
    // `main` carries id="main" for the header's skip link on every route.
    <main id="main" className="flex-1">
      <Section
        theme="light"
        surface={0}
        space="hero"
        container={false}
        aria-labelledby="not-found-title"
      >
        <Container width="prose">
          {/* ---------------------------------------------------- the numeral
              OPERATOR, 2026-08-22, item 21: "the number of 404 should be much
              bigger and visable". It was `kicker="الخطأ 404"` — 13px at 58%
              ink, the smallest and faintest thing on the page — so the page's
              own subject was its quietest element and the largest thing on it
              was the word «غير موجودة.» at 48px.

              WHY IT IS NOT A HEADING. It is not the page's title; the <h1>
              below is. A second heading element here would give the document
              two competing outlines for one idea. It is a <p> that happens to
              be enormous.

              SIZE. `clamp(6rem, 20vw, 12rem)` — 96px on a 360px phone, 192px
              from 960 up. It deliberately overshoots the type scale's top
              rung (`--text-display-1`, 44 → 84px): a 404 that merely matched
              the hero headline would read as a heading, and the point is that
              it reads as a number.

              `leading-[0.85]` because at this size the token line-height
              (1.18) hangs ~29px of empty box under a run of digits that have
              no descenders, which shows up as a gap between the numeral and
              the heading that nothing accounts for. Latin digits in an RTL
              document need no `dir` — a pure digit run has exactly one
              bidi resolution.

              GOLD BUDGET (AGENTS §8). Still ONE element: the <Accent> in the
              heading. The numeral is `text-fg` — full ink, no accent. Gold at
              192px would be the loudest thing on the site and would spend the
              whole page's budget on its error state. */}
          <p
            className="font-display text-fg text-[clamp(6rem,20vw,12rem)] leading-[0.85] font-semibold tabular-nums"
          >
            {errors.notFound.code}
          </p>

          <SectionHeader
            /* NO KICKER. The numeral above is the label, and a 13px
               «الخطأ» under a 192px «404» would be the same word twice.
               `rule={false}` follows: the 28px gold hairline is drawn as part
               of the kicker and there is no kicker to draw it before. */
            rule={false}
            className="mt-6"
            headingId="not-found-title"
            as="h1"
            size="h1"
            heading={
              <>
                {errors.notFound.title.a}{" "}
                <Accent>{errors.notFound.title.b}</Accent>
              </>
            }
            lead={errors.notFound.lead}
          />

          <Button asChild size="lg" className="mt-12">
            <Link href="/">
              <ArrowLeft
                aria-hidden
                /* Authored pointing the way "back" points in LTR and mirrored
                   to point RIGHT here by <Button>'s own
                   `[&_svg[data-direction]]:rtl:-scale-x-100` rule. Same
                   contract as the back link on /projects/[slug]. */
                data-direction
                className="size-4 shrink-0"
              />
              {errors.notFound.home}
            </Link>
          </Button>

          {/* The way out that is not the browser button. `footerNav` rather
              than `primaryNav` because the footer list is the longer of the
              two (it adds الأسئلة الشائعة) and both are section anchors.

              ⚠ THE `/` PREFIX THAT USED TO BE ADDED HERE IS GONE, BECAUSE THE
              PROBLEM IT SOLVED WAS NEVER LOCAL TO THIS PAGE. This file was
              rendering `href={`/${item.href}`}` to turn `#about` — a fragment
              on the CURRENT document, i.e. a link to nowhere from a 404 — into
              a real route home. The shared header and footer needed exactly
              the same thing on `/privacy` and `/projects/[slug]` and never got
              it, so ten controls were dead on three routes. `nav.ts` now
              stores `/#about` itself and every consumer is correct; adding a
              second `/` here would produce `//#about`. */}
          <nav
            aria-label={errors.notFound.sectionsLabel}
            className="border-line mt-16 border-t pt-8"
          >
            <h2 className="text-label text-fg-subtle font-semibold">
              {errors.notFound.sectionsTitle}
            </h2>
            <ul className="mt-4 flex flex-col">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body text-fg-muted hover:text-fg border-line block border-b py-3 transition-colors duration-[var(--dur-fast)] last:border-b-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </Section>
    </main>
  );
}
