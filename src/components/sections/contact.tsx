import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FactLink } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { contact } from "@/content/contact";
import {
  address,
  email,
  facebook,
  instagram,
  phone,
  whatsapp,
  type Fact,
} from "@/content/placeholders";

import { ContactForm } from "./contact-form";

/* -----------------------------------------------------------------------------
 * <Contact> (#contact) — SOVA §11 row 13, "make it work". Dark, surface-1.
 *
 * =============================================================================
 * REBUILT 2026-08-21. WHAT CHANGED AND WHY THE ORDER IS THE POINT
 * =============================================================================
 * It used to be a form with a sidebar of notes: the enquiry form at
 * `lg:col-span-7`, and beside it a column holding five channel rows (all five
 * of them pending), two trust lines and a concept badge. The operator asked for
 * one composed section instead, and the composition now runs top to bottom:
 *
 *     1. the heading
 *     2. THE CHANNELS — six cells, the two that actually work first
 *     3. the two trust lines, closing that band
 *     4. the enquiry form, full width, fields two-up from `md`
 *
 * ⛔ CHANNELS ABOVE FORM IS AN HONESTY DECISION, NOT A LAYOUT ONE. The form
 * cannot deliver a message (see §THE HONESTY RULE below). WhatsApp and email
 * can. Putting the working channels first means a visitor who wants to reach
 * the association meets a route that functions before they meet one that does
 * not. Reversing this order would bury the only thing on the page that gets a
 * message to a human. Do not.
 *
 * THERE IS NO SIDEBAR AND NO EMPTY COLUMN. Six cells over three columns fill
 * their band exactly; the form fills its own width by going two-up rather than
 * by shrinking to seven columns and leaving five blank. That was the whole
 * complaint.
 *
 * DELETED HERE, DELIBERATELY (all operator decisions, same date):
 *   · «أوقات الدوام» — the row, in this band and in the footer. The
 *     `contact.officeHours` FACT survives in placeholders.ts; see the note on
 *     it there, because setting its value will no longer show it anywhere.
 *   · «ما الذي يجمعه هذا النموذج» — the /privacy link beside the submit
 *     button. The page is still reachable from the footer. `contact.ts` has
 *     the SOVA §9 #17 argument this leaves open, written out in full.
 *   · «صورة تصورية» — the badge on the night render, with every other concept
 *     badge on the site (see the block on `site.disclaimer`).
 *
 * =============================================================================
 * ⛔ TEST DATA IS ON SCREEN IN THIS SECTION
 * =============================================================================
 * `contact.whatsapp` and `contact.email` are RESOLVED, so the two cells below
 * render real, clickable `wa.me` and `mailto:` links — and neither value is the
 * association's. The operator supplied both on 2026-08-21 for testing. The full
 * block, including the one file that has to change, is on `whatsapp` in
 * `src/content/placeholders.ts`. Nothing in THIS file needs to change when the
 * real values arrive.
 *
 * The remaining four cells are honestly empty: `phone`, `address`, `facebook`
 * and `instagram` are all null, so <FactLink> renders TEXT, not a link that
 * goes nowhere. That is the fix for the old site's WhatsApp button, which was
 * `href="#contact"` with an HTML comment apologising for it.
 *
 * =============================================================================
 * ⛔ THE HONESTY RULE — UNCHANGED BY ANY OF THE ABOVE
 * =============================================================================
 * `src/lib/enquiry-transport.ts` is still unimplemented and
 * `placeholders.contactDelivery` is still null, so the Server Action still
 * cannot return `sent` and the form still says so, in the client's own words,
 * BEFORE the first input: «النموذج تجريبي ولا يرسل بيانات في النسخة الحالية.»
 *
 * ADDING A WORKING WHATSAPP LINK DOES NOT MAKE THE FORM WORK. It is tempting
 * to read a reachable association as a reachable form and soften that notice.
 * They are two different pipes; one of them now has a test value in it and the
 * other has nothing in it at all. Read the header of
 * `src/app/actions/contact.ts` before touching anything near it.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, "Contact background" + "Form fields")
 * =============================================================================
 *   [data-contact-bg]     the background <Image> wrapper. `scale: 1.08,
 *                         yPercent: 7`, scrub. GSAP owns it. The scrim is a
 *                         sibling and must NOT be scaled with it, or the edges
 *                         of the image will crawl out from under it.
 *                         → DONE. There are TWO scrim siblings and neither is
 *                           scaled; see the comment on the second one.
 *   [data-enquiry-form]   Framer's territory (state-driven). Do not put a
 *                         ScrollTrigger on anything inside it — §15.1's
 *                         ownership rule, and a scrubbed field is unusable.
 *
 * Both scrim layers are UNTOUCHED by the rebuild. Their percentages were
 * measured against this render and the comments on them still hold.
 *
 * Base state = final state: the image is at scale 1, in position, and the
 * section is complete without JS.
 *
 * Gold budget: the <Accent> on «من سؤال بسيط.» is the client's designated gold
 * phrase, so the kicker drops its rule, the channel icons are `--fg-subtle`
 * rather than gold, and the submit button is `default` (paper on dark,
 * 15.28:1) rather than `gold`.
 *
 * Server Component; the form inside it is the one client island.
 * -------------------------------------------------------------------------- */

/* -----------------------------------------------------------------------------
 * The two brand glyphs lucide does not carry.
 *
 * lucide-react v1 dropped its brand icons, so `Facebook` and `Instagram` no
 * longer exist as imports. These two are drawn to lucide's own geometry —
 * 24×24 viewBox, `currentColor`, 2px stroke, round caps and joins — so they sit
 * on the same optical weight as <Mail> and <MessageCircle> beside them rather
 * than reading as pasted-in filled logos.
 *
 * They are DECORATION: every cell carries its channel name as Arabic text
 * («فيسبوك», «إنستغرام») and both icons are `aria-hidden`. Nothing here is
 * load-bearing for meaning, which is the only reason drawing a recognisable
 * third-party mark by hand is acceptable at all.
 * -------------------------------------------------------------------------- */

type GlyphProps = { className?: string };

function FacebookGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* -----------------------------------------------------------------------------
 * One way to reach the association.
 *
 * `<FactLink>` decides for itself whether this is a link or a sentence: it
 * renders an <a> only once `factHref()` returns something, and TEXT until then.
 * So a cell cannot become a dead link by being added to the list below, and the
 * two resolved cells cannot become plain text by accident either.
 *
 * `valueDir="ltr"` on everything except the address: `+963934826796`,
 * `dxd.mody2017@gmail.com` and a URL are Latin runs with no strong character to
 * anchor `<bdi dir="auto">`, and inside an RTL sentence they reorder visibly
 * (SOVA §16.8). The address, when it arrives, will be an Arabic sentence and
 * must stay RTL — so it is the one row that passes nothing.
 * -------------------------------------------------------------------------- */
interface Channel {
  label: string;
  fact: Fact;
  Icon?: LucideIcon;
  Glyph?: (props: GlyphProps) => React.JSX.Element;
  ltr?: boolean;
}

function ChannelCell({ label, fact, Icon, Glyph, ltr }: Channel) {
  return (
    <li className="border-line border-t py-6 lg:pe-8">
      <p className="text-caption text-fg-subtle flex items-center gap-3">
        {Icon ? <Icon aria-hidden className="size-4 shrink-0" /> : null}
        {Glyph ? <Glyph className="size-4 shrink-0" /> : null}
        {label}
      </p>
      {/* `[overflow-wrap:anywhere]` — a supplied profile URL has no spaces in
          it and would otherwise push this cell past its column. */}
      <p className="text-body text-fg mt-2 [overflow-wrap:anywhere]">
        <FactLink fact={fact} valueDir={ltr ? "ltr" : undefined} />
      </p>
    </li>
  );
}

export function Contact() {
  /* Order is deliberate: the two that WORK, then the two the operator asked
     for and the association has not supplied, then the two older gaps. A
     visitor reads the top-start cell first. */
  const channels: Channel[] = [
    {
      label: contact.channels.whatsapp,
      fact: whatsapp,
      Icon: MessageCircle,
      ltr: true,
    },
    { label: contact.channels.email, fact: email, Icon: Mail, ltr: true },
    {
      label: contact.channels.facebook,
      fact: facebook,
      Glyph: FacebookGlyph,
      ltr: true,
    },
    {
      label: contact.channels.instagram,
      fact: instagram,
      Glyph: InstagramGlyph,
      ltr: true,
    },
    { label: contact.channels.phone, fact: phone, Icon: Phone, ltr: true },
    { label: contact.channels.address, fact: address, Icon: MapPin },
  ];

  return (
    <Section
      id="contact"
      theme="dark"
      surface={1}
      /* light → dark flip: the transition gets the big rhythm (SOVA §14.3). */
      space="lg"
      container={false}
      aria-labelledby="contact-title"
      className="overflow-hidden"
    >
      {/* --------------------------------------------------- the night ground
          A conceptual render. It no longer carries a `صور تصورية` badge — the
          per-image badges were all removed (see the block on
          `site.disclaimer`) — and unlike the interior gallery, which was
          switched off in the same pass, this one does not need it: at the
          scrim densities below the render is texture behind a green ground,
          not a photograph a visitor could mistake for a finished building.
          The standing disclaimer in the footer covers it. If either scrim is
          ever weakened, that judgement has to be made again. */}
      <div
        data-contact-bg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Image
          src={contact.background.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* The scrim is a SIBLING of the parallax layer on purpose — see the NEON
          note above.

          88% OF THE GROUND COLOUR, AND THE NUMBER WAS MEASURED, NOT PICKED.
          At 80% the lit windows of the render came through hard enough that
          `--fg-subtle` (white at 58%) landed around 4.5:1 over the brightest
          pixels — technically AA, visibly busy, and the form sat on top of a
          building. At 88% the same worst-case pixel is ≈5:1, the ground reads
          as brand green with a building behind it rather than as a photograph
          with text on it, and the gold accent in the heading has the solid
          scrim AGENTS §8 requires. Lower it and re-check the channel cells,
          which carry the smallest text in the section.

          92% UNDER `md`. The section is roughly twice as tall on a phone and
          `object-cover` scales a 1672×941 render to fill it, so the visible
          crop is magnified about four times: the same window that is a
          highlight on desktop becomes a bright patch the width of a column of
          13px text. The extra 4% costs nothing — at that crop the image is
          texture, not a building. */}
      <div
        aria-hidden
        className="bg-surface-inverse-1/92 md:bg-surface-inverse-1/88 pointer-events-none absolute inset-0 -z-10"
      />

      {/* ------------------------------------------------- the form's own scrim
          NEON added this layer. The flat scrim above is JETT's, measured, and
          it is not touched — the contrast numbers in the comment above still
          hold everywhere, because this only ever ADDS density.

          THE PROBLEM IT FIXES: at a uniform 88% the render's lit windows were
          still legible THROUGH the enquiry form, so five fields and four radio
          chips sat on top of a building and the busiest part of the section
          was the part asking for a phone number.

          THE EXTRA DENSITY IS VERTICAL, NOT DIRECTIONAL. A first attempt put it
          on the inline axis — dense behind the form, light behind the channel
          list — and a screenshot killed it: the render's building mass sat
          under the channel column, so the busy half simply moved. The 2026-08-21
          rebuild stacks the channels ABOVE the form instead of beside it, which
          makes the vertical band even more clearly the right axis: every piece
          of text in this section is now in the same horizontal middle of it.

          Composited on the 88% base this lands the content band at ~0.95 and
          leaves the top and bottom edges at ~0.90. That difference is the
          point: the band still reads as a night render behind glass rather
          than as a flat green rectangle, and the eye can still see there is a
          building back there. Raising JETT's measured base layer instead would
          have thrown away the only photography in the section.

          Direction-neutral, so unlike the hero's scrims there is nothing here
          to flip if the document ever becomes LTR (SOVA §16.11). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_39_36/0.20)_0%,rgb(0_39_36/0.58)_28%,rgb(0_39_36/0.58)_84%,rgb(0_39_36/0.18)_100%)]"
      />

      <Container>
        <SectionHeader
          align="split"
          kicker={contact.kicker}
          /* The <Accent> is this section's gold (AGENTS §8). */
          rule={false}
          headingId="contact-title"
          heading={
            <>
              {contact.title.a} <Accent>{contact.title.b}</Accent>
            </>
          }
          lead={contact.lead}
        />

        {/* ----------------------------------------------------- the channels
            Six cells over three columns at `lg`, two at `sm`, one below that —
            so the grid is always exactly full and there is never a hanging
            cell. Each cell owns its own top hairline, which is what draws the
            row rules; the band is closed at the bottom by the trust line's
            `border-t` rather than by a rule of its own. */}
        <h3 className="text-label text-fg-subtle mt-16 font-semibold">
          {contact.channels.title}
        </h3>
        <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCell key={channel.fact.id} {...channel} />
          ))}
        </ul>

        {/* The two trust lines, verbatim (SOVA §5.16). They close the channel
            band because they are the answer to "who am I about to message". */}
        <p className="border-line text-body-sm text-fg-muted border-t pt-6">
          {contact.trust.a}
          <span className="text-fg-subtle"> — </span>
          {contact.trust.b}
        </p>

        {/* --------------------------------------------------------- the form
            Full width, not `lg:col-span-7` with five empty columns beside it.
            <ContactForm> lays its four fields out two-up from `md`, which is
            what lets it hold this measure without any field becoming a
            600px-wide text input. */}
        <h3 className="text-label text-fg-subtle mt-24 font-semibold">
          {contact.formTitle}
        </h3>
        <div className="mt-6">
          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}
