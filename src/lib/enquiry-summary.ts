import { SYRIA_DIAL_CODE, toE164Ltr } from "@/content/dial-codes";
import { regions } from "@/content/regions";

/* =============================================================================
 * ENQUIRY SUMMARY — the four labelled rows of one enquiry, in one place.
 *
 * ⛔ WHY THIS IS ITS OWN MODULE AND NOT A PRIVATE FUNCTION IN THE TRANSPORT.
 *
 * As of 2026-08-22 the same enquiry is written out TWICE: once as the email
 * `deliverEnquiry()` sends, and once as the WhatsApp draft the visitor may
 * choose to send themselves after it succeeds (`enquiry-whatsapp.ts`). Those
 * two are not "similar messages" — they are the SAME enquiry arriving in two
 * inboxes, and the association will read them side by side.
 *
 * If the rows were duplicated, the first change to one of them — a relabelled
 * field, a fifth question, a different phone format — would silently make the
 * two records disagree about what the visitor actually said. So there is one
 * builder, both callers render it, and drift is not possible.
 *
 * WHAT THIS MODULE IS NOT: it does not send anything, does not read the
 * environment, and does not touch a provider. It is a pure function over
 * validated data, which is also why it is safe for the Server Action to call
 * directly on the success path.
 * ========================================================================== */

/**
 * The validated shape both writers need.
 *
 * `EnquiryPayload` in `enquiry-transport.ts` satisfies this structurally (it
 * is this plus the idempotency key), so nothing has to be adapted at the call
 * site. Deliberately NOT an import from there: that module is `server-only`
 * and this one has no reason to be.
 */
export interface EnquiryDetails {
  readonly name: string;
  /** Exactly nine digits, normalised, trunk `0` already stripped. */
  readonly phone: string;
  /** A region SLUG. Rendered as its Arabic name below. */
  readonly region: string;
  readonly type: string;
}

/** Slug → the region's Arabic name, so a message reads the way the form did. */
function regionName(slug: string): string {
  return regions.find((region) => region.slug === slug)?.name ?? slug;
}

/**
 * One enquiry as `[label, value]` pairs, in the order the form asks them.
 *
 * ⛔ E.164 IN THE MESSAGE, NATIONAL DIGITS IN THE FORM. The association pastes
 * this number into a dialler or into WhatsApp, and `934826796` on its own is
 * not a number either of those can call. `toE164Ltr` is the ONLY place the
 * code and the number are joined, so every channel shows exactly one spelling
 * of every enquiry — and the LRMs keep the `+` at the front of it in an RTL
 * paragraph. See the block on `toE164Ltr` in `src/content/dial-codes.ts`.
 */
export function enquiryRows(
  details: EnquiryDetails,
): ReadonlyArray<readonly [string, string]> {
  return [
    ["الاسم", details.name],
    ["رقم التواصل", toE164Ltr(SYRIA_DIAL_CODE, details.phone)],
    ["المنطقة", regionName(details.region)],
    ["نوع الاستفسار", details.type],
  ];
}
