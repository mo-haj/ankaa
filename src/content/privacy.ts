/* =============================================================================
 * PRIVACY (/privacy) — SOVA §9 #17.
 *
 * ⛔ NO FABRICATED LEGAL TEXT. NOT ONE CLAUSE.
 * A privacy policy is a statement of what an organisation does with personal
 * data, made by that organisation. Writing a plausible one on the association's
 * behalf would mean inventing retention periods, lawful bases, sharing
 * arrangements and a data controller — every one of them a fact, several of
 * them legally operative, none of them ours to state. A generated policy is
 * worse than no policy: it looks like a commitment and binds nobody.
 *
 * So this page says three true things and stops:
 *   1. the association has not supplied a policy yet, and we will not write one
 *   2. exactly which fields the enquiry form collects (that is our own code,
 *      so we can state it precisely)
 *   3. that nothing is delivered or stored today, because the form has no
 *      destination (placeholders.contactDelivery) and the action persists
 *      nothing — verify in src/app/actions/contact.ts
 *
 * Point 3 is a promise about behaviour. If anyone implements
 * `deliverEnquiry()` or adds logging, storage or analytics, THIS COPY MUST
 * CHANGE IN THE SAME COMMIT.
 *
 * Every string is AUTHORED.
 * ========================================================================== */

export const privacy = {
  /** authored */
  kicker: "الوثائق",
  title: "سياسة الخصوصية",
  lead: "هذه الصفحة مخصصة لسياسة الخصوصية الرسمية للجمعية. لم تعتمد بعد.",

  status: {
    title: "الحالة الحالية",
    body: "لم تصلنا سياسة خصوصية معتمدة من الجمعية، ولن يكتب نص قانوني نيابة عنها. تنشر السياسة هنا فور استلامها.",
  },

  collected: {
    title: "ما يجمعه نموذج التواصل",
    items: [
      "الاسم الكامل",
      "رقم الهاتف",
      "المنطقة المطلوبة",
      "نوع الاستفسار",
    ] as readonly string[],
    note: "في النسخة الحالية لا يوجد عنوان استقبال معتمد للطلبات، ولا تحفظ البيانات المدخلة ولا ترسل إلى أي جهة.",
  },

  documentLabel: "ملف السياسة المعتمد",

  back: {
    label: "العودة إلى الصفحة الرئيسية",
    href: "/",
  },
} as const;

export type Privacy = typeof privacy;
