import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { membership } from "@/content/membership";

/* -----------------------------------------------------------------------------
 * <Membership> (#membership) — SOVA §11 row 9. Dark, surface-1.
 *
 * THE SPLIT. This section used to be one block whose heading said "steps" and
 * whose content was conditions. §11 row 9 separates them: the process is now
 * `#process` directly above, and what remains here is eligibility — the five
 * conditions, which is what the content always actually was.
 *
 * ⚠ TWO CLIENT-COPY FLAGS SHIP AS WRITTEN. NEITHER IS A BUG IN THIS FILE.
 *
 *   1. Condition 05 reads «الالتزام بالضوابط والروابط المالية واللوائح
 *      التعاونية.» — `الروابط المالية` means "financial LINKS" and almost
 *      certainly wants to be `الضوابط المالية` (financial controls). Wave 1
 *      flagged it; SOVA §5.12 flagged it. It renders VERBATIM. Silently
 *      rewriting a cooperative's stated membership conditions is editing a
 *      quasi-legal document, not fixing a typo.
 *
 *   2. The heading «خمس خطوات واضحة، وبداية واحدة.» says STEPS above five
 *      CONDITIONS, and the split above makes that sharper, not softer. It also
 *      ships verbatim, for the same reason — and the client's own lead
 *      immediately beneath calls them «شروط مبدئية», in their words, which is
 *      the correction doing its work without us writing it.
 *
 *   Both are TODO(client) items in `src/content/membership.ts`. Do not resolve
 *   either one from this file.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, Membership)
 * =============================================================================
 *
 *   the header column        `position: sticky` in CSS. No JS. It is already
 *                            correct with scripting off.
 *   [data-membership-condition]  each <li>.
 *                            SOVA: `x: dirX(58)`, stagger .11 — and `dirX` is
 *                            MANDATORY (§16.10): a raw `x: 58` slides the
 *                            conditions in from the wrong edge on an RTL page.
 *                            → BUILT at `page-motion.tsx:313`, as one
 *                              `gsap.fromTo` over the NodeList with
 *                              `stagger: 0.11`. The `data-condition-index`
 *                              this contract asked for was never read by it
 *                              (CHAMBER C5) and has been removed.
 *
 * Base state = final state. Every condition below is at rest, opaque and in
 * position; your `gsap.set` is what displaces it.
 *
 * Gold budget: the <Accent> on «وبداية واحدة.» is the client's own designated
 * gold phrase (SOVA §5.12 marks title.b gold), so the kicker drops its rule
 * and the CTA is `outline`, not `gold`.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function Membership() {
  return (
    <Section
      id="membership"
      theme="dark"
      surface={1}
      /* light → dark flip: the transition gets the big rhythm (SOVA §14.3). */
      space="lg"
      container={false}
      aria-labelledby="membership-title"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------- sticky column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeader
                kicker={membership.kicker}
                /* The <Accent> is this section's gold (AGENTS §8). */
                rule={false}
                headingId="membership-title"
                size="h1"
                heading={
                  <>
                    {membership.title.a} <Accent>{membership.title.b}</Accent>
                  </>
                }
                lead={membership.lead}
              />

              <Button asChild variant="outline" className="mt-12">
                <Link href={membership.ctaHref}>{membership.cta}</Link>
              </Button>
            </div>
          </div>

          {/* ---------------------------------------------- the five conditions */}
          <div className="lg:col-span-6 lg:col-start-7">
            <ol
              aria-label={membership.conditionsLabel}
              className="flex flex-col"
            >
              {membership.conditions.map((condition) => (
                <li
                  key={condition.n}
                  data-membership-condition
                  className="border-line grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t py-8 first:border-t-0 first:pt-0 md:gap-x-6"
                >
                  {/* THE INDEX. It was `text-caption` / `--fg-subtle` — 13px
                      at 58% ink, the quietest thing the system can render —
                      and the operator asked for a plain numbered list that
                      looks like one. So: `text-h2` (28 → 36px, weight 600
                      carried by the token itself) in `font-display`, at FULL
                      ink.

                      WHY `text-h2` AND NOT BIGGER. It has to out-rank the
                      condition heading beside it (`text-h4`, 20px) and stay
                      under the section heading above it (`size="h1"`,
                      32 → 48px). h2 is the only rung that sits between them.
                      `text-stat` — the token actually built for numerals —
                      is 36 → 56px and would read as a statistic, i.e. as a
                      claim about the association, which five eligibility
                      conditions are not.

                      NO WEIGHT UTILITY: `--text-h2--font-weight` is already
                      600. Adding `font-semibold` here would be the same
                      declaration written twice.

                      NO GOLD. The section's one gold element is the <Accent>
                      on «وبداية واحدة.» in the heading (AGENTS §8), which is
                      also why the kicker's rule is off. Five gold numerals
                      would be five more.

                      `row-span-2` so the numeral is a single tall cell beside
                      the title+body pair rather than a first row that the
                      body then has to skip with `col-start-2`. Western digits
                      throughout — an index is counted (SOVA §16.7) — and they
                      were already Western in `membership.ts`; nothing about
                      the content changed. */}
                  <span className="font-display text-h2 text-fg row-span-2 tabular-nums">
                    {condition.n}
                  </span>
                  <h3 className="font-display text-h4 text-fg">
                    {condition.h}
                  </h3>
                  <p className="text-body text-fg-muted text-pretty">
                    {condition.p}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
