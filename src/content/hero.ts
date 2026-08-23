/* =============================================================================
 * HERO — SOVA §5.4, plus §5.3 (the intro overlay, fused in per §17 Direction A).
 *
 * `من المخطط` / `إلى البيت` is, per SOVA, the strongest line of copy on the
 * whole site and it was buried in a three-second overlay that replayed on every
 * page load. Direction A promotes it into the hero itself.
 *
 * CUT from the old hero (SOVA §11 row 1): the region picker, the ٦ stamp card
 * and the decorative arc. Their strings are preserved at the bottom of this
 * file — client copy is never deleted just because a UI element was — but
 * nothing renders them.
 * ========================================================================== */

export const hero = {
  /** SOVA §5.3 — the blueprint→home pair. Now the hero's own kicker line. */
  blueprint: {
    from: "من المخطط",
    to: "إلى البيت",
  },

  eyebrow: "جمعية سكنية مرخصة بإشراف رسمي",

  title: {
    line1: "مسكن مناسب.",
    /** Rendered in <Accent> — the section's one gold element. */
    line2: "بثقة تبنى خطوة خطوة.",
  },

  lead: "نطور مشاريع سكنية تعاونية في ريف دمشق الغربي، تجمع بين الكلفة المدروسة والمواصفات الجيدة وآلية تقسيط واضحة.",

  /**
   * EXACTLY ONE primary CTA (SOVA §17 Direction A). The old hero had two; the
   * second (`ابدأ طلب الانتساب`) is preserved under `cut` and belongs to the
   * membership section, where it already exists as `membership.cta`.
   */
  cta: {
    label: "استكشف المشاريع",
    href: "/#projects",
  },

  /* `conceptLabel` (صور تصورية) was the micro-label at the bottom
     inline-end of the hero. Removed 2026-08-21 by operator decision along with
     every other per-image concept badge — see the block on `site.disclaimer`
     for why that is not a loss of honesty. Do not re-add it here. */

  /** Scroll cue, bottom inline-start. */
  scrollCue: "مرر لاكتشاف القصة",

  /** authored — the hero render is decorative; the label above carries meaning. */
  imageAlt: "",

  /**
   * Preserved but NOT rendered — the elements they belonged to were cut in
   * SOVA §11 row 1 and §10.7. Kept verbatim so the copy is never lost.
   */
  cut: {
    ctaSecondary: "ابدأ طلب الانتساب",
    pickerLabel: "أين تبحث عن مسكن؟",
    pickerSubmit: "عرض النتائج",
    pickerAll: "كل المناطق",
    /* Eastern, and staying Eastern: verbatim client copy from a CUT element,
       preserved and not rendered. The 2026-08-21 Western-digit sweep covers
       what the site DISPLAYS; nothing displays this. */
    stampCount: "٦",
    stampLabel: "مشاريع قائمة",
  },
} as const;

export type Hero = typeof hero;
