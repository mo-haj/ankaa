/* =============================================================================
 * MEMBERSHIP (#membership) — SOVA §5.12.
 *
 * ⚠ COPY FLAG — RAISE WITH THE CLIENT, DO NOT FIX SILENTLY.
 * Condition 05 reads `الالتزام بالضوابط والروابط المالية واللوائح التعاونية.`
 * `الروابط المالية` means "financial LINKS", which does not fit the sentence.
 * The intended word is almost certainly `الضوابط المالية` (financial controls)
 * or `الربوط المالية`. It is reproduced BELOW EXACTLY AS THE CLIENT WROTE IT.
 * Changing a regulated cooperative's stated membership conditions without
 * written instruction is not a typo fix — it is us editing a legal-ish
 * document. Flagged in the wave 1 handoff; see also SOVA §5.12 and §9.
 *
 * Second flag, from SOVA: the heading says `خمس خطوات` (five STEPS) while the
 * content is five CONDITIONS. §11 row 9 splits this section — eligibility here,
 * the real steps (apply → pay → allocate → contract → deliver) in `#process`.
 *
 * ⚠ WAVE 3 — THE SPLIT HAS HAPPENED, AND IT MAKES THE HEADING FLAG URGENT.
 * `#process` now exists and this section is conditions only, so
 * «خمس خطوات واضحة، وبداية واحدة.» sits above five things that are not steps.
 * It ships VERBATIM anyway, for the same reason condition 05 does: it is the
 * client's own heading on their own membership section, and rewriting it is
 * editing their copy, not fixing a typo. Two things keep it honest in the
 * meantime — there are in fact five items, and the client's own lead directly
 * beneath says «شروط مبدئية للانتساب» (preliminary CONDITIONS) in their words.
 *
 * TODO(client): one decision, either — (a) approve a conditions heading for
 * this section, or (b) confirm that «خمس خطوات» should move to `#process` and
 * send the five steps it names. Do not pick one for them.
 * ========================================================================== */

export const membership = {
  kicker: "الانتساب",
  title: {
    a: "خمس خطوات واضحة،",
    /** gold */
    b: "وبداية واحدة.",
  },
  lead: "شروط مبدئية للانتساب إلى الجمعية. تراجع الوثائق والتفاصيل التنظيمية رسميا قبل قبول الطلب.",
  cta: "ابدأ طلبا مبدئيا",

  /** authored — where the CTA goes. The client's copy is a label, not a link. */
  /* Root-anchored (`/#…`) for the reason spelled out at the top of
     `nav.ts`: a bare fragment is a link to nowhere on any route but `/`.
     This one only renders on `/` today, and it stays correct if that ever
     changes. */
  ctaHref: "/#contact",

  /** authored — aria-label for the conditions list. */
  conditionsLabel: "شروط الانتساب المعلنة",

  conditions: [
    {
      n: "1",
      h: "الجنسية السورية",
      p: "أن يكون طالب الانتساب مواطنا سوريا.",
    },
    {
      n: "2",
      h: "العمر القانوني",
      p: "أن يكون قد أتم الثامنة عشرة من العمر.",
    },
    {
      n: "3",
      h: "عدم الاستفادة سابقا",
      p: "ألا يكون قد استفاد من جمعية سكنية سابقة وفق الضوابط المعتمدة.",
    },
    {
      n: "4",
      h: "منطقة العمل",
      p: "أن يكون ضمن منطقة عمل الجمعية أو مستوفيا شروطها التنظيمية.",
    },
    {
      n: "5",
      h: "الالتزام المالي",
      // VERBATIM. See the copy flag at the top of this file. Do not edit.
      p: "الالتزام بالضوابط والروابط المالية واللوائح التعاونية.",
    },
  ],
} as const;
