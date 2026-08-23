/* =============================================================================
 * STORY (#about) — SOVA §5.7.
 *
 * Sticky column + flowing column. SOVA §10 "what to keep" names this the
 * strongest layout already on the site, and §14.1 maps its `.8fr / 1.2fr` grid
 * to 5/7 columns. In the RTL document the sticky column is the INLINE-START
 * one (physically right) — that is where it sits on the live site, and SOVA's
 * "sticky-left / flowing-right" is a description written from a Latin frame.
 * ========================================================================== */

export const story = {
  kicker: "عن الجمعية",

  title: {
    a: "لسنا نعرض مباني فقط، بل نبني",
    /** gold — the section's one gold element */
    b: "فرصة للعودة والاستقرار.",
  },

  lead: "جمعية العنقاء السكنية جمعية مرخصة تعمل ضمن الإطار المنظم للتعاون السكني، بهدف تأمين مساكن مناسبة بمواصفات متوازنة وأقساط مدروسة.",

  figure: {
    src: "/images/aerial.webp",
    width: 1448,
    height: 1086,
    alt: "منظور جوي لمجمع سكني",
  },

  cards: [
    {
      n: "1",
      h: "الغاية",
      p: "تأمين مسكن لكل مواطن سوري بسعر مناسب ومواصفات تتناسب مع الكلفة.",
    },
    {
      n: "2",
      h: "الرؤية",
      p: "تغيير الانطباع عن الجمعيات السكنية، والدخول كمنافس موثوق في السوق العقارية.",
    },
    {
      n: "3",
      h: "عملنا اليوم",
      p: "ستة مشاريع قائمة موزعة على أربع مناطق في ريف دمشق الغربي.",
    },
  ],
} as const;

export type Story = typeof story;
