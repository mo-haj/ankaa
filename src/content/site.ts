/* =============================================================================
 * SITE — global copy: meta, brand lockup, accessibility strings, disclaimers.
 *
 * VERBATIM RULE (applies to every file in src/content/):
 * The Arabic below is the client's own copy, copied character-for-character
 * from SOVA recon brief §5. It is not translated, retyped, paraphrased or
 * "improved". If a string looks wrong, it gets FLAGGED to the client — see the
 * copy flag on membership condition 05 in `membership.ts`.
 *
 * Strings that are NOT client copy (accessibility labels we authored, honest
 * placeholders) are marked `// authored` so a future reviewer can tell the two
 * apart at a glance.
 *
 * Digits (SOVA §16.7): decorative counters and step numbers use Eastern
 * Arabic-Indic (٠١٢٣); anything a human copies, dials or measures — phone
 * numbers, areas, dates — uses Western (0123). Decided per string, here, never
 * globally.
 * ========================================================================== */

export const site = {
  /** SOVA §5.1 */
  meta: {
    title: "جمعية العنقاء السكنية",
    description:
      "جمعية العنقاء السكنية — مشاريع سكنية تعاونية بمواصفات جيدة وكلفة مدروسة في ريف دمشق الغربي.",
    locale: "ar_SY",
  },

  brand: {
    name: "العنقاء السكنية",
    tagline: "جمعية سكنية مرخصة",
    logoAlt: "شعار جمعية العنقاء",
    /**
     * The full legal name. On the old site it exists ONLY as an alt attribute —
     * SOVA §5.1 notes it "should be used properly". It is used properly in the
     * footer.
     */
    fullName: "جمعية العنقاء التعاونية للسكن والاصطياف",
  },

  /** SOVA §5.1 — accessibility strings that already existed on the old site. */
  a11y: {
    backToTop: "العودة إلى أعلى الصفحة",
    openMenu: "فتح القائمة",
    mainNav: "التنقل الرئيسي",
    regionChoice: "اختيار المنطقة",
    statsLabel: "إحصائيات الجمعية",
    /* NOT RENDERED as of 2026-08-21. It labelled the four-region list in
       <Story>, which was cut (the same names render twice more on the page —
       see the block in story.tsx). Kept rather than deleted because it is a
       string the old site already shipped, and the list may return as a
       labelled control. If it is still unrendered when the next reader gets
       here, delete it: an a11y label nothing reads is a dead contract. */
    regionsLabel: "مناطق العمل",
    interiorLabel: "صور داخلية تصورية",
    closeProject: "إغلاق المشروع",
    whatsapp: "الانتقال إلى قسم التواصل عبر واتساب",
    sliderRole: "قائمة مشاريع أفقية",
    sliderLabel: "معرض المشاريع — مرر أفقيا لاستكشاف المشاريع",
  },

  /** authored — the old site had no skip link at all (SOVA §10.9). */
  skipToContent: "تخطى إلى المحتوى الرئيسي",

  /** authored — closes the mobile navigation sheet. */
  closeMenu: "إغلاق القائمة",

  /**
   * ⛔ `disclaimer` IS DELETED — operator, 2026-08-22. THE HISTORY BELOW IS
   * KEPT BECAUSE A DOZEN FILES POINT AT IT BY NAME («see the block on
   * `site.disclaimer`»), AND BECAUSE THE LINE IT DESCRIBES NO LONGER EXISTS
   * ANYWHERE ON THE SITE.
   *
   * It read «الصور المعروضة تصورية وليست صورًا للمشاريع المنفذة فعليًا.» and
   * rendered once, in the footer's bottom bar. The operator's design list said
   * «remove all the صور تصورية»; on 2026-08-21 that took the five per-image
   * badges, and on 2026-08-22 it took this one too, after it was flagged and
   * the instruction was repeated.
   *
   * WHAT IS LEFT. The site now makes NO VISIBLE STATEMENT that its imagery is
   * rendering rather than photography. What survives is `alt` text — every
   * render is described as a «منظور», the architectural word for one — and
   * `projectDetail.summary`, which still calls each project «مشروع سكني
   * تصوري». That second one is a claim about the PROJECT's stage, not about
   * the picture, which is why it was not swept with the rest.
   *
   * TO PUT IT BACK: one <p> in `site-footer.tsx` and one string in
   * `footer.ts`. Both are marked.
   *
   * ---------------------------------------------------------------------------
   * The original note, verbatim, for the reasoning it records:
   *
   * ONE standing disclaimer, AND NOW IT IS THE ONLY ONE.
   * SOVA §10.3 / §9 #19: the old site carries NINE separate disclaimers on a
   * single page, which tips from careful into unconfident. The rebuild cut
   * that to one standing line (footer) plus a small per-image
   * `صور تصورية` badge.
   *
   * ⛔ THE PER-IMAGE BADGE IS GONE — OPERATOR DECISION, 2026-08-21. DO NOT
   * RE-ADD IT. It was a deliberate honesty device (these renders are not
   * photographs, and the badge said so on each one), so the reason it could go
   * is worth writing down: the sentence below still ships, once, in the
   * footer, and it makes the same statement about every image on the site. The
   * claim is not lost — only the repetition is. `site.conceptBadge`,
   * `hero.conceptLabel`, `interior.noteBadge`, `projectDetail.conceptLabel`
   * and `contact.conceptLabel` were all deleted with their render sites in the
   * same pass, so nothing here is an orphan string.
   *
   * If a future change removes THIS line too, the site would be asserting
   * nothing about its imagery at all. That is the line not to cross.
   */
  disclaimer: "الصور المعروضة تصورية وليست صورا للمشاريع المنفذة فعليا.",
} as const;

export type Site = typeof site;
