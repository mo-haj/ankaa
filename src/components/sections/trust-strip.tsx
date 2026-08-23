import { FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Label } from "@/components/layout/typography";
import { Counter } from "@/components/motion/counter";
import { Marquee } from "@/components/ui/marquee";
import { licenceAuthority, licenceNumber } from "@/content/placeholders";
import { site } from "@/content/site";
import { trust } from "@/content/trust";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <TrustStrip> (#trust) — SOVA §11 row 2.
 *
 * Three things the old site had scattered across the page, merged into one dark
 * band directly under the hero: the stats bar, the values marquee, and the
 * official-supervision block that sat at position 10. SOVA §10.4: "the trust
 * story is buried at position 10" — for a cooperative competing against private
 * developers, official supervision IS the product, and both reference sites
 * establish credibility before they explain anything.
 *
 * ⛔ THE LICENCE NUMBER IS THE POINT OF THIS SECTION AND IT DOES NOT EXIST.
 * The site claims `مرخصة` five times and has never said by whom or under what
 * number (SOVA §9 #7). So the credential renders the honest gap from
 * placeholders.ts — `يُضاف رقم الترخيص` — and it renders it in the most
 * prominent slot on the band rather than hiding it. When the number arrives it
 * lands here, unchanged, and this becomes the strongest section on the page.
 *
 * ⛔ NO MINISTRY LOGO. `public/images/ministry.webp` is a government emblem the
 * association itself hedges about (SOVA §9 #8, a legal blocker). This layout is
 * built so that no logo is ever needed: the credential is TYPE, not a borrowed
 * mark. See `ministryEmblem` in placeholders.ts before considering adding one.
 * TODO(client): supply either (a) a photograph of the actual licence document
 * — placeholders.licenceDocument, the preferred fix — or (b) written
 * authorisation to reproduce the emblem. Until one of those exists, nothing
 * goes in this slot.
 *
 * NEON — the counters ship as static markup at their FINAL values. Each number
 * carries `data-count-to` (Western integer, machine-readable) and
 * `data-count-numerals="arab"` (the display system). The resting DOM is
 * already correct and stays correct with JS off.
 *   → DONE: `<Counter>` (src/components/motion/counter.tsx) is a Framer
 *     `useInView({ once: true, amount: 0.55 })` count-up. It renders this
 *     exact <bdi> with the same three attributes, so nothing about the markup
 *     or the fallback changed. The marquee is pure CSS and needed nothing.
 *
 * Gold budget: the kicker (gold-300 label + gold-500 hairline) is this
 * section's ONE gold element — which is why the heading has no <Accent> and the
 * stat numbers are plain ink.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function TrustStrip() {
  return (
    <Section
      id="trust"
      theme="dark"
      surface={1}
      /* Hero and this band are both dark, and this is a STRIP sitting directly
         under the hero rather than a full section — `sm` (64→88px). The
         light/dark flip below it gets `lg` instead, which is where SOVA §14.3
         wants the air. */
      space="sm"
      container={false}
    >
      {/* --------------------------------------------------------------- stats
          `١٠٠٪ مبدأ تعاوني` is dropped per SOVA §11 row 2 — a claim about a
          principle, dressed as a measurement, sitting next to three countable
          facts. */}
      <Container>
        <ul
          aria-label={site.a11y.statsLabel}
          className="grid gap-8 sm:grid-cols-3"
        >
          {trust.stats.map((stat, i) => (
            <li
              key={stat.label}
              className={cn(
                i > 0 && "sm:border-line sm:border-s sm:ps-8",
              )}
            >
              <p className="font-display text-stat text-fg">
                {/* NEON: the <bdi> and its three data-* attributes are
                    unchanged — <Counter> renders exactly the markup wave 1
                    shipped and animates the node it owns. Server-rendered
                    value in, same value out; the count-up is additive. */}
                {/* ⛔ `numerals` AND `trust.stats[].display` ARE ONE SETTING
                    WRITTEN TWICE. `latn` is what the count-up formats in;
                    `display` is what it lands on. See the block on `Stat` in
                    content/trust.ts. Western per the 2026-08-21 sweep. */}
                <Counter
                  value={stat.value}
                  display={stat.display}
                  prefix={stat.prefix}
                  numerals="latn"
                />
              </p>
              <p className="text-body-sm text-fg-muted mt-2">{stat.label}</p>
            </li>
          ))}
        </ul>
      </Container>

      {/* ------------------------------------------------------------- marquee
          The Marquee repeats its children four times to make the loop seamless,
          so the visible strip is decorative duplication. Screen readers get the
          five values exactly once, from the list above it. */}
      <div className="border-line mt-16 border-y py-4">
        <ul className="sr-only">
          {trust.marquee.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
        <div aria-hidden>
          <Marquee className="[--duration:38s] [--gap:3rem] p-0" pauseOnHover>
            {trust.marquee.map((value) => (
              <span
                key={value}
                className="text-body-sm text-fg-muted flex items-center gap-12"
              >
                {value}
                <span className="bg-veil-20 size-1 shrink-0 rounded-full" />
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ---------------------------------------------------------- credential */}
      <Container className="mt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <SectionHeader
            className="lg:col-span-6"
            kicker={trust.credential.kicker}
            heading={`${trust.credential.title.a} ${trust.credential.title.b}`}
            lead={trust.credential.lead}
          />

          <div className="lg:col-span-5 lg:col-start-8">
            {/* The licence itself — the fact this whole band exists to carry. */}
            <div className="border-line rounded-card border p-6">
              <div>
                <Label className="text-fg-subtle block">
                  {trust.credential.licenceNumberLabel}
                </Label>
                <p className="text-h4 font-display mt-2">
                  <FactText fact={licenceNumber} />
                </p>
              </div>
              <div className="border-line mt-6 border-t pt-6">
                <Label className="text-fg-subtle block">
                  {trust.credential.licenceAuthorityLabel}
                </Label>
                <p className="text-body-sm mt-2">
                  <FactText fact={licenceAuthority} />
                </p>
              </div>
            </div>

            <ul className="mt-8 flex flex-col gap-4">
              {trust.credential.notes.map((note) => (
                <li
                  key={note.n}
                  className="border-line flex items-baseline gap-4 border-t pt-4"
                >
                  <span className="text-caption text-fg-subtle shrink-0">
                    {note.n}
                  </span>
                  <span className="text-body-sm text-fg-muted">{note.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
