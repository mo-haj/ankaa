import "server-only";

import { contactDelivery, isResolved } from "@/content/placeholders";
import { enquiryRows } from "@/lib/enquiry-summary";

/* =============================================================================
 * ENQUIRY TRANSPORT — the one seam between "the form works" and "the message
 * arrives". SOVA §9 #6.
 *
 * =============================================================================
 * TO THE DEVELOPER WHO WIRES THIS UP — THIS FILE AND ONE PLACEHOLDER
 * =============================================================================
 * The contact form is finished: a real Server Action, zod validation, a
 * honeypot, per-field Arabic errors, `useActionState` + `useFormStatus`. What
 * does not exist is anywhere to deliver a message. The association has no
 * published inbox (`placeholders.email`) and no mail service is configured.
 *
 * There are exactly two steps, and BOTH are required:
 *
 *   1. Fill in `contactDelivery.value` in `src/content/placeholders.ts` with
 *      the destination address the association gives you, in writing.
 *
 *   2. Implement `deliverEnquiry()` below. One provider, one call. Whatever
 *      you choose, it must READ ITS CREDENTIALS FROM THE ENVIRONMENT and must
 *      never appear in this repository:
 *
 *        Resend   `npm i resend`, RESEND_API_KEY, then
 *                 `await resend.emails.send({ from, to: contactDelivery.value, subject, text })`
 *        SMTP     `npm i nodemailer`, SMTP_HOST / SMTP_PORT / SMTP_USER /
 *                 SMTP_PASSWORD, then `transporter.sendMail(...)`
 *        Other    anything that returns a hard success/failure. A webhook into
 *                 the association's CRM is fine. A `fetch()` you do not await
 *                 is not.
 *
 * =============================================================================
 * ⛔ THE RULE THIS FILE ENFORCES
 * =============================================================================
 * `ok: true` MEANS A MESSAGE LEFT THE SERVER AND THE PROVIDER ACCEPTED IT.
 * Nothing else may return it. Not a stub, not a `console.log`, not a "we will
 * hook this up on Monday", not a `Promise.resolve(true)` to make a demo look
 * finished. The form's success copy tells a real person that a real
 * cooperative received their name and phone number; if that is not true, the
 * site has lied to someone who is trying to buy a home.
 *
 * While `contactDelivery` is unresolved this returns `not-configured`, the
 * action returns the honest "nothing was sent" state, and the visitor is told
 * — in the client's own words — that the form does not deliver yet.
 *
 * NOTHING IS PERSISTED OR LOGGED HERE. `/privacy` states that as a fact about
 * this code. If you add storage, logging or analytics to this path, update
 * `src/content/privacy.ts` in the same commit.
 * ========================================================================== */

export interface EnquiryPayload {
  readonly name: string;
  /**
   * The NATIONAL number: exactly nine digits, already normalised to Western
   * numerals with the trunk `0` removed. The `+963` is added below, not here.
   */
  readonly phone: string;
  readonly region: string;
  readonly type: string;
  /**
   * ⛔ IDEMPOTENCY KEY — READ THIS BEFORE YOU WIRE UP A PROVIDER.
   *
   * One value per submit ATTEMPT, generated in the browser and rotated only
   * after a response settles. Two requests carrying the SAME key are the same
   * enquiry arriving twice; two requests carrying different keys are two
   * people, or one person enquiring twice on purpose.
   *
   * VIPER measured four POSTs from four fast clicks — `disabled={pending}` is
   * a render behind the browser. `<ContactForm>` now blocks that synchronously,
   * which handles the clicks. It cannot handle a retried request, a flaky
   * connection, a refresh-and-resubmit, or a second tab. THOSE are yours:
   *
   *   Resend   pass it as the `Idempotency-Key` header
   *   SMTP     use it as the `Message-ID`, or keep a short-lived seen-set
   *   Webhook  send it and let the CRM upsert on it
   *
   * It may be an empty string — a client with no JS never rotates it and a
   * hostile client can omit it entirely. An absent key means "cannot dedupe
   * this one", never "reject this one": losing an enquiry is worse than
   * delivering it twice.
   */
  readonly key: string;
}

export type DeliveryResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "not-configured" | "failed" };

/* -----------------------------------------------------------------------------
 * THE MESSAGE ITSELF
 *
 * ⛔ EVERY VISITOR-SUPPLIED VALUE GOES IN THE BODY AND NOWHERE ELSE.
 *
 * `from`, `to`, `subject` and `reply_to` are HEADERS of an email, and a header
 * ends at a newline. A `name` containing CR-LF followed by `Bcc: someone@else`,
 * placed in a subject line, is the classic header injection: the provider
 * parses the second line as a new header and the association's contact form
 * becomes an open relay.
 *
 * What makes that impossible here is structural, not a filter — nothing a
 * visitor typed is ever concatenated into a header field:
 *
 *   from      a constant, read from the environment
 *   to        `contactDelivery.value`, from our own content file
 *   subject   the constant below. It does NOT carry the name or the region.
 *   reply_to  NOT SET. The form collects a phone number and no email address,
 *             so there is nothing to reply to — and putting an unvalidated
 *             string there would be the same hole in a different field.
 *
 * The zod schema already caps `name` at 80 and `phone` at 24 and trims both,
 * so a payload reaching here is short and single-line. That is the second
 * layer, not the first.
 * -------------------------------------------------------------------------- */

/** Constant. No interpolation, ever — see the block above. */
const SUBJECT = "طلب جديد من موقع جمعية العنقاء السكنية";

/**
 * Resend's shared sandbox sender.
 *
 * ⚠️ IT CAN ONLY DELIVER TO THE ADDRESS THAT OWNS THE API KEY. That is
 * Resend's rule, not ours, and it is exactly what makes it right for testing:
 * the destination today is the operator's own inbox, so the round trip is real
 * and provable. It CANNOT reach the association. The day a real inbox is
 * configured, `ENQUIRY_FROM` has to become an address on a domain verified in
 * Resend, or every send is rejected with a 403.
 */
const SANDBOX_FROM = "onboarding@resend.dev";

/* ⛔ THE ROWS, THE REGION LOOKUP AND THE BIDI FIX ALL MOVED OUT — 2026-08-22.
   They now live in `@/lib/enquiry-summary` and `toE164Ltr` in
   `@/content/dial-codes`, because this is no longer the only thing that writes
   an enquiry out: the success state also composes a WhatsApp draft of the SAME
   enquiry (`@/lib/enquiry-whatsapp`). Two copies of these four rows would
   drift the first time a field is relabelled, and the association would be
   reading two records that disagree. Read the header of `enquiry-summary.ts`
   before changing what an enquiry looks like — it changes BOTH channels. */

function plainBody(payload: EnquiryPayload): string {
  return enquiryRows(payload)
    .map(([label, value]) => label + ": " + value)
    .join("\n");
}

/**
 * ⛔ ESCAPED, AND NOT BECAUSE OF THE INBOX.
 *
 * A mail client is not a browser and modern ones strip scripts — but this HTML
 * is also what lands in Resend's dashboard, in a webhook payload, and in
 * whatever the association forwards it to. A `<` from a visitor must not become
 * a tag anywhere downstream. Five characters, once, at the boundary.
 *
 * The `dir="rtl"` wrapper is not decoration either: without it a mail client
 * lays the Arabic labels out left-to-right and the Latin phone number lands at
 * the wrong end of its line.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlBody(payload: EnquiryPayload): string {
  const body = enquiryRows(payload)
    .map(
      ([label, value]) =>
        '<tr><td style="padding:4px 12px 4px 0;color:#667">' +
        escapeHtml(label) +
        /* `dir="auto"` on the VALUE cell, as the second layer under the LRMs
           above. A name is Arabic and must stay RTL; the phone number is a
           Latin run and must not — and `auto` resolves each one from its own
           first strong character instead of forcing either. Gmail keeps `dir`
           on a <td>; it is the tags around it that get stripped. */
        '</td><td dir="auto" style="padding:4px 0;font-weight:600">' +
        escapeHtml(value) +
        "</td></tr>",
    )
    .join("");
  return (
    '<div dir="rtl" style="font-family:system-ui,sans-serif;font-size:15px">' +
    "<table>" +
    body +
    "</table></div>"
  );
}

/**
 * Sends one enquiry to the association. Returns `ok: false` — never throws for
 * an expected failure, so the action can render an honest state rather than an
 * error page.
 */
export async function deliverEnquiry(
  payload: EnquiryPayload,
): Promise<DeliveryResult> {
  if (!isResolved(contactDelivery)) {
    return { ok: false, reason: "not-configured" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  /* ⛔ A MISSING KEY IS `not-configured`, NOT `failed`. They read the same on
     screen today, but they are different facts: "nobody has set this up" versus
     "it is set up and the send did not work". Collapsing them is how a broken
     deploy gets mistaken for an unfinished one. */
  if (!apiKey) return { ok: false, reason: "not-configured" };

  const to = contactDelivery.value;
  const from = process.env.ENQUIRY_FROM ?? SANDBOX_FROM;

  try {
    /* Dynamic import: the SDK is only reachable from this one function, so it
       stays out of every module graph that does not call it. */
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send(
      {
        from,
        to,
        subject: SUBJECT,
        text: plainBody(payload),
        html: htmlBody(payload),
      },
      /* The browser-generated key, handed to Resend as its own dedupe token —
         step 3 of the contract on `EnquiryPayload` above. Resend wants a
         meaningful length, and an absent or stubby key must never cost a
         visitor their enquiry, so a short one is simply not passed. */
      payload.key.length >= 8 ? { idempotencyKey: payload.key } : undefined,
    );

    /* ⛔ THE SDK RETURNS ERRORS, IT DOES NOT ALWAYS THROW. `{ data, error }` —
       a rejected send RESOLVES, with `error` set and `data` null. Reading only
       the happy path here is exactly how `ok: true` starts meaning "the call
       did not crash" instead of "the provider accepted the message", which is
       the one thing the block at the top of this file forbids. */
    if (error) {
      console.error(
        "[ankaa] enquiry delivery refused:",
        error.name,
        error.message,
      );
      return { ok: false, reason: "failed" };
    }

    return { ok: true };
  } catch (cause) {
    /* Network down, DNS, an SDK change, anything. The visitor gets the honest
       "not sent" state; the server log gets the reason. NOTHING FROM THE
       PAYLOAD IS LOGGED — `src/content/privacy.ts` states as a fact about this
       file that what a visitor types is not kept. */
    console.error("[ankaa] enquiry transport threw:", cause);
    return { ok: false, reason: "failed" };
  }
}
