import type { Metadata } from "next";
import Link from "next/link";

import { AnkaaMark } from "@/components/brand/ankaa-mark";
import { FactMedia, FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { type BoardSeat, board, boardSeats } from "@/content/board";

/* =============================================================================
 * /board — مجلس الإدارة. NEW, 2026-08-22, operator request.
 *
 * Read `src/content/board.ts` first: it carries why this is a route and not a
 * section, which parts of the page are real (the offices) and which are not
 * (who holds them), and why the chairman's seat reads the same two facts
 * `#president` does instead of owning copies.
 *
 * =============================================================================
 * THE DESIGN BRIEF WAS ONE SENTENCE — "make sure everything fits the design in
 * the main page" — so this page INHERITS, it does not invent:
 * =============================================================================
 *   · `<Section theme="light" surface={0} space="hero">` — the same opening a
 *     document route takes (`/privacy`, `/projects/[slug]`). `space="hero"` is
 *     what clears the fixed header; a page that starts at the top of the
 *     document and uses the default rhythm slides under it.
 *   · `<SectionHeader align="split">` with `as="h1" size="h1"` — split is the
 *     house head (SOVA §14.1, asymmetric 7/4). `h2` is the section default and
 *     would be wrong here: this IS the page title.
 *   · HAIRLINES, NOT CARDS. `<LocationSection>` and the footer both build lists
 *     out of `border-line border-t` rows, and that is the site's idiom for a
 *     set of related things. Five bordered boxes with drop shadows would be a
 *     different site. Each seat is a portrait frame plus a hairline-topped
 *     block of text, which is the `location.tsx` map frame's construction
 *     turned portrait.
 *   · ONE GOLD ELEMENT (AGENTS §8): the <Accent> on «جمعية البنيان السكنية.»
 *     in the h1. So `rule={false}` on the kicker, `variant="outline"` on the
 *     CTA, and the watermark below is `--fg` at 8%, never the metal.
 *
 * ⛔ NO SCROLL MOTION, AND THAT IS A DECISION RATHER THAN AN OMISSION.
 * `<PageMotion>` mounts in `src/app/page.tsx`, not in the layout, so every
 * sub-route on this site is static — `/privacy` and `/projects/[slug]` both
 * are. It is also right on the merits HERE: four of the five frames are
 * deliberately empty, and staggering empty frames into view spends the page's
 * one authored moment drawing the eye to what is missing. The interactive
 * elements keep their CSS transitions and focus rings, which is where this
 * site's motion lives outside the home page anyway.
 *
 * Server Component. Nothing on this page needs a client boundary.
 * ========================================================================== */

export const metadata: Metadata = {
  title: board.kicker,
  description: board.lead,
  alternates: { canonical: "/board" },
};

/**
 * The watermark behind an unsupplied portrait.
 *
 * ⛔ IT IS THE MARK, NOT A PERSON, AND THAT IS THE ENTIRE POINT. The operator
 * asked for temporary photographs from the internet so the page would not look
 * empty. The full reasoning for not doing that is in `placeholders.ts` above
 * the board facts; the short version is that a real face in a frame labelled
 * «أمين الصندوق» presents that person as this cooperative's treasurer to every
 * visitor who sees it, and a `TODO` in the source is invisible to all of them.
 *
 * So the frame is furnished instead of filled: the association's own mark at
 * 8% on the standard pending ground, which reads as designed-and-waiting at a
 * glance and as unmistakably empty on a second look. `<FactMedia>` still draws
 * its honest Arabic sentence on top, still emits `data-pending`, and the
 * pending report still counts every one of these.
 *
 * `aria-hidden` because the sentence over it already says what is missing —
 * a screen reader announcing a decorative logo before it would be noise.
 */
function PortraitWatermark() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center"
    >
      <AnkaaMark className="text-fg/8 w-1/3" />
    </span>
  );
}

/**
 * One seat.
 *
 * The frame is `rounded-figure` (24) rather than `rounded-card` (16) because
 * it holds a photograph — the same radius `location.tsx` gives its map frame
 * and `unit-types.tsx` its plan slot. 2:3 is the portrait aspect
 * `chairmanPortrait` is authored at (859×1280), so his real photograph is not
 * cropped and the four empty frames match it exactly.
 */
function Seat({ seat }: { seat: BoardSeat }) {
  return (
    <li>
      <FactMedia
        fact={seat.portrait}
        /* Five-up at lg on a ~1280 container ≈ 230px, two-up below 768 ≈ 45vw.
           Stated per breakpoint so the browser never downloads the desktop
           candidate for a phone. */
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
        className="rounded-figure border-line aspect-[2/3] w-full border"
        placeholder={<PortraitWatermark />}
      />

      {/* The hairline is the site's list idiom (see <LocationSection>), and it
          sits UNDER the portrait rather than around the whole seat so the row
          of frames reads as one band instead of five separate objects. */}
      <div className="border-line mt-5 border-t pt-4">
        {/* ⛔ ROLE FIRST, AND IT IS THE LOUDER OF THE TWO. Every other roster
            on the web sets the name large and the title small, because there
            the name is the information. Here it is the opposite: the offices
            are what the association has actually published and the names are
            pending, so setting five identical «الاسم يضاف بعد اعتماده» lines
            in `text-h4` would make the gap the loudest thing on the page.
            Inverting it lets the page say the true, useful thing first. */}
        <h2 className="font-display text-h4 text-fg">{seat.role}</h2>
        <p className="text-body-sm text-fg-muted mt-2">
          <FactText fact={seat.name} />
        </p>
      </div>
    </li>
  );
}

export default function BoardPage() {
  return (
    <main id="main" className="flex-1">
      <Section
        theme="light"
        surface={0}
        space="hero"
        container={false}
        aria-labelledby="board-title"
      >
        <Container>
          <SectionHeader
            align="split"
            kicker={board.kicker}
            /* The <Accent> below is this page's one gold element. */
            rule={false}
            as="h1"
            size="h1"
            headingId="board-title"
            heading={
              <>
                {board.title.a} <Accent>{board.title.b}</Accent>
              </>
            }
            lead={board.lead}
          />

          {/* ⛔ ABOVE THE ROSTER, NOT UNDER IT. Same rule the enquiry form's
              notice follows: nobody should read five cards and only afterwards
              discover that the names on them have not been approved for
              publication. `max-w-prose` keeps it at a readable measure instead
              of running the full grid width. */}
          <p className="border-line text-body-sm text-fg-muted rounded-card mt-16 max-w-prose border p-4 text-pretty">
            {board.note}
          </p>

          <ul
            aria-label={board.rosterLabel}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:grid-cols-5"
          >
            {boardSeats.map((seat) => (
              <Seat key={seat.slug} seat={seat} />
            ))}
          </ul>

          {/* Back to the statement. The two pages are about the same body and
              each is the other's missing half — this page says who governs,
              `#president` says what he said about why. */}
          <Button asChild variant="outline" className="mt-16">
            <Link href={board.cta.href}>{board.cta.label}</Link>
          </Button>
        </Container>
      </Section>
    </main>
  );
}
