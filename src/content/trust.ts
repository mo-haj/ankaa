/* =============================================================================
 * TRUST STRIP (#trust) — SOVA §11 row 2.
 *
 * One dark band directly under the hero, merging three things the old site had
 * scattered across the page: the stats bar, the values marquee, and the
 * official-supervision block that sat at position 10 (SOVA §10.4 — "the trust
 * story is buried"). For a cooperative competing against private developers,
 * official supervision IS the product.
 *
 * Two deliberate changes, both from SOVA:
 *   · `١٠٠٪ مبدأ تعاوني` is dropped (§11 row 2). It is a claim about a
 *     principle dressed up as a measurement, and next to three countable facts
 *     it reads as filler.
 *   · The credential carries the LICENCE NUMBER. It does not exist yet, so it
 *     renders the honest placeholder from `placeholders.ts`. It does not carry
 *     the ministry emblem — see the legal blocker in that same file.
 *
 * Stats copy: SOVA §5.6. Supervision copy: SOVA §5.15.
 * ========================================================================== */

export interface Stat {
  /** Machine value. NEON reads this to animate the counter. */
  readonly value: number;
  /**
   * The display string. WESTERN DIGITS (2026-08-21, operator decision — every
   * number the site RENDERS is Western now).
   *
   * These were `٦` / `٤٨٠` / `٤`. Changing them is not an edit to client copy:
   * the old site's own source writes the machine values in Western digits
   * (`<strong data-count="6">`, `data-count="480"`, `data-count="4"`) and the
   * Eastern glyphs were produced at runtime by its counter script. So the
   * client wrote `6`; the old site's JS is what wrote `٦`.
   *
   * ⛔ MUST MATCH the `numerals` prop <Counter> is given in `trust-strip.tsx`.
   * That prop is what `Intl.NumberFormat` counts up in, and this string is
   * what the counter lands on at the end — mismatch them and the number
   * visibly changes alphabet on the last frame.
   */
  readonly display: string;
  /** Rendered before the digits, e.g. "+". Empty for none. */
  readonly prefix: string;
  readonly label: string;
}

export const trust = {
  /** SOVA §5.6 — minus `١٠٠٪ مبدأ تعاوني`, per §11 row 2. */
  stats: [
    { value: 6, display: "6", prefix: "", label: "مشاريع سكنية قائمة" },
    { value: 480, display: "480", prefix: "+", label: "وحدة ضمن الخطط الحالية" },
    { value: 4, display: "4", prefix: "", label: "مناطق عمل" },
  ] as readonly Stat[],

  /**
   * SOVA §5.6 — the values marquee, verbatim and in order. Pure CSS; the old
   * site duplicated the list twice in the DOM by hand, the Marquee component
   * repeats it for us.
   */
  marquee: [
    "كلفة مدروسة",
    "مواصفات جيدة",
    "أقساط واضحة",
    "إشراف رسمي",
    "ثقة وشفافية",
  ] as readonly string[],

  /** SOVA §5.15 — the official-supervision copy, demoted into this strip. */
  credential: {
    kicker: "الإشراف الرسمي",
    title: {
      a: "مبدأ تعاوني ضمن",
      /** gold */
      b: "الإطار المنظم للإسكان.",
    },
    lead: "تعمل الجمعية وفق اللوائح والسياسات المنظمة لقطاع التعاون السكني وتحت إشراف الجهة المختصة، بما يحفظ وضوح الإجراءات وحقوق الأعضاء.",
    notes: [
      { n: "1", text: "جمعية سكنية مرخصة" },
      { n: "2", text: "لوائح مالية وتنظيمية" },
      { n: "3", text: "إشراف الجهة المختصة" },
    ],
    /** authored — field labels for the licence line. */
    licenceNumberLabel: "رقم الترخيص",
    licenceAuthorityLabel: "الجهة المرخصة",
  },

  /**
   * Preserved, NOT rendered. The emblem these belong to is a legal blocker
   * (SOVA §9 #8) — see `ministryEmblem` in placeholders.ts. The caption's own
   * wording is the reason: it hedges about permission.
   */
  cut: {
    ministryImageAlt: "وزارة الأشغال العامة والإسكان",
    ministryCaption: "شعار الجهة المشرفة كما ورد في المواد المقدمة من الجمعية.",
    cooperativePrincipleStat: { value: "100٪", label: "مبدأ تعاوني" },
  },
} as const;

export type Trust = typeof trust;
