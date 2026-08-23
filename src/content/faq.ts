/* =============================================================================
 * FAQ (#faq) — SOVA §5.14.
 *
 * Four questions today. SOVA §11 row 12 wants 8–10: price, instalment size,
 * delivery date, delay policy, transfer/resale rules. Every one of those
 * answers is a fact we do not have (placeholders.ts: pricing, instalmentPlan,
 * deliveryDate) — so the extra questions are NOT drafted here. Writing a
 * plausible answer to "how much does it cost" would be the single most harmful
 * thing this site could do.
 * ========================================================================== */

export const faq = {
  kicker: "الأسئلة الشائعة",
  title: {
    a: "إجابات مختصرة قبل",
    /** gold */
    b: "خطوتك الأولى.",
  },
  lead: "المعلومات هنا تعريفية، وتبقى اللوائح والعقود الرسمية هي المرجع عند الانتساب.",

  items: [
    {
      q: "من يحق له الانتساب؟",
      a: "كل مواطن سوري يستوفي شروط العمر، وعدم الاستفادة السابقة، ومنطقة العمل، والالتزام باللوائح المالية والتنظيمية.",
    },
    {
      q: "هل الأسعار والمساحات نهائية؟",
      a: "لا. القيم المعروضة في النموذج الحالي تقريبية لأغراض التصميم، وتستبدل بالبيانات المعتمدة لكل مشروع.",
    },
    {
      q: "كيف تدفع الأقساط؟",
      a: "تحدد آلية الأقساط والجداول المالية رسميا حسب المشروع والمرحلة والقرارات المعتمدة.",
    },
    {
      q: "أين تقع المشاريع؟",
      a: "تعمل الجمعية حاليا في ضاحية الفردوس والفيحاء وجمرايا والهامة في ريف دمشق الغربي.",
    },
  ],

  /**
   * ⛔ NOT RENDERED, AND NOT ANSWERED. WAVE 3.
   *
   * The five questions SOVA §11 row 12 wants added, listed here as topics with
   * the placeholder that blocks each one. They are deliberately NOT in `items`
   * and NOT in the FAQPage JSON-LD: an accordion whose answer is
   * «تُضاف الأسعار المعتمدة» is not an answer, five of them beside four real
   * ones would make the section 55% empty, and structured data carrying them
   * would put non-answers into a search result.
   *
   * TO ADD ONE: the client sends the answer, it moves into `items` above as a
   * verbatim `{ q, a }` pair, and the section and the JSON-LD both pick it up
   * with no code change — both read `faq.items`.
   *
   * Two of these (price, delivery) are already surfaced elsewhere as honest
   * gaps, in `projectDetail.pending` on every project page, so the FAQ is not
   * the only place a visitor learns they are unpublished.
   */
  pendingTopics: [
    { topic: "سعر الوحدة", blockedBy: "commercial.pricing" },
    { topic: "قيمة القسط وعدد الأقساط", blockedBy: "commercial.instalmentPlan" },
    { topic: "موعد التسليم", blockedBy: "commercial.deliveryDate" },
    { topic: "سياسة التأخير", blockedBy: "commercial.deliveryDate" },
    { topic: "نقل العضوية أو بيع الوحدة", blockedBy: null },
  ] as readonly { topic: string; blockedBy: string | null }[],
} as const;
