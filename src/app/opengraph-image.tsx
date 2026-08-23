import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/content/site";

import { markDataUri, OG_GOLD, OG_GREEN, OG_PAPER } from "./_brand/mark-svg";

/* =============================================================================
 * OPEN GRAPH CARD — SOVA §9 #15. 1200×630.
 *
 * =============================================================================
 * ⛔ WHAT IS NOT ON THIS CARD
 * =============================================================================
 * No claim of any kind. No «مرخصة», no licence number, no unit count, no
 * price, no delivery date, no photograph of a building that does not exist. A
 * share card is the most-copied surface a site has — it ends up in group chats
 * with no context and no way to click through to the hedge that qualifies it —
 * so it carries only what is unambiguously true: the association's name, its
 * full legal name, and its own mark.
 *
 * The composition is the brand and nothing else: the green ground, the gold
 * mark at the inline-start edge, a gold hairline, the name. No stock imagery,
 * no gradient, no glow. Gold is a metal here too — a hairline and a mark, well
 * under the 5% ceiling (AGENTS §8).
 *
 * =============================================================================
 * THE FONT IS VENDORED ON PURPOSE
 * =============================================================================
 * `src/app/_brand/Alexandria-SemiBold-subset.ttf` is an 11 KB subset of
 * Alexandria (SIL Open Font License 1.1, the display face this site already
 * uses via next/font) containing ONLY the glyphs in the two strings below.
 *
 * It is committed rather than fetched at build time because a build that
 * reaches out to fonts.gstatic.com fails on any offline or firewalled CI, and
 * an OG card is not worth that. THE COST: the subset covers those two strings
 * and nothing else. If you change the text on this card, re-subset the font —
 * a glyph that is not in the file renders as nothing at all, silently.
 *
 *   node -e "…fonts.googleapis.com/css2?family=Alexandria:wght@600&text=<TEXT>…"
 *
 * =============================================================================
 * ⛔ SATORI LAYS ARABIC WORDS OUT LEFT-TO-RIGHT. THIS IS NOT A STYLE CHOICE.
 * =============================================================================
 * The first render of this card said «العنقاء جمعية السكنية» — every word
 * correctly SHAPED (Satori does joining properly) and every word in the wrong
 * ORDER, because Satori's bidi does not reorder runs and `direction: rtl` on
 * the container changed nothing. On a share card for an Arabic organisation
 * that is not a glitch, it is the name spelled wrong.
 *
 * THE FIX, and why it is a layout fix rather than a string hack: each line is
 * a `flexDirection: "row-reverse"` row and each WORD is its own child. The
 * first child lands on the right, the next to its left, and so on — which is
 * exactly RTL word order — while every word is still shaped as one run.
 * Arabic letters do not join across a space, so splitting on spaces costs
 * nothing typographically.
 *
 * DO NOT "simplify" this by pre-reversing the string. That would put the words
 * in the content file in the wrong order to make the renderer look right, and
 * the day Satori fixes its bidi the card would break silently and backwards.
 *
 * Re-check the rendered PNG by eye whenever the text changes. `<Word>` below
 * is the only correct way to put Arabic on this card.
 * ========================================================================== */

export const alt = site.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const alexandria = await readFile(
  join(process.cwd(), "src/app/_brand/Alexandria-SemiBold-subset.ttf"),
);

/**
 * One line of Arabic, laid out right-to-left. See the block above for why this
 * cannot just be a string in a `direction: rtl` div.
 *
 * `gap` replaces the inter-word space, which is consumed by the split — pick it
 * by eye against the font size, not from the space ladder: this is an image,
 * not a page.
 */
function ArabicLine({
  text,
  color,
  fontSize,
  gap,
  marginTop = 0,
}: {
  text: string;
  color: string;
  fontSize: number;
  gap: number;
  marginTop?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "baseline",
        width: "100%",
        gap,
        marginTop,
        color,
        fontSize,
        lineHeight: 1.3,
      }}
    >
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>{word}</span>
      ))}
    </div>
  );
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // The card is a right-to-left object: the mark, the hairline and the
          // name all sit against the INLINE-START edge, which in Arabic is the
          // right. Satori has no logical properties, so it is spelled out.
          alignItems: "flex-end",
          background: OG_GREEN,
          padding: 80,
          fontFamily: "Alexandria",
        }}
      >
        {/* The mark, alone, at the top. It is the whole identity. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori. */}
        <img src={markDataUri(OG_GOLD)} width={132} height={128} alt="" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "flex-end",
          }}
        >
          {/* The gold hairline. 1px of metal, the same device as `.kicker-rule`
              and `.rule-gold` in globals.css. */}
          <div
            style={{
              width: 220,
              height: 1,
              background: OG_GOLD,
              marginBottom: 40,
            }}
          />
          <ArabicLine
            text={site.meta.title}
            color={OG_PAPER}
            fontSize={68}
            gap={22}
          />
          <ArabicLine
            text={site.brand.fullName}
            color="rgba(255,255,255,0.78)"
            fontSize={32}
            gap={10}
            marginTop={22}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Alexandria",
          data: alexandria,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
