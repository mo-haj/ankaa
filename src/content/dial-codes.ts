/* =============================================================================
 * DIALLING CODES — the country half of the enquiry form's phone field.
 *
 * =============================================================================
 * WHY THE PHONE FIELD SPLIT IN TWO — operator, 2026-08-22
 * =============================================================================
 * It was ONE free-text box accepting anything up to 24 characters, and what
 * arrived was whatever the visitor felt like typing: `0934…`, `+963 934…`,
 * `00963-934…`, and Arabic-Indic digits, because that is what an Arabic
 * keyboard produces. Every one of those is the same number and none of them
 * matched the next. The association was left normalising by eye.
 *
 * THE RESEARCH DOES NOT FULLY AGREE, AND IT IS WORTH KNOWING WHY:
 *   · UX Planet / UX Movement argue for ONE field with the country selector
 *     built into it, because splitting raises interaction cost.
 *   · Evil Martians argue for a SEPARATE country selector beside the number.
 * They actually agree on the substance — a country selector adjacent to the
 * number, never "type the + yourself" — and differ only on whether it is
 * drawn as one control or two. Two plain controls is what this form does,
 * because it already has a styled <select> (the region picker) and reusing it
 * costs nothing, ships no JavaScript, and works with scripting disabled.
 *
 * =============================================================================
 * ⛔ NOTHING BELOW IS RENDERED TODAY — OPERATOR, 2026-08-22.
 *
 * The first build of this field shipped the list as a <select>. The operator
 * cut it the same day: the association builds in ريف دمشق الغربي and the
 * enquiries that matter are Syrian, so a 23-row dropdown was 23 rows of
 * decision for every visitor to reach the one answer they were always going
 * to give. The form now renders a FIXED `+963` affix instead.
 *
 * THE LIST IS KEPT, NOT DELETED, AND IT IS ONE COMPONENT AWAY FROM RETURNING:
 * `dialCodes` is still exported and still correct. If the association asks for
 * international enquiries, the <select> goes back into `contact-form.tsx`,
 * `dialCode` goes back onto `EnquiryField`, and the schema swaps
 * `SYRIA_DIAL_CODE` for `z.enum(DIAL_CODES)`. That is the whole change.
 *
 * ⚠️ FLAGGED TO THE ASSOCIATION IN THE HANDOVER, because it is their call and
 * not an engineering one: today a diaspora member outside Syria cannot submit
 * the form and must use the WhatsApp or email row above it.
 *
 * ---------------------------------------------------------------------------
 * The original note on the list's SHAPE, which still governs it if it returns:
 *
 * ⛔ WHY THIS LIST IS 24 COUNTRIES AND NOT 200 — READ BEFORE "COMPLETING" IT
 * =============================================================================
 * This is a housing cooperative building in ريف دمشق الغربي. Its enquirers are
 * in Syria, in the neighbouring countries, in the Gulf, and in the European
 * countries where the Syrian diaspora settled. Those are the entries below.
 *
 * A full ISO list would mean authoring ~200 Arabic country names, and a wrong
 * one is a visible error in the client's own language on a form. A short list
 * that is RIGHT beats a long list that is machine-translated.
 *
 * ⚠️ THE COST IS REAL AND IT IS ACCEPTED: someone dialling from a country not
 * on this list cannot submit the form. They still have WhatsApp and email in
 * the band directly above it, which is why that band is ordered first. ADDING
 * A COUNTRY IS ONE LINE — do that the first time someone asks, rather than
 * pulling in a package.
 *
 * ⛔ NO FLAGS. Flag emoji render as two-letter boxes on Windows, which is most
 * of this audience's desktop share, and they carry no information the name and
 * the code do not. `الاسم +code` is the whole entry.
 *
 * ORDER: Syria first because it is the default and the overwhelming majority,
 * then the rest grouped by region — neighbours, Gulf, Europe, North America.
 * Not alphabetical: a native <select> already has type-ahead, and grouping
 * puts the likely answer within the first few rows for everyone else.
 * ========================================================================== */

export interface DialCode {
  /** ITU dialling code, digits only, no `+`. This is what is submitted. */
  readonly code: string;
  /** Arabic country name, as it renders in the option. */
  readonly name: string;
}

/**
 * ⛔ `code` IS THE FORM VALUE AND THE SERVER VALIDATES AGAINST IT.
 * `actions/contact.ts` builds a `z.enum()` from this array, so a code that is
 * not here cannot be submitted — which is also what stops the country half
 * from ever becoming a free-text header-injection surface.
 *
 * ⚠️ `1` COVERS BOTH THE US AND CANADA and appears once, labelled for both.
 * Two options sharing a value would make the select's `defaultValue` ambiguous
 * on the echo after a failed submit.
 */
export const dialCodes: readonly DialCode[] = [
  { code: "963", name: "سوريا" },

  // neighbours
  { code: "90", name: "تركيا" },
  { code: "961", name: "لبنان" },
  { code: "962", name: "الأردن" },
  { code: "964", name: "العراق" },
  { code: "20", name: "مصر" },

  // Gulf
  { code: "966", name: "السعودية" },
  { code: "971", name: "الإمارات" },
  { code: "965", name: "الكويت" },
  { code: "974", name: "قطر" },
  { code: "973", name: "البحرين" },
  { code: "968", name: "عُمان" },

  // Europe
  { code: "49", name: "ألمانيا" },
  { code: "46", name: "السويد" },
  { code: "31", name: "هولندا" },
  { code: "43", name: "النمسا" },
  { code: "33", name: "فرنسا" },
  { code: "44", name: "بريطانيا" },
  { code: "45", name: "الدنمارك" },
  { code: "47", name: "النرويج" },
  { code: "32", name: "بلجيكا" },
  { code: "41", name: "سويسرا" },

  // North America
  { code: "1", name: "أمريكا وكندا" },
];

/**
 * ⛔ THE ONLY CODE THE FORM USES. Not a default any more — the country field
 * is gone and the action composes every number with this constant, so a
 * submitted `dialCode` cannot be forged because there is no longer one to
 * forge. See the block at the top of this file for what to do if the
 * association wants international enquiries back.
 */
export const SYRIA_DIAL_CODE = "963";

/**
 * A Syrian national number is EXACTLY NINE DIGITS once the trunk `0` is off —
 * operator, 2026-08-22: "the syrian number start with 0 and then 9 number
 * later or +963 then 9 number later".
 *
 * It holds for mobiles (`09XX XXX XXX` → `9XXXXXXXX`) and for landlines
 * (`011 XXX XXXX` → `11XXXXXXX`), which is why the rule is a LENGTH and not a
 * leading-digit pattern: requiring a `9` would reject every Damascus landline.
 */
export const SYRIA_NATIONAL_DIGITS = 9;

/**
 * ⛔ ARABIC-INDIC DIGITS ARE NOT AN EDGE CASE HERE, THEY ARE THE COMMON CASE.
 * An Arabic keyboard produces ٠١٢٣٤٥٦٧٨٩ (U+0660–0669) and a Persian one
 * produces ۰۱۲۳۴۵۶۷۸۹ (U+06F0–06F9). Both are the same numbers. The old
 * single-field schema accepted them and left them alone, so the association
 * received phone numbers it could not paste into a dialler.
 *
 * This folds every form to Western digits and drops everything else — spaces,
 * dashes, brackets, and a leading `+` or `00` the visitor typed out of habit
 * even though the code is now its own field.
 */
export function normaliseDigits(raw: string): string {
  let out = "";
  for (const ch of raw) {
    const point = ch.codePointAt(0)!;
    if (ch >= "0" && ch <= "9") out += ch;
    else if (point >= 0x0660 && point <= 0x0669) out += String(point - 0x0660);
    else if (point >= 0x06f0 && point <= 0x06f9) out += String(point - 0x06f0);
  }
  return out;
}

/**
 * The national number without its trunk prefix.
 *
 * Syrians write their mobile as `0934…` locally and `+963 934…` abroad — the
 * leading zero is a TRUNK CODE, valid inside the country and wrong the moment
 * a dialling code is in front of it. Someone who selects سوريا and types
 * `0934826796` means `+963934826796`, not `+9630934826796`, and dialling the
 * second one fails. Stripping it is the whole reason this function exists.
 */
export function stripTrunk(digits: string): string {
  return digits.replace(/^0+/, "");
}

/** `963` + `934826796` → `+963934826796`. E.164, which is what a dialler wants. */
export function toE164(code: string, national: string): string {
  return `+${code}${stripTrunk(normaliseDigits(national))}`;
}

/**
 * ⛔ THE `+` MOVES TO THE WRONG END OF THE NUMBER WITHOUT THIS — operator,
 * 2026-08-22, from the received email: «963993300303+».
 *
 * Any message this site composes is an RTL paragraph, because its labels are
 * Arabic. In an RTL paragraph the Unicode bidi algorithm classes the digits as
 * EN (European Number) and the leading `+` as ES — A NEUTRAL. A neutral at the
 * boundary of a run takes the PARAGRAPH's direction, not the number's, so the
 * `+` is laid out on the RTL side of the digits and the association reads a
 * number that cannot be dialled as written.
 *
 * U+200E LEFT-TO-RIGHT MARK is an invisible strong-LTR character. One before
 * the `+` and one after the last digit pins the whole run to LTR wherever it
 * lands. It was chosen over `<bdi>` and over U+2066/U+2069 isolates for one
 * reason: CLIENTS STRIP TAGS AND OLD ONES IGNORE ISOLATES, BUT NOTHING STRIPS
 * A CHARACTER. That is what makes it the right answer in all three places this
 * number is written — the HTML email, its plain-text alternative, and the
 * WhatsApp draft — only ONE of which has any markup at all.
 *
 * ⚠️ USE THIS, NOT `toE164`, ANYWHERE THE NUMBER LANDS IN PROSE. `toE164` is
 * still correct for an `href` or a comparison, where the bidi algorithm never
 * runs and two invisible characters would be two characters of noise.
 */
export function toE164Ltr(code: string, national: string): string {
  const LRM = "\u200e";
  return LRM + toE164(code, national) + LRM;
}
