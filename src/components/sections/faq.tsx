import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { faq } from "@/content/faq";

/* -----------------------------------------------------------------------------
 * <Faq> (#faq) — SOVA §11 row 12. Light, surface-0.
 *
 * FOUR QUESTIONS, NOT NINE. SOVA wants 8–10 and names the five to add: price,
 * instalment size, delivery date, delay policy, transfer/resale rules. Every
 * one of those answers is a fact the association has never published
 * (`placeholders.pricing`, `instalmentPlan`, `deliveryDate`), and the two most
 * important of them are the reason people are on this page at all. So they are
 * NOT drafted, NOT answered with a pending string, and NOT in the JSON-LD.
 *
 * They are listed in `faq.pendingTopics` in the content file, each tied to the
 * placeholder that blocks it. When an answer arrives it becomes a verbatim
 * `{ q, a }` in `faq.items` and BOTH this section and the FAQPage structured
 * data pick it up with no code change — both read the same array.
 *
 * An accordion whose answer is «تُضاف الأسعار المعتمدة» is not an answer, and
 * five of them beside four real ones is a section that is 55% empty.
 *
 * =============================================================================
 * NEON — nothing to do here (SOVA §15.3, FAQ)
 * =============================================================================
 * Radix owns the open/close; ASTRA's accordion already animates height with
 * `data-open/data-closed` keyframes and rotates the `＋` 45° to a `×`. There is
 * no chevron to mirror, so there is nothing directional to audit. If you add a
 * scroll entrance, call `ScrollTrigger.refresh()` on `onValueChange` — an open
 * panel changes the height of everything below it (SOVA §15.5).
 *
 * Gold budget: the <Accent> on «خطوتك الأولى.» is the client's designated gold
 * phrase, so the kicker drops its rule. The accordion's icon takes
 * `--accent-gold` only on hover/expanded — a transient state, not a resting
 * element, so it does not spend the budget.
 *
 * Server Component. The accordion below is a client island (Radix), which is
 * why `type="single" collapsible` is set here and nothing else is.
 * -------------------------------------------------------------------------- */

export function Faq() {
  return (
    <Section
      id="faq"
      theme="light"
      surface={0}
      /* Location and FAQ are both light surface-0 siblings: default rhythm. */
      space="default"
      container={false}
      aria-labelledby="faq-title"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------- sticky column
              SOVA §10 "what to keep": the sticky-column FAQ layout on the live
              site is correct. It is CSS sticky, no JS. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeader
                kicker={faq.kicker}
                /* The <Accent> is this section's gold (AGENTS §8). */
                rule={false}
                headingId="faq-title"
                size="h1"
                heading={
                  <>
                    {faq.title.a} <Accent>{faq.title.b}</Accent>
                  </>
                }
                lead={faq.lead}
              />
            </div>
          </div>

          {/* ------------------------------------------------- the questions */}
          <div className="lg:col-span-6 lg:col-start-7">
            {/* ⛔ THE SAME FOUR ANSWERS, TWICE, AND THAT IS THE FIX.

                FADE 3: all four answers were ABSENT FROM THE DOM without JS.
                Radix's <Collapsible.Content> renders `isOpen && children`, so a
                closed panel ships an empty div — the answer text is not merely
                hidden, it was never serialised. With scripting disabled the FAQ
                was four unanswerable questions.

                `forceMount` is NOT the fix and was tried first: with it,
                `present` is permanently true, `isPresent` never flips back, and
                every panel stays open forever — the accordion stops being one.
                (`react-collapsible/dist/index.mjs`, `isOpen = context.open ||
                isPresent`.) That is the Radix contract: `forceMount` hands
                visibility to you, and here nothing wants it.

                So the answers ship a second time as a static <dl> that is
                `display: none` until `(scripting: none)` matches — globals.css
                §9, which hides the accordion in the same breath. Cost: four
                short Arabic strings in the HTML. Known limit: `scripting: none`
                does not match when JS is ENABLED but a chunk 404s. The hero's
                1.8s escape covers the catastrophic half of that case; a
                collapsed FAQ on a page whose bundle is dead is degradation, not
                disappearance, and the answers are at least in the DOM now.

                Both lists read `faq.items` — like the JSON-LD, there is one
                source and nothing to keep in sync. */}
            <dl data-slot="faq-static" className="border-line w-full border-t">
              {faq.items.map((item) => (
                <div key={item.q} className="border-line border-b py-6">
                  <dt className="font-display text-h4 text-fg font-semibold text-balance">
                    {item.q}
                  </dt>
                  <dd className="text-body text-fg-muted mt-4 max-w-[62ch] text-pretty">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>

            <div data-slot="faq-interactive">
              <Accordion type="single" collapsible>
                {faq.items.map((item, i) => (
                  <AccordionItem key={item.q} value={`faq-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
