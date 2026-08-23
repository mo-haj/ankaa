/* =============================================================================
 * PRESIDENT (#president) — SOVA §5.13.
 *
 * The displacement sentence in `quote` is, per SOVA §10.5, the emotional core
 * of the entire site — and the old site renders it at 20% opacity until a
 * scroll handler fills it in word by word. If the JS fails, if the visitor
 * lands mid-page, if they scroll fast, or if prefers-reduced-motion is on, the
 * most powerful sentence on the site is invisible grey text.
 *
 * RULE FOR WAVE 2 AND FOR NEON: this quote's BASE STATE IS FULLY LEGIBLE.
 * Any reveal animates from legible to legible. No opacity floor below 1 in the
 * resting state, ever.
 *
 * The chairman's name is missing (SOVA §9 gap 2) — it comes from
 * placeholders.ts, where the client's own wording is the fallback.
 * ========================================================================== */

export const president = {
  kicker: "كلمة رئيس مجلس الإدارة",
  portraitCaption: "رئيس مجلس الإدارة",

  /** Naskh, formal opening. */
  bismillah: "«بسم الله الرحمن الرحيم، والصلاة والسلام على سيدنا محمد»",

  quote:
    "نسعى في جمعية العنقاء السكنية إلى تحقيق الغاية الجوهرية من التعاون السكني، وهي تأمين المسكن لكل مواطن سوري بسعر مناسب، وبمواصفات متناسبة مع السعر، وبالأقساط؛ بما يتيح فرصة حقيقية للسوريين الذين هجروا قسرا وفقدوا منازلهم لامتلاك منزل في وطنهم الأم.",

  more: {
    summary: "قراءة الكلمة كاملة",
    body: "كما نعمل على المساهمة في حل مشكلة السكن في سوريا، ودعم التوازن في السوق المحلية، ولا سيما في دمشق وريفها، وفق مبدأ تعاوني منظم وتحت إشراف الجهات المختصة. والله ولي التوفيق.",
  },

  signature: {
    role: "رئيس مجلس الإدارة",
    /** Name comes from placeholders.chairmanName — never hard-code it here. */
  },
} as const;
