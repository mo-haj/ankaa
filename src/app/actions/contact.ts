"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { contact } from "@/content/contact";
import {
  SYRIA_NATIONAL_DIGITS,
  normaliseDigits,
  stripTrunk,
} from "@/content/dial-codes";
import { regions } from "@/content/regions";
import {
  ENQUIRY_KEY_FIELD,
  type EnquiryField,
  type EnquiryState,
  HONEYPOT_FIELD,
} from "@/lib/enquiry";
import { deliverEnquiry } from "@/lib/enquiry-transport";
import { whatsappEnquiryHref } from "@/lib/enquiry-whatsapp";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/* =============================================================================
 * CONTACT — the Server Action. SOVA §9 #6, §11 row 13.
 *
 * WHAT IT REPLACES
 * The live site's form is `onsubmit="return false"` on a `<button disabled>`
 * whose LABEL is an internal to-do — «إرسال الطلب بعد إضافة بيانات التواصل»
 * ("send the request after the contact details are added"). It sends nothing
 * and it says so in the one place a visitor is meant to click.
 *
 * WHAT THIS IS
 * A real action: honeypot → zod → per-field Arabic errors → transport. It runs
 * on the server, it works with JavaScript disabled (a plain <form action={…}>
 * posts to it), and it is the same code path the day the association's inbox
 * exists.
 *
 * =============================================================================
 * ⛔ THE HONESTY RULE — WHY THERE IS NO "THANK YOU" TODAY
 * =============================================================================
 * There is nowhere to deliver a message (`placeholders.contactDelivery`). So
 * the last thing this action does is ask `deliverEnquiry()`, and it returns
 * `sent` ONLY if the transport reports that a provider accepted the message.
 * Today that is impossible, so the visitor gets `notConnected`: an explicit
 * statement that the request was NOT sent and that what they typed was not
 * kept. Nothing is stored, nothing is logged, nothing is queued.
 *
 * The alternative — accepting the form and showing a receipt — is the single
 * most harmful thing this site could do. Someone would believe a licensed
 * housing cooperative had their phone number and wait for a call that no one
 * can make. `sent` is unreachable by construction, not by discipline: it is
 * behind a transport that cannot succeed until someone implements it.
 *
 * VALIDATION STILL RUNS IN FULL. The errors are real and useful, the honeypot
 * really drops bots, and none of it is theatre — flipping one placeholder and
 * writing one function turns this into a working enquiry pipeline.
 * ========================================================================== */

/** The four regions, as slugs. The select cannot offer anything else. */
const REGION_SLUGS = regions.map((region) => region.slug) as [
  string,
  ...string[],
];

/** The client's own four enquiry types (SOVA §5.16). Not extended here. */
const ENQUIRY_TYPES = contact.form.type.options as unknown as [
  string,
  ...string[],
];

/**
 * ⛔ PHONE VALIDATION MOVED WHEN THE FIELD SPLIT IN TWO — 2026-08-22.
 *
 * It used to be one permissive string: 6–24 characters containing at least six
 * digits in any alphabet, deliberately loose because "+963…", "09…", "00963…"
 * and ٠٩٣٤… are all real ways a Syrian writes a number and a strict pattern
 * rejects real people. That reasoning was right for a single free-text field.
 *
 * The country code is now its OWN field and an enum, so the loose half is
 * smaller and can be stricter without rejecting anyone:
 *
 *   · `normaliseDigits()` folds Arabic-Indic (٠-٩) and Persian (۰-۹) to
 *     Western and drops spaces, dashes, brackets and any `+`/`00` a visitor
 *     typed out of habit. The visitor is not corrected; the value is.
 *   · `stripTrunk()` removes the leading 0. `0934…` behind `+963` would dial
 *     `+9630934…`, which is not a number.
 *   · EXACTLY NINE DIGITS is what must be LEFT after both, because the form is
 *     Syria-only (2026-08-22) and a Syrian national number is nine digits for
 *     mobiles and for landlines alike. A range would accept a number that
 *     cannot be dialled; the length is the actual rule.
 *
 * ⚠️ THE REFINEMENT RUNS ON THE NORMALISED VALUE, NOT THE RAW ONE, which is
 * why `transform` comes before it. Validating the raw string and storing the
 * normalised one is how a field passes validation and stores something else.
 */
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .max(24)
    .transform((value) => stripTrunk(normaliseDigits(value)))
    .refine((digits) => digits.length === SYRIA_NATIONAL_DIGITS),
  region: z.enum(REGION_SLUGS),
  type: z.enum(ENQUIRY_TYPES),
});

/* A `"use server"` module may export ONLY async functions, so the state shape,
   the initial state and the honeypot's name live in `@/lib/enquiry` — which is
   also what keeps zod out of the client bundle. */

const MESSAGES = contact.form.errors;

/**
 * What the echo may carry back, per field.
 *
 * FADE 7: `values: raw` echoed whatever arrived — a 10,078-character `name`
 * round-tripped to the client in full, inside a `useActionState` payload that
 * is serialised into the response on every failed submit. The values exist so
 * a no-JS visitor does not lose their typing, and nothing longer than the
 * schema allows can ever become valid typing.
 *
 * `name` and `phone` mirror `schema`; keep them equal, and equal to the
 * `maxLength` attributes in `contact-form.tsx`. `region` and `type` are enums —
 * 64 is far past the longest real value and exists only so an arbitrary string
 * cannot ride back out on a select's `key` or a radio's `defaultChecked`.
 */
const ECHO_LIMITS = {
  name: 80,
  phone: 24,
  region: 64,
  type: 64,
} as const;

/** Trim the echo to `ECHO_LIMITS`. Never mutates what validation sees. */
function echoable(raw: Record<EnquiryField, string>) {
  return {
    name: raw.name.slice(0, ECHO_LIMITS.name),
    phone: raw.phone.slice(0, ECHO_LIMITS.phone),
    region: raw.region.slice(0, ECHO_LIMITS.region),
    type: raw.type.slice(0, ECHO_LIMITS.type),
  };
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    region: String(formData.get("region") ?? ""),
    type: String(formData.get("type") ?? ""),
  };

  /* The form's idempotency key, capped for the same reason as everything else
     that arrives from a client. It is NOT validated beyond that: an absent or
     malformed key must not fail an otherwise good enquiry, it only costs that
     request the transport's dedupe. See `lib/enquiry-transport.ts`. */
  const key = String(formData.get(ENQUIRY_KEY_FIELD) ?? "").slice(0, 128);

  const values = echoable(raw);

  /* --------------------------------------------------------------- honeypot
     A field no human ever sees, focuses or fills. If it has content, this is
     a bot. Return the same state a person would get — telling a bot it was
     detected is free information for whoever wrote it.

     ⛔ ECHOING `values` IS THE POINT, AND IT IS WHY THEY ARE BUILT ABOVE THE
     CHECK RATHER THAN BELOW IT. SAGE-2. The message was already identical, but the
     STATE was not: a person's `notConnected` carries `values` and this branch
     returned none. `useActionState` serialises that state into the response,
     so the two outcomes were distinguishable by anything reading the payload
     rather than the screen — which is exactly the free information the comment
     above says not to give away. Echoing the bot's own input back costs
     nothing and makes the two responses the same shape. */
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim() !== "") {
    return {
      status: "notConnected",
      message: contact.form.result.notConnected,
      values,
    };
  }

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    // zod's own messages are English and developer-facing. Every field gets the
    // client-voice Arabic string from content/contact.ts instead.
    const flat = z.flattenError(parsed.error).fieldErrors;
    const errors: Partial<Record<EnquiryField, string>> = {};
    for (const field of ["name", "phone", "region", "type"] as const) {
      if (flat[field]?.length) errors[field] = MESSAGES[field];
    }

    return {
      status: "invalid",
      message: contact.form.result.invalid,
      errors,
      values,
    };
  }

  /* ---------------------------------------------------------- rate limit
     ⛔ AFTER VALIDATION, AND BEFORE DELIVERY. Both halves of that are
     deliberate.

     AFTER, because a visitor who mistypes their phone number three times has
     not used three of their five attempts — only a request that is about to
     cost the association something is counted.

     BEFORE, because the whole point is to not spend a send. Counting after
     `deliverEnquiry()` would throttle the reporting, not the sending.

     The honeypot above does not cover this case: it catches a bot that fills
     every field it finds, not a script that posts the four correct fields in
     a loop. Read `src/lib/rate-limit.ts` for what this does and does not
     protect — it is the floor, not the ceiling. */
  const limit = rateLimit(clientKey(await headers()));
  if (!limit.allowed) {
    return {
      status: "rateLimited",
      message: contact.form.result.tooMany,
      values,
    };
  }

  const delivery = await deliverEnquiry({ ...parsed.data, key });

  if (!delivery.ok) {
    /* NOT SENT. The visitor is told exactly that, and the values are handed
       back so the work of filling the form is not thrown away with it. */
    return {
      status: "notConnected",
      message: contact.form.result.notConnected,
      values,
    };
  }

  /* ---------------------------------------------------------- the follow-up
     ⛔ BUILT ONLY HERE, ON THE ONE PATH WHERE THE EMAIL ALREADY SUCCEEDED.

     Every other return above is a state in which nothing was delivered, and
     offering «متابعة طلبك» — "follow up on your request" — next to a message
     saying the request was not sent would be an invitation to believe the
     opposite of what the sentence beside it says. The channel band above the
     form is what `notConnected` points at instead, and it always has.

     `parsed.data`, not `raw`: the draft has to describe the enquiry the
     ASSOCIATION received, which is the normalised one. `raw.phone` could still
     be `٠٩٣٤…` or `+963 934…`.

     `undefined` when the WhatsApp number is unresolved — the client renders
     nothing, which is why there is no second condition on the other side. */
  return {
    status: "sent",
    message: contact.form.result.sent,
    whatsappHref: whatsappEnquiryHref(parsed.data) ?? undefined,
  };
}
