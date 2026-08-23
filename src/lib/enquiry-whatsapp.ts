import { contact } from "@/content/contact";
import { factHref, whatsapp } from "@/content/placeholders";
import { type EnquiryDetails, enquiryRows } from "@/lib/enquiry-summary";

/* =============================================================================
 * THE WHATSAPP FOLLOW-UP — a `wa.me` draft of an enquiry that ALREADY SENT.
 *
 * =============================================================================
 * ⛔ READ THIS BEFORE YOU CHANGE WHEN OR WHERE IT APPEARS
 * =============================================================================
 * OPERATOR, 2026-08-22: "one button ... the request that the user did send
 * should be send to both email and the whatsapp".
 *
 * ONE BUTTON CANNOT LITERALLY SEND BOTH, and the shape of this file is the
 * consequence. A website cannot send a WhatsApp message on someone's behalf.
 * `wa.me` opens the visitor's OWN WhatsApp with the text pre-typed, and THEY
 * press send — that step is the whole design of the link and it cannot be
 * skipped. (Meta's Cloud API can push a message with no visitor action, but it
 * needs a number that is NOT registered on ordinary WhatsApp, Meta Business
 * verification and approved templates — i.e. the association's phone would
 * have to stop being a normal WhatsApp. That was rejected, correctly.)
 *
 * SO THE FORM STILL HAS EXACTLY ONE BUTTON, and this is what happens after it:
 *
 *      إرسال الطلب  →  the email sends and is confirmed  →  THEN this link
 *
 * ⚠️ IT IS DELIBERATELY NOT AUTO-OPENED. Firing `window.open()` once the
 * action's promise settles is past the user gesture, so every popup blocker
 * eats it and the visitor sees nothing happen. This is a real anchor the
 * visitor taps, which is also why it cannot be blocked.
 *
 * ⚠️ AND IT IS DELIBERATELY AFTER THE RECEIPT, NOT BESIDE THE BUTTON. Two
 * choices at the moment of submitting is a decision the visitor did not ask
 * for; and on a desktop without WhatsApp Desktop, `wa.me` is a QR page — a
 * dead end that costs NOTHING here, because the enquiry already arrived by
 * email before this link was ever shown.
 *
 * NOTHING HERE SENDS, STORES OR LOGS. It builds a string. `/privacy` says the
 * form keeps nothing, and this path does not change that.
 * ========================================================================== */

/**
 * The `https://wa.me/…?text=…` href for one enquiry, or `null`.
 *
 * ⛔ `null` IS THE HONEST DEFAULT AND IT IS NOT AN ERROR PATH. The number comes
 * from `placeholders.whatsapp` through `factHref()`, which returns `null` while
 * the fact is unresolved — so if the association's number is ever withdrawn or
 * set back to `null`, this link stops rendering by itself. There is no fallback
 * number, no hard-coded digits, and nothing to remember to remove.
 *
 * ⚠️ The number that ships TODAY is the operator's test number, marked
 * `testData` on the fact. That is not a new exposure: `#contact` already
 * renders a live `wa.me` row on the same fact, and `testDataFacts()` already
 * reports it as a launch blocker. Resolve the fact once, and the contact row,
 * the footer and this button all become the association's number together.
 */
export function whatsappEnquiryHref(details: EnquiryDetails): string | null {
  const base = factHref(whatsapp);
  if (!base) return null;

  /* THE SAME FOUR ROWS THE EMAIL CARRIES, from the same builder — including
     the phone. It is redundant with WhatsApp's own sender identity for most
     people and it stays anyway: a visitor may message from a second number,
     and the number they TYPED is the one they asked to be called on. The two
     records the association receives have to agree. */
  const draft = [
    contact.form.result.whatsapp.draftTitle,
    "",
    ...enquiryRows(details).map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  /* `encodeURIComponent`, not a template hole. The name is visitor input and
     an unescaped `&` or `#` in it would truncate the draft at that character —
     and the scheme and host are fixed literals above, so there is no redirect
     to forge here either. */
  return `${base}?text=${encodeURIComponent(draft)}`;
}
