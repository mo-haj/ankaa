/* =============================================================================
 * REGIONS — SOVA §5.5, and §5.8 (the standalone regions section).
 *
 * The four operating areas are used in four places on the old site (hero
 * picker, regions section, projects filter, contact form), so they live here
 * once. SOVA §11 row 4 CUTS the standalone regions section and folds its
 * filter into the projects header — its framing copy is preserved under `cut`.
 *
 * Counts are the client's own labels, verbatim, in Eastern digits and Arabic
 * duals (`مشروعان` = "two projects"). They are labels, not arithmetic — do not
 * regenerate them from the project list.
 *
 * ⛔ 2026-08-22 — AND THEN IT DID NOT. `allRegions.count` READS `6 مشاريع`.
 * The operator restated "all the numbers should be in English" with this chip
 * and the two الفردوس project names as the named exceptions still
 * outstanding, so both were converted. `projects.ts` carries the same note.
 * The 2026-08-21 reasoning is kept verbatim below because it is right about
 * the RULE — it was overruled on this instance, not repealed.
 *
 * ⚠️ 2026-08-21 — THE WESTERN-DIGIT SWEEP DELIBERATELY SKIPPED `allRegions`.
 * Every number the site renders was normalised to `0123` that day, with one
 * standing exception: a digit inside a CLIENT-SUPPLIED VERBATIM string keeps
 * whatever the client wrote. `٦ مشاريع` is one of those, and it was verified
 * against the live site before it was left alone — `index.html:173` reads
 * `<button data-region-filter="all"><b>الكل</b><span>٦ مشاريع</span></button>`,
 * hand-typed, not generated. (Contrast the trust-strip stats, whose Eastern
 * glyphs the old site's counter script produced at runtime from
 * `data-count="6"` — those WERE normalised, because the client wrote `6`.)
 *
 * The consequence is visible and is flagged to the operator, not hidden: this
 * one chip renders `٦` while every other digit on the page renders Western. If
 * the operator decides the client's label may be re-typed, this is the only
 * line that has to change.
 * ========================================================================== */

export interface Region {
  /** Stable slug for `?region=` search params. Latin, URL-safe. */
  readonly slug: string;
  readonly name: string;
  /** The client's own count label for the filter chip. */
  readonly count: string;
}

/** SOVA §5.5 — shared list, in the client's order. */
export const regions: readonly Region[] = [
  { slug: "firdous", name: "ضاحية الفردوس", count: "مشروعان" },
  { slug: "fayhaa", name: "الفيحاء", count: "مشروعان" },
  { slug: "jamraya", name: "جمرايا", count: "مشروع واحد" },
  { slug: "hama", name: "الهامة", count: "مشروع واحد" },
];

/** The "all" chip that precedes them. */
export const allRegions = { label: "الكل", count: "6 مشاريع" } as const;

/**
 * SOVA §5.8 — preserved, NOT rendered. The section it framed was a filter with
 * an H2 on top; §11 row 4 folds the filter into the projects header instead.
 */
export const cutRegionsSection = {
  kicker: "مناطق العمل",
  title: { a: "أربع مناطق،", b: "وخطة واحدة مترابطة." },
  lead: "اختر المنطقة لتصفية المشاريع، وتتبع الخط المتحرك لمعرفة توزيع العمل.",
} as const;
