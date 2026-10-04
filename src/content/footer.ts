/* =============================================================================
 * FOOTER — SOVA §5.17, expanded per §11 row 14.
 *
 * The old footer is a brand line, five links and a copyright. SOVA row 14 wants
 * it carrying the licence number, the address, the phone, the email, document
 * downloads and a privacy link — i.e. the six facts that make a housing
 * cooperative look like an institution rather than a landing page.
 *
 * Every one of those six is missing today, so every one renders through
 * placeholders.ts as an honest Arabic gap. That is the point: the footer's
 * shape is finished, and the day the client sends the details the shape fills
 * in without a single component changing.
 *
 * Column headings are authored (the old site had no columns to head).
 * ========================================================================== */

export const footer = {
  brand: "جمعية البنيان السكنية",
  tagline: "كلفة مدروسة، مواصفات جيدة.",

  /** authored — column headings. */
  headings: {
    nav: "تصفح",
    contact: "التواصل",
    documents: "الوثائق",
    licence: "الترخيص",
  },

  /** authored — labels for the contact rows. */
  labels: {
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    hours: "أوقات الدوام",
  },

  /** `{year}` is substituted at render time from the build's current year. */
  copyright: "© {year} جمعية البنيان السكنية. جميع الحقوق محفوظة.",

  disclaimer: "الصور المعروضة تصورية وليست صورا للمشاريع المنفذة فعليا.",
} as const;

/** Fills the `{year}` token. Keep Western digits: it is a date (SOVA §16.7). */
export function copyrightLine(year: number): string {
  return footer.copyright.replace("{year}", String(year));
}
