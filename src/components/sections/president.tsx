import { FactMedia, FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { chairmanName, chairmanPortrait } from "@/content/placeholders";
import { president } from "@/content/president";

/* -----------------------------------------------------------------------------
 * <President> (#president) — SOVA §11 row 10. Light, surface-1.
 *
 * =============================================================================
 * ⛔ THE ONE RULE THIS SECTION EXISTS TO FIX — SOVA §10.5
 * =============================================================================
 * The live site ships `.president blockquote { color: rgba(21,35,32,.2) }` and
 * fills the sentence in word by word on an unthrottled scroll handler. The
 * sentence in question is about Syrians who were forcibly displaced and lost
 * their homes. At 20% opacity it is invisible — if the JS fails, if the
 * visitor lands mid-page from a shared link, if they scroll past quickly, or
 * if `prefers-reduced-motion` is set. The most powerful line on the site is
 * conditional on a decorative effect succeeding.
 *
 * BELOW, THE QUOTE IS `--fg-muted` AT REST: 8.94:1 on this surface, full body
 * legibility, no opacity floor, no JS. NEON's scrub animates it from muted to
 * `--fg` — from readable TO EMPHASISED, never from invisible. If a future
 * change makes the resting colour lighter than `--fg-muted`, it is a
 * regression of the single worst bug on the old site.
 *
 * =============================================================================
 * NEON — the DOM contract (SOVA §15.3, President quote)
 * =============================================================================
 *
 *   [data-president-quote]   the <blockquote>. Its ONLY child is one <p>
 *                            holding one uninterrupted text node — no <span>,
 *                            no <bdi>, no line breaks — because `SplitText`
 *                            re-parents what it finds and nested markup is how
 *                            it silently drops words.
 *                            `type: "words"` ONLY. **Never `"chars"`**: Arabic
 *                            is cursive, and splitting a word into per-glyph
 *                            elements severs every letter join in it. That is
 *                            not a stylistic preference, it makes the text
 *                            unreadable.
 *   ⛔ THERE IS NO `data-quote-rest`, AND THERE NEVER WAS A READER FOR ONE.
 *                            This contract used to promise one — "the resting
 *                            colour token name, so the scrub can tween back to
 *                            it rather than to a literal" — and the attribute
 *                            shipped on the <blockquote> for months. The scrub
 *                            never read it: `page-motion.tsx:431` is
 *                            `getComputedStyle(quoteText).color`, which is
 *                            strictly better because it survives a theme swap
 *                            and cannot drift from the class. CHAMBER C5
 *                            caught it; editing the attribute would have
 *                            changed nothing on screen and cost someone an
 *                            hour. The resting colour is the `text-fg-muted`
 *                            class on the <p>. That is the only place it
 *                            lives.
 *
 * Everything else here is static. The portrait is a slot, not a target.
 *
 * =============================================================================
 * NOTES ON WHAT IS AND IS NOT ON THE PAGE
 * =============================================================================
 * · `font-naskh` (Noto Naskh Arabic) is used HERE AND NOWHERE ELSE ON THE
 *   SITE — the bismillah and the statement. It is the editorial accent face
 *   (AGENTS §2); reaching for it in a second section is how it stops meaning
 *   anything.
 *
 * · The chairman is UNNAMED. `placeholders.chairmanName` renders the client's
 *   own wording, «الاسم يُضاف بعد اعتماده», beneath the statement. A signed
 *   personal address from an anonymous signatory is odd, and it should be —
 *   SOVA §9 gap 2 is a launch blocker.
 *
 * · ⚠️ `public/images/abo_hmza.webp` NOW SHIPS. OPERATOR DECISION, 2026-08-21,
 *   REVERSING WHAT THIS BLOCK USED TO SAY. It used to read "IS NOT SHIPPED,
 *   and the empty frame below is deliberate", on three grounds: the file is
 *   859×1280 at 23 KB (roughly 0.02 bits per pixel, visibly over-compressed),
 *   it is the largest photograph of a human being on the site, and it shows a
 *   person the page cannot name. Two of those three are still true and are
 *   NOT resolved by shipping it —
 *
 *     the file quality  `chairmanPortrait.requires` in placeholders.ts is
 *                       rewritten as a REPLACEMENT request rather than a
 *                       first delivery, and says so.
 *     the missing name  `chairmanName` is untouched: still null, still a
 *                       launch blocker, still rendering the client's own
 *                       «الاسم يُضاف بعد اعتماده» in the signature below.
 *
 *   The photograph arrives through the MediaFact, not through a hard-coded
 *   <Image> — `<FactMedia>` is still the only thing in this file that reads a
 *   `src`, so if the operator ever pulls the asset again, setting `src: null`
 *   restores the honest empty frame and nothing here has to change.
 *
 * · `president.more.summary` («قراءة الكلمة كاملة») is intentionally NOT
 *   rendered. It is the label of a disclosure on the old site; here the full
 *   statement is already on screen, so a control that reveals it would reveal
 *   nothing. The string stays in content/president.ts because it is the
 *   client's, exactly as the unused interior captions do.
 *
 * Gold budget: the bismillah is the section's one gold element —
 * `--accent-gold` resolves to gold-700 on this light ground (5.54:1, AA), and
 * setting the formal opening apart from the statement is real typographic work
 * rather than ornament. So: no kicker rule, no <Accent> in the heading, no
 * gold CTA.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

export function President() {
  return (
    <Section
      id="president"
      theme="light"
      surface={1}
      /* dark → light flip: the transition gets the big rhythm (SOVA §14.3). */
      space="lg"
      container={false}
      aria-labelledby="president-title"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------ portrait column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <figure>
                {/* `sizes` — CORRECTED 2026-08-21 when the real asset landed.
                    It used to read
                    `(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 90vw`,
                    and the 50vw branch was simply wrong: the grid above is
                    `lg:grid-cols-12`, so BELOW 1024px there is one column and
                    this figure is the full container width — never half of it.
                    While the slot was empty that mistake cost nothing; with an
                    image in it, it would have picked a source about half the
                    width it needed on every tablet.

                      ≥1024   the column is lg:col-span-4 of a 12-col grid in
                              an 80rem container → ≈405px at 1440 = 28.2vw.
                              30vw, rounded up.
                      <1024   one column, full container:
                              `min(100% - 2·gutter, 80rem)` → 91.7vw at 768,
                              88.8vw at 430. 92vw covers both.

                    The 2:3 frame matches the source's 859×1280 exactly, so
                    `object-cover` crops nothing. */}
                <FactMedia
                  fact={chairmanPortrait}
                  sizes="(min-width: 1024px) 30vw, 92vw"
                  className="rounded-figure border-line aspect-[2/3] w-full border"
                />
                <figcaption className="text-caption text-fg-subtle mt-4">
                  {president.portraitCaption}
                </figcaption>
              </figure>
            </div>
          </div>

          {/* -------------------------------------------------- the statement */}
          <div className="lg:col-span-7 lg:col-start-6">
            <SectionHeader
              headingId="president-title"
              heading={president.kicker}
            />

            {/* The formal opening. Naskh, gold, quiet — it is a salutation,
                not a headline, so it sits at `lead` size rather than quote. */}
            <p className="font-naskh text-lead text-accent-gold mt-10">
              {president.bismillah}
            </p>

            {/* ⛔ RESTING COLOUR IS `--fg-muted`. See the block at the top of
                this file before changing it. */}
            <blockquote
              data-president-quote
              className="mt-8"
            >
              <p className="font-naskh text-quote text-fg-muted text-pretty">
                {president.quote}
              </p>
            </blockquote>

            <p className="text-body text-fg-muted mt-8 text-pretty">
              {president.more.body}
            </p>

            {/* The signature. Role in full ink, name from placeholders — the
                association has not approved one yet. */}
            <footer className="border-line mt-12 border-t pt-6">
              <p className="text-body text-fg font-semibold">
                {president.signature.role}
              </p>
              <p className="text-body-sm mt-1">
                <FactText fact={chairmanName} />
              </p>
            </footer>
          </div>
        </div>
      </Container>
    </Section>
  );
}
