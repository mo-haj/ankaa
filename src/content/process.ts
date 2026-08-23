/* =============================================================================
 * HOW IT WORKS (#process) — SOVA §11 row 8. A NEW section, and SOVA calls it
 * "the single highest-conversion addition".
 *
 * WHERE THE FOUR STAGES COME FROM
 * `الدراسة → الترخيص → التنفيذ → التسليم` is not new copy. It is
 * `projectDetail.steps` (SOVA §5.10, `modal.steps`) — a process timeline the
 * client already wrote, which the old site rendered ONLY inside a project
 * modal, i.e. behind a click, below the fold, on a dialog most visitors never
 * opened. §11 row 8 promotes it to a section. The four strings stay in
 * `projects.ts` where the client wrote them and are READ from there, so there
 * is exactly one place a stage name can be wrong.
 *
 * ⛔ WHAT IS DELIBERATELY NOT HERE — READ BEFORE ADDING A FIFTH STEP.
 * SOVA also asks for the MEMBER'S journey: apply → approve → pay → allocate →
 * contract → deliver. The client has never published it. What exists is five
 * membership CONDITIONS (§5.12) and one CTA («ابدأ طلبًا مبدئيًا»), and a
 * six-step admission procedure assembled out of those would be us drafting a
 * regulated cooperative's admission rules and publishing them under its name.
 * People join housing cooperatives on the strength of exactly this list.
 *
 * So the section ships the four stages the client owns, and names the missing
 * procedure ONCE, honestly, through `placeholders.memberJourney`. When the
 * association sends the real steps, they land in that one slot and this
 * section becomes the strongest conversion surface on the page.
 *
 * Every string below is AUTHORED — the client wrote no framing for a section
 * that did not exist. Marked per the content-layer convention.
 *
 * Digits: `01`–`04` in Western, matching the client's own `01`–`05` in
 * `membership.conditions` and `01`–`06` in `projects.items` (SOVA §16.7 leaves
 * this per-string; the neighbouring sections decide it).
 * ========================================================================== */

/**
 * Named `howItWorks`, not `process` — a module-scope binding called `process`
 * shadows Node's global in every file that imports it, and this one is imported
 * by a Server Component that may well want `process.env` next week.
 */
export const howItWorks = {
  /** authored */
  kicker: "كيف يسير العمل",

  /** authored */
  title: {
    a: "من الدراسة",
    /** gold — the section's one gold element is the track, not this. */
    b: "إلى التسليم.",
  },

  /** authored */
  lead: "أربع مراحل يمر بها كل مشروع من مشاريع الجمعية، من الدراسة الأولى حتى تسليم الوحدات.",

  /** authored — aria-label for the stage list. */
  trackLabel: "مراحل المشروع",

  /** authored — heading over the four-stage track. */
  trackTitle: "مسار المشروع",

  /**
   * authored — the numbering. The stage NAMES are not here on purpose: they
   * are the client's, in `projectDetail.steps`.
   */
  stageNumbers: ["1", "2", "3", "4"] as readonly string[],

  /** authored — points at the per-project stage the client does publish. */
  trackNote: "المرحلة الحالية لكل مشروع مذكورة في صفحته.",

  /** authored — the honest slot for the missing admission procedure. */
  member: {
    title: "مسار الانتساب",
    note: "ترتيب خطوات الانتساب والوثائق المطلوبة في كل خطوة تنشر هنا بعد اعتمادها. شروط الانتساب المعلنة متاحة الآن أدناه.",
  },

  /** authored */
  cta: {
    label: "شروط الانتساب",
    href: "/#membership",
  },
} as const;

export type HowItWorks = typeof howItWorks;
