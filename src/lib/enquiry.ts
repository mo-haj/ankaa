/* =============================================================================
 * ENQUIRY — the shape of the contact form's result, shared by both sides.
 *
 * WHY THIS FILE EXISTS AND NOT JUST THE ACTION
 * A `"use server"` module may export ONLY async functions. Everything else in
 * it — a type, a constant, an initial state — is a build error the moment a
 * client component imports it (`The module has no exports at all`). So the
 * action file exports exactly one thing, `submitEnquiry`, and the contract it
 * speaks lives here.
 *
 * It also keeps the zod schema OUT of the client bundle: validation is a
 * server concern and the browser never needs to know the rules, only the
 * answer. Nothing in this file imports zod.
 * ========================================================================== */

/** The four fields the client's own form has (SOVA §5.16). No more. */
export type EnquiryField =
  | "name"
  /**
   * The NATIONAL number, digits only — no `+`, no country code, no spaces.
   * The `+963` is a fixed affix drawn beside the input and added by the server;
   * it is deliberately NOT a submitted field. See `src/content/dial-codes.ts`.
   */
  | "phone"
  | "region"
  | "type";

export interface EnquiryState {
  /**
   * idle         — nothing submitted yet
   * invalid      — validation failed; `errors` names the fields
   * rateLimited  — valid, but this client has sent too many. NOT DELIVERED,
   *                and deliberately its own state rather than a flavour of
   *                `notConnected`: the visitor did nothing wrong and the form
   *                is not broken, so the copy has to say "try again shortly"
   *                and not "there is nowhere to send this".
   * notConnected — valid, but there is nowhere to deliver it, or the provider
   *                refused it. THE MESSAGE WAS NOT SENT, AND THE COPY SAYS SO.
   * sent         — a provider accepted the message.
   *
   * ⛔ `sent` IS RETURNED ONLY WHEN `deliverEnquiry()` REPORTS THAT A PROVIDER
   * ACCEPTED THE MESSAGE. As of 2026-08-22 that transport is implemented
   * (Resend), so this state is now reachable — which makes the rule stricter,
   * not looser. Read the header of `src/lib/enquiry-transport.ts` before
   * changing anything here: `ok: true` means an email left the server.
   */
  readonly status: "idle" | "invalid" | "rateLimited" | "notConnected" | "sent";
  readonly message?: string;
  readonly errors?: Partial<Record<EnquiryField, string>>;
  /** Echoed back so the fields survive a no-JS round trip. Never the honeypot. */
  readonly values?: Partial<Record<EnquiryField, string>>;
  /**
   * ⛔ SET ON `sent` AND ON NOTHING ELSE. A `wa.me` link carrying this same
   * enquiry as a pre-typed draft, offered as a FOLLOW-UP once the email has
   * actually been accepted — see `src/lib/enquiry-whatsapp.ts` for why it is
   * after the receipt rather than a second button beside the first.
   *
   * ⚠️ IT IS NOT A SECOND DELIVERY AND MUST NEVER BE PRESENTED AS ONE. Nothing
   * is sent when this is built; it is a string the VISITOR may choose to send
   * from their own WhatsApp. The receipt above it is true because the email
   * left the server, not because of anything here.
   *
   * `undefined` whenever the association's WhatsApp number is unresolved, so
   * the button disappears with the fact rather than becoming a dead link.
   */
  readonly whatsappHref?: string;
}

export const initialEnquiryState: EnquiryState = { status: "idle" };

/**
 * The honeypot's field name. Shared so the input and the action cannot drift
 * apart — a renamed honeypot that the action stops reading is a spam filter
 * that silently does nothing.
 */
export const HONEYPOT_FIELD = "association-website";

/**
 * The idempotency key's field name, shared for the same reason as the honeypot.
 *
 * ⛔ ONE VALUE PER SET OF ANSWERS, NOT PER SUBMIT. `<ContactForm>` rotates it
 * when the form's VALUES change and at no other time, so pressing submit again
 * without editing anything re-sends the key the server already saw, and a
 * genuinely different enquiry carries a new one. Rotating it per response is
 * the obvious-looking mistake and it is exactly wrong: it hands every duplicate
 * a fresh identity at the one layer that could still have caught it.
 *
 * The client blocks repeats inside a short cooldown; this is what lets the
 * TRANSPORT catch the rest — a retried request, a flaky connection, a second
 * tab. See the dedupe note in `src/lib/enquiry-transport.ts`.
 */
export const ENQUIRY_KEY_FIELD = "enquiry-key";
