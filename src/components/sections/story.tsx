import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { story } from "@/content/story";

/* -----------------------------------------------------------------------------
 * <Story> (#about) — SOVA §11 row 3, kept.
 *
 * The sticky/flowing split is the strongest layout already on the site (SOVA
 * §10, "what to keep") and §14.1 maps its `.8fr / 1.2fr` grid onto 5/7 columns.
 *
 * RTL NOTE: SOVA calls this "sticky-left / flowing-right", which is a Latin
 * description of an Arabic page. In the document as it actually renders, the
 * sticky column is the INLINE-START one — physically on the right — exactly
 * where the live site puts it. It is the first grid child; the mirroring is
 * free.
 *
 * NEON — the figure is structured for the story-image entrance you are porting
 * (SOVA §10 calls it better than anything on either reference site):
 *
 *     figure[data-story-figure]          <- clip-path inset() + y/scale/rotation
 *       div[data-story-figure-inner]     <- the counter-scale (starts 1.16)
 *         img                            <- fills the wrapper
 *       figcaption                       <- fades up last
 *
 * The old values, for reference: figure from `inset(18% 8% 18% 8% round 54px)`
 * y:76 scale:.88 rotation:1.4 opacity:0 → `inset(0% round 34px)`, 1.12s
 * power4.out, with the inner image 1.16 → 1 over 1.35s. Two notes: our radius
 * token is 24px (`rounded-figure`), not 34; and the resting state below is the
 * FINISHED one — the image is fully visible with JS off, and your `gsap.set`
 * is what hides it.
 *
 * Gold budget: the <Accent> phrase is this section's one gold element, so the
 * kicker deliberately does NOT use `.kicker-rule` (that hairline is gold-500).
 * On a light ground the bare kicker is brand-600 green, which costs nothing
 * against the budget.
 *
 * WAVE 2: this header was hand-composed in wave 1 only because <SectionHeader>
 * always drew that rule. It now takes `rule={false}` (and `headingId`, so the
 * section can still name itself with aria-labelledby), and the hand-rolled
 * copy is gone. One header component, one set of internal spacing.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function Story() {
  return (
    <Section
      id="about"
      theme="light"
      surface={0}
      /* dark → light flip: SOVA §14.3 says the transition gets the big rhythm. */
      space="lg"
      container={false}
      aria-labelledby="story-title"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------- sticky column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeader
                kicker={story.kicker}
                /* The <Accent> below is this section's one gold element, so
                   the kicker's gold hairline is off (AGENTS §8). */
                rule={false}
                headingId="story-title"
                size="h1"
                heading={
                  <>
                    {story.title.a} <Accent>{story.title.b}</Accent>
                  </>
                }
                lead={story.lead}
              />

              {/* ⛔ THE FOUR REGION NAMES USED TO BE LISTED HERE. THEY ARE
                  NOT COMING BACK — operator decision, 2026-08-21.

                  ضاحية الفردوس · الفيحاء · جمرايا · الهامة rendered THREE
                  times on one page: this decorative list, the projects filter
                  chips, and the distribution in <LocationSection>. The other
                  two both earn it — the filter is a working control and the
                  location distribution is the only geographic statement the
                  site is able to make honestly (there are no coordinates; see
                  `regionsMap` in placeholders.ts). This one was a label strip
                  under a lead paragraph that already says
                  «ريف دمشق الغربي», so it repeated the section's own copy.

                  Nothing was lost: `src/content/regions.ts` is untouched and
                  is still the single source for all four names. If a future
                  change wants geography in Story, LINK to `#location`; do not
                  re-list the names. */}
            </div>
          </div>

          {/* ------------------------------------------------ flowing column */}
          <div className="lg:col-span-7">
            <figure data-story-figure className="rounded-figure relative overflow-hidden">
              <div
                data-story-figure-inner
                className="relative aspect-[4/3] w-full overflow-hidden"
              >
                <Image
                  src={story.figure.src}
                  alt={story.figure.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* The inset hairline from the old figure — a small, cheap piece
                  of craft worth keeping. Non-gold, so it costs no budget. */}
              <span
                aria-hidden
                className="border-inv-a40 rounded-md pointer-events-none absolute inset-3 border"
              />

              {/* ⛔ THE FIGCAPTION IS GONE — operator, 2026-08-22. It was a
                  pill reading «صورة تصورية للمخطط العام», i.e. the last
                  surviving per-image concept badge on the site: the 2026-08-21
                  sweep removed the other five and missed this one because it
                  is a <figcaption>, not a component called a badge.

                  `story.figure.caption` was deleted with it, so this cannot
                  come back by accident. The figure's `alt` still describes the
                  image honestly as a «منظور» (an architectural rendering) —
                  that is the a11y contract and it did not change. */}
            </figure>

            <ol className="mt-12 grid gap-8 sm:grid-cols-3">
              {story.cards.map((card) => (
                <li
                  key={card.n}
                  data-story-card
                  className="border-line border-t pt-6"
                >
                  <span className="text-caption text-fg-subtle">{card.n}</span>
                  <h3 className="font-display text-h4 text-fg mt-3">{card.h}</h3>
                  <p className="text-body-sm text-fg-muted mt-3 text-pretty">
                    {card.p}
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
