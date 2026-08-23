/* =============================================================================
 * PLACEHOLDERS — the single registry of facts the client has NOT supplied.
 *
 * WHY THIS FILE EXISTS
 * جمعية العنقاء السكنية is a real Syrian housing cooperative. People will make
 * financial decisions on the strength of what this site says. A fabricated
 * licence number, phone number, price or delivery date is not a placeholder —
 * it is a lie with money attached. So there is exactly one rule here:
 *
 *     NO FACT MAY BE INVENTED. NOT EVEN AS A "REALISTIC-LOOKING" DUMMY.
 *
 * HOW IT WORKS
 *   · Every missing fact is one entry below with `value: null`.
 *   · Components never read `.value`. They render through <FactText>/<FactLink>
 *     (src/components/content/fact.tsx) or the `factText()` / `factHref()`
 *     helpers, which fall back to an honest Arabic string such as
 *     `يُضاف رقم الترخيص` ("the licence number will be added").
 *   · `factHref()` returns null while a fact is pending, so a phone number that
 *     does not exist can never become a dead `tel:` link.
 *   · Unresolved facts render with `data-pending` in the DOM. `grep data-pending`
 *     over a built page is a complete audit of what is still missing.
 *
 * TURNING THE SITE ON
 *   Fill `value` in on the entry. That is the whole switch — every place the
 *   fact appears updates at once, the honest fallback disappears, and links
 *   start rendering as links. Do not fill one in from memory, from the old
 *   site, or from "it's probably this". Only from the client, in writing.
 *
 * Sources: SOVA recon brief §9 (nineteen gaps, five blockers) and §5, where the
 * old site's own copy already admits several of these
 * (`يُضاف رقم التواصل الفعلي لاحقًا`, `الاسم يُضاف بعد اعتماده`).
 * ========================================================================== */

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

/** How a resolved value becomes an href. `null` => it is never a link. */
export type FactProtocol = "tel" | "mailto" | "whatsapp" | "url" | null;

export interface Fact {
  /** Stable id. Appears in the DOM as `data-fact` — keep it greppable. */
  readonly id: string;
  /**
   * The real value, once the client supplies it. `null` until then.
   * TODO(client): every null below is an open request. See `requires`.
   */
  readonly value: string | null;
  /** Rendered while `value` is null. Must read to an Arabic speaker as a gap. */
  readonly fallback: string;
  /** Plain-words description of what the client must hand over. */
  readonly requires: string;
  /** Launch blocker per SOVA §9. */
  readonly blocker: boolean;
  /** Link protocol. Only used once `value` is set. */
  readonly protocol?: FactProtocol;
  /**
   * ⛔ SET WHENEVER `value` HOLDS SOMETHING THAT IS NOT THE ASSOCIATION'S REAL
   * PUBLISHED DETAIL. The string is the provenance: who supplied it and when.
   *
   * This exists because filling `value` in is the file's ONE switch, and the
   * moment a fact is resolved it stops rendering `data-pending`, drops out of
   * `pendingFacts()`, and becomes indistinguishable — to the page, to a grep,
   * and to the next agent — from a detail the association actually published.
   * A fake value that no report can see is worse than a null one, because a
   * null one is at least honest about being null.
   *
   * Setting this puts the fact back under surveillance: it renders
   * `data-test-data` in the DOM (so `grep data-test-data` audits it exactly the
   * way `grep data-pending` audits the gaps) and it appears in
   * `testDataFacts()`. `blocker` stays TRUE on a test value.
   *
   * ⛔ NEVER set this on a value that came from the client. And never clear it
   * without replacing `value` in the same edit.
   */
  readonly testData?: string;
}

export interface MediaFact {
  readonly id: string;
  /** Path under /public once supplied. `null` until then. */
  readonly src: string | null;
  readonly width?: number;
  readonly height?: number;
  /** Arabic alt text for the supplied image. */
  readonly alt: string;
  /** Rendered instead of the image while `src` is null. */
  readonly fallback: string;
  readonly requires: string;
  readonly blocker: boolean;
}

/* -----------------------------------------------------------------------------
 * 1. CONTACT — SOVA §9 gaps 1, 4, 9, 10
 * The old site has NO phone number, NO email and NO address anywhere. Its own
 * form placeholder reads `يُضاف رقم التواصل الفعلي لاحقًا`, and its WhatsApp
 * button links to `#contact` with an HTML comment explaining the number is
 * missing. None of that is fixed by inventing one here.
 * -------------------------------------------------------------------------- */

export const phone: Fact = {
  id: "contact.phone",
  value: null,
  fallback: "يضاف رقم التواصل",
  requires:
    "The association's real public phone number in international form (+963 …). Needed for the header/footer contact block, the contact section and tel: links.",
  blocker: true,
  protocol: "tel",
};

/* ============================================================================
 * ⛔⛔⛔  TEST DATA — THE TWO FACTS BELOW ARE NOT THE ASSOCIATION'S DETAILS
 * ============================================================================
 *
 *     contact.whatsapp   +963934826796
 *     contact.email      dxd.mody2017@gmail.com
 *
 * WHERE THEY CAME FROM. The OPERATOR supplied both on 2026-08-21 so the contact
 * band could be built and driven with working links. They did NOT come from
 * جمعية العنقاء السكنية, the association does not publish them anywhere,
 * and the operator has said they will be replaced.
 *
 * WHAT THIS MEANS RIGHT NOW. The site is live-shaped: `#contact` renders a real
 * `https://wa.me/963934826796` and a real `mailto:dxd.mody2017@gmail.com`, and
 * a visitor who clicks either one messages a private individual rather than the
 * association. That is fine while this is a preview. It is NOT fine on the day
 * this is shown to the public as the cooperative's site.
 *
 * ⛔ THE FILE THAT MUST CHANGE WHEN THE REAL ONES ARRIVE IS THIS ONE:
 *
 *        src/content/placeholders.ts
 *
 *    Two edits per fact. Replace `value` with what the association sends IN
 *    WRITING, and DELETE the `testData` field on that fact. Nothing else in the
 *    codebase moves — no component reads these values directly, `factHref()`
 *    builds the links, and `#contact` and the footer both update at once. If
 *    the real values are not available and this has to stop being reachable,
 *    set `value: null` and the honest Arabic gap comes straight back.
 *
 * HOW TO FIND EVERY TEST VALUE ON THE SITE:
 *    `testDataFacts()` at the foot of this file, or `grep -r 'data-test-data'`
 *    over a built page. Both are complete by construction — <FactText> and
 *    <FactLink> are the only way a fact reaches the DOM.
 *
 * `contact.phone` above is UNTOUCHED and still null: the operator supplied a
 * WhatsApp number, not a landline, and a WhatsApp number is not a `tel:`.
 * ========================================================================== */

export const whatsapp: Fact = {
  id: "contact.whatsapp",
  /* ⛔ TEST DATA — operator, 2026-08-21. Not the association's number.
     Read the block above before touching this. */
  value: "+963934826796",
  testData:
    "Supplied by the OPERATOR on 2026-08-21 for testing. NOT the association's published WhatsApp number. Replace `value` and delete this field when the real one arrives, in writing, from the client.",
  fallback: "يضاف رقم واتساب",
  requires:
    "STILL OPEN. The association's real WhatsApp business number in international form (+963XXXXXXXXX). It becomes https://wa.me/<number>. What ships today is an operator-supplied TEST number and must not survive launch.",
  blocker: true,
  protocol: "whatsapp",
};

export const email: Fact = {
  id: "contact.email",
  /* ⛔ TEST DATA — operator, 2026-08-21. A personal gmail address, not the
     association's inbox. Read the block above before touching this. */
  value: "dxd.mody2017@gmail.com",
  testData:
    "Supplied by the OPERATOR on 2026-08-21 for testing. A personal address, NOT a monitored association inbox. Replace `value` and delete this field when the real one arrives, in writing, from the client.",
  fallback: "يضاف البريد الإلكتروني",
  requires:
    "STILL OPEN. A real monitored inbox on the association's own domain. `info@example.com` from the old README is NOT an address and must not be reinstated. What ships today is an operator-supplied TEST address on gmail.com and must not survive launch.",
  blocker: true,
  protocol: "mailto",
};

/* -----------------------------------------------------------------------------
 * SOCIAL — for the rebuilt contact band. NEITHER IS SUPPLIED.
 *
 * The association publishes no social profile anywhere this rebuild has seen —
 * not on the live site, not in SOVA §5. So these ship the way every other
 * missing fact ships: an honest Arabic gap, and NOT a link. `factHref()` returns
 * null while `value` is null and <FactLink> then renders TEXT; there is no
 * `href="#"` standing in for a page that may not exist. That is the exact bug
 * the old site's WhatsApp button had.
 *
 * ⛔ DO NOT GUESS A HANDLE. `facebook.com/ankaa`, `@ankaa_sy` and anything else
 * that "looks right" is a link to a stranger's account with a housing
 * cooperative's name attached to it. That is worse than having no link.
 * -------------------------------------------------------------------------- */

export const facebook: Fact = {
  id: "contact.facebook",
  value: null,
  fallback: "يضاف رابط فيسبوك",
  requires:
    "The full URL of the page the association itself controls (https://www.facebook.com/...), confirmed by the association — not a search result, and not a page that merely carries the name.",
  blocker: false,
  protocol: "url",
};

export const instagram: Fact = {
  id: "contact.instagram",
  value: null,
  fallback: "يضاف رابط إنستغرام",
  requires:
    "The full URL of the account the association itself controls (https://www.instagram.com/...), confirmed by the association. If there is no account, say so and the row is deleted rather than left pending forever.",
  blocker: false,
  protocol: "url",
};

export const address: Fact = {
  id: "contact.address",
  value: null,
  fallback: "يضاف عنوان المكتب",
  requires:
    "The office street address as it should be printed in Arabic, plus (optionally) a Google Maps place link. Both reference sites publish one; a cooperative without a findable office reads as a risk.",
  blocker: false,
};

/**
 * ⚠️ NOT RENDERED ANYWHERE AS OF 2026-08-21 — operator decision.
 *
 * «أوقات الدوام» was a row in the contact band and a row in the footer.
 * Both were deleted when the contact band was rebuilt: a pending row that says
 * «the opening hours will be added» costs a line of vertical space in two
 * places and tells a visitor nothing they can act on.
 *
 * THE FACT ITSELF STAYS IN THE REGISTER ON PURPOSE. It is still something the
 * association has not supplied, and `pendingFacts()` is the CLIENT's checklist,
 * not a description of the DOM. If the hours arrive, someone has to put a row
 * back before the value appears — setting `value` alone will no longer show it
 * anywhere. That is the one thing to know about this entry.
 */
export const officeHours: Fact = {
  id: "contact.officeHours",
  value: null,
  fallback: "تضاف أوقات الدوام",
  requires:
    "Opening days and hours in Arabic (e.g. which days, from/to). Also who a visitor asks for.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 2. LEGAL / LICENCE — SOVA §9 gaps 7 and 8. Both are blockers.
 *
 * The site says `مرخصة` (licensed) five times and never once says by whom or
 * under what number. For a Syrian housing cooperative that number IS the trust
 * signal, so the trust strip is built around it — rendering the honest gap
 * until it exists.
 * -------------------------------------------------------------------------- */

export const licenceNumber: Fact = {
  id: "legal.licenceNumber",
  value: null,
  fallback: "يضاف رقم الترخيص",
  requires:
    "The registration/licence number exactly as it appears on the certificate, plus the issue date. This is the single highest-value missing fact on the site.",
  blocker: true,
};

export const licenceAuthority: Fact = {
  id: "legal.licenceAuthority",
  value: null,
  fallback: "تضاف الجهة المرخصة",
  requires:
    "The full legal name of the body that issued the licence, written the way the association is permitted to write it.",
  blocker: true,
};

/**
 * A photograph of the actual licence certificate — SOVA §18 shot 5.
 * This is the intended replacement for the ministry emblem below: it proves
 * the same claim, it belongs to the association, and it carries no rights risk.
 */
export const licenceDocument: MediaFact = {
  id: "legal.licenceDocument",
  src: null,
  alt: "صورة وثيقة ترخيص الجمعية",
  fallback: "تضاف صورة وثيقة الترخيص",
  requires:
    "The registration certificate photographed flat on a neutral surface, even light, 3:2, min 2000px on the long edge. Redact nothing without telling us what was redacted.",
  blocker: true,
};

/**
 * ⛔ LEGAL BLOCKER — DO NOT SHIP `public/images/ministry.webp`.
 *
 * That file is a government emblem. The old site captions it
 * `شعار الجهة المشرفة كما ورد في المواد المقدمة من الجمعية` — a caption whose
 * own wording admits the association has not verified that it may use the mark
 * (SOVA §9 #8). Displaying a state emblem without authorisation is a legal
 * exposure, not a design choice.
 *
 * The credential slot in the trust strip is deliberately built to work with NO
 * logo at all. Do not "temporarily" put the emblem back to fill the space.
 * Two acceptable unblockers, in order of preference:
 *   1. `licenceDocument` above — a photograph of the association's own licence.
 *   2. Written authorisation from the issuing body to reproduce its emblem,
 *      on file, with the permitted wording.
 */
export const ministryEmblem: MediaFact = {
  id: "legal.ministryEmblem",
  src: null,
  alt: "",
  fallback: "",
  requires:
    "WITHHELD ON PURPOSE. Ships only with written authorisation from the issuing body on file. Prefer legal.licenceDocument instead and drop the emblem entirely.",
  blocker: true,
};

/* -----------------------------------------------------------------------------
 * 3. PEOPLE — SOVA §9 gap 2
 * -------------------------------------------------------------------------- */

export const chairmanName: Fact = {
  id: "people.chairmanName",
  value: null,
  // The old site's own wording. Kept verbatim: the client wrote this.
  fallback: "الاسم يضاف بعد اعتماده",
  requires:
    "The chairman's full name as he wishes it published, and his consent to publish it alongside his portrait and the quoted statement.",
  blocker: true,
};

/**
 * ⚠️ RESOLVED 2026-08-21 BY OPERATOR DECISION — AND IT IS AN INTERIM ASSET.
 *
 * `src` was `null` and the section rendered an empty frame. The operator has
 * directed that the association's existing photograph ships. It is now the
 * only MediaFact on the site with a value, so read the caveats:
 *
 *   · `abo_hmza.webp` is 859×1280 at 23 KB — roughly 0.02 bits per pixel, and
 *     visibly over-compressed. It is the same file the live site serves. It is
 *     also, by some distance, the largest photograph of a human being on this
 *     site. The `requires` line below is therefore NOT satisfied; it now
 *     describes a REPLACEMENT, not a first delivery, and it will not show up
 *     in `pendingFacts()` any more because this fact is resolved. That is the
 *     cost of resolving it, stated here so it is not discovered later.
 *   · THE MAN IN IT IS STILL UNNAMED. `chairmanName` above is untouched, still
 *     `null`, still `blocker: true`, and still renders the client's own
 *     «الاسم يُضاف بعد اعتماده» under the statement. A portrait with no name
 *     is a smaller gap than a name with no portrait, but it is a gap.
 *   · The source is 859×1280 ≈ 2:3, which is exactly the frame's aspect ratio,
 *     so nothing is cropped. `next/image` cannot generate a candidate wider
 *     than 859px, so between 640px and 1023px — where the portrait is full
 *     container width and the layout has not yet gone to two columns — a 2×
 *     display will be asking for more pixels than exist. Below 640 and at
 *     1024+ it is comfortably oversampled.
 *
 * `blocker` stays TRUE on purpose even though `src` is set: `isMediaResolved`
 * is what removes it from the pending report, and the flag is what tells a
 * reader this was never meant to be the final asset.
 */
export const chairmanPortrait: MediaFact = {
  id: "people.chairmanPortrait",
  src: "/images/abo_hmza.webp",
  width: 859,
  height: 1280,
  /* Names the ROLE and the association, and does not begin with "صورة" — a
     screen reader already announces that this is an image, so spending the
     first word of the alt text saying so again is noise. */
  alt: "رئيس مجلس إدارة جمعية العنقاء السكنية",
  fallback: "تضاف صورة رئيس مجلس الإدارة",
  requires:
    "STILL OPEN, now as a REPLACEMENT for the interim asset above. A real, consented environmental portrait (85mm, office or site, window light), 2:3 plus a 1:1 crop, min 4000px long edge. What is shipping today is abo_hmza.webp at 859×1280 / 23 KB — visibly over-compressed — and the person in it is still unnamed (see people.chairmanName, which remains an open blocker).",
  blocker: true,
};


/* -----------------------------------------------------------------------------
 * 3b. THE BOARD — /board, added 2026-08-22 on operator request.
 *
 * =============================================================================
 * ⛔ WHY THERE ARE NO PHOTOGRAPHS HERE, AND WHY THAT WAS NOT MY CALL TO MAKE
 * =============================================================================
 * The operator asked for temporary photographs "from the internet" so the page
 * would not look empty, on the reasoning that they are obviously placeholders
 * and would be swapped before launch. That reasoning is sound for a LAYOUT
 * placeholder. It does not survive what this particular page is:
 *
 *   `/board` presents five named offices of a REAL, LICENSED Syrian housing
 *   cooperative. A photograph of a real person in one of those frames is that
 *   person presented as this association's treasurer — to every visitor, to
 *   every screenshot, to every share. A `TODO` comment in the source is not
 *   visible to any of them.
 *
 * THERE WERE ALSO TWO PLAIN PRACTICAL PROBLEMS, found while sourcing them:
 * the usual free portrait endpoints serve 128px thumbnails, which is a
 * quarter of what a 2:3 card needs and would ship visibly blurred; and their
 * faces are overwhelmingly not of this audience, which reads as a stock page
 * rather than as a placeholder.
 *
 * WHAT SHIPS INSTEAD: `<PortraitPlaceholder>` — the association's own mark on
 * a tinted ground, at the exact aspect ratio of the real thing. The page looks
 * finished, the frames are unmistakably empty, and nothing can be mistaken for
 * a person. The operator's actual goal — "do not leave it empty, and do not
 * let us forget to replace it" — is better served by a frame that CANNOT ship
 * by accident than by one that only a grep can catch.
 *
 * ⛔ SWAPPING IN THE REAL PORTRAITS IS TWO STEPS AND NO CODE:
 *      1. drop the files at `public/images/board/<slug>.webp`
 *      2. set `src`, `width` and `height` on the matching fact below
 *    Every card, the roster grid and the pending report update at once.
 *
 * The chairman is deliberately NOT in this group — his seat reads
 * `chairmanName` / `chairmanPortrait` above, so his name lands on `/board` and
 * on `#president` from a single edit.
 * -------------------------------------------------------------------------- */

export const boardDeputyName: Fact = {
  id: "people.board.deputy",
  value: null,
  /* The client's own wording, the same string `chairmanName` uses. One phrasing
     for one kind of gap: five cards each inventing their own way to say "not
     published yet" would read as five different problems. */
  fallback: "الاسم يضاف بعد اعتماده",
  requires:
    "The deputy chair's full name as the association wishes it published, with that person's consent to publish it alongside their portrait and office.",
  blocker: true,
};

export const boardDeputyPortrait: MediaFact = {
  id: "people.board.deputy.portrait",
  /* ⛔ `null`, NOT A STOCK PHOTOGRAPH. See the block above this group. */
  src: null,
  alt: "نائب رئيس مجلس الإدارة في جمعية العنقاء السكنية",
  fallback: "تضاف الصورة بعد اعتمادها",
  requires:
    "A consented head-and-shoulders portrait of the deputy chair, 2:3, min 1600px long edge, on a plain or office background. Drop it at `public/images/board/deputy.webp` and set `src` on this fact — that is the whole change.",
  blocker: false,
};

export const boardSecretaryName: Fact = {
  id: "people.board.secretary",
  value: null,
  /* The client's own wording, the same string `chairmanName` uses. One phrasing
     for one kind of gap: five cards each inventing their own way to say "not
     published yet" would read as five different problems. */
  fallback: "الاسم يضاف بعد اعتماده",
  requires:
    "The secretary's full name as the association wishes it published, with that person's consent to publish it alongside their portrait and office.",
  blocker: true,
};

export const boardSecretaryPortrait: MediaFact = {
  id: "people.board.secretary.portrait",
  /* ⛔ `null`, NOT A STOCK PHOTOGRAPH. See the block above this group. */
  src: null,
  alt: "أمين السر في جمعية العنقاء السكنية",
  fallback: "تضاف الصورة بعد اعتمادها",
  requires:
    "A consented head-and-shoulders portrait of the secretary, 2:3, min 1600px long edge, on a plain or office background. Drop it at `public/images/board/secretary.webp` and set `src` on this fact — that is the whole change.",
  blocker: false,
};

export const boardTreasurerName: Fact = {
  id: "people.board.treasurer",
  value: null,
  /* The client's own wording, the same string `chairmanName` uses. One phrasing
     for one kind of gap: five cards each inventing their own way to say "not
     published yet" would read as five different problems. */
  fallback: "الاسم يضاف بعد اعتماده",
  requires:
    "The treasurer's full name as the association wishes it published, with that person's consent to publish it alongside their portrait and office.",
  blocker: true,
};

export const boardTreasurerPortrait: MediaFact = {
  id: "people.board.treasurer.portrait",
  /* ⛔ `null`, NOT A STOCK PHOTOGRAPH. See the block above this group. */
  src: null,
  alt: "أمين الصندوق في جمعية العنقاء السكنية",
  fallback: "تضاف الصورة بعد اعتمادها",
  requires:
    "A consented head-and-shoulders portrait of the treasurer, 2:3, min 1600px long edge, on a plain or office background. Drop it at `public/images/board/treasurer.webp` and set `src` on this fact — that is the whole change.",
  blocker: false,
};

export const boardMemberName: Fact = {
  id: "people.board.member",
  value: null,
  /* The client's own wording, the same string `chairmanName` uses. One phrasing
     for one kind of gap: five cards each inventing their own way to say "not
     published yet" would read as five different problems. */
  fallback: "الاسم يضاف بعد اعتماده",
  requires:
    "The board member's full name as the association wishes it published, with that person's consent to publish it alongside their portrait and office.",
  blocker: true,
};

export const boardMemberPortrait: MediaFact = {
  id: "people.board.member.portrait",
  /* ⛔ `null`, NOT A STOCK PHOTOGRAPH. See the block above this group. */
  src: null,
  alt: "عضو مجلس الإدارة في جمعية العنقاء السكنية",
  fallback: "تضاف الصورة بعد اعتمادها",
  requires:
    "A consented head-and-shoulders portrait of the board member, 2:3, min 1600px long edge, on a plain or office background. Drop it at `public/images/board/member.webp` and set `src` on this fact — that is the whole change.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 4. COMMERCIAL — SOVA §9 gaps 3, 12, 13
 * The #1 and #2 questions a visitor has. The FAQ currently asks both and
 * answers "they will be determined". Nothing here may be estimated.
 * -------------------------------------------------------------------------- */

export const unitSpecs: Fact = {
  id: "commercial.unitSpecs",
  value: null,
  fallback: "تضاف المواصفات المعتمدة",
  requires:
    "Approved per-project unit schedule: areas in m², room counts, floor counts, finish level. The six areas currently on the site are flagged provisional by the site itself.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * ⛔ `unitRooms` AND `unitFloors` WERE RETIRED ON 2026-08-22 — ANSWERED, NOT
 * DELETED, AND THE DIFFERENCE MATTERS.
 *
 * They asked the client for the room count per unit type and the number of
 * floors per block. Both were answered in full by the association's own
 * architectural file once the operator converted `art66.dwg` to DXF:
 *
 *   ROOMS   every room in the typical plate carries the architect's own Arabic
 *           label. They are read per apartment into `floor-plan.generated.ts`
 *           and rendered from there — 3 نوم / صالون / مطبخ / حمامان / برندتان /
 *           موزع for the 137, and so on for the other four.
 *   FLOORS  the fifty allocation title blocks record القبو + الأرضي +
 *           الأول…الثامن, five apartments each. Ten levels, fifty apartments.
 *
 * They are gone from `FACTS` rather than left with `value` filled in, because
 * a `Fact` is a ONE-LINE string slot and neither answer is one line any more —
 * both are structured data with their own generated module. Leaving a resolved
 * stub here would put a second, staler copy of the same truth in the registry,
 * which is the one thing this file exists to prevent.
 *
 * ⚠️ `unitSpecs` ABOVE IS STILL OPEN AND IS NOT THE SAME REQUEST. It asks for
 * the approved schedule ACROSS THE SIX PROJECTS, including the finish level.
 * D-66 is one building.
 * -------------------------------------------------------------------------- */

export const pricing: Fact = {
  id: "commercial.pricing",
  value: null,
  fallback: "تضاف الأسعار المعتمدة",
  requires:
    "Approved price or price range per unit type, with the currency and the date the pricing was approved.",
  blocker: false,
};

export const instalmentPlan: Fact = {
  id: "commercial.instalmentPlan",
  value: null,
  fallback: "تضاف آلية الأقساط المعتمدة",
  requires:
    "The instalment schedule: down payment, number of instalments, interval, and what happens on late payment.",
  blocker: false,
};

export const deliveryDate: Fact = {
  id: "commercial.deliveryDate",
  value: null,
  fallback: "يضاف موعد التسليم",
  requires:
    "Target handover date per project, and the association's stated policy if it slips.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 4b. DRAWINGS AND SAMPLES — SOVA §8.2, §8.4 P1, §18 shots 8 and 9.
 * Added in WAVE 2 for the unit-types and interior sections. Neither of these
 * needs new work from the client — the source material already exists.
 * -------------------------------------------------------------------------- */

/* -----------------------------------------------------------------------------
 * ⛔ `floorPlans` WAS RETIRED ON 2026-08-22 — DELIVERED, IN FULL, BY US.
 *
 * It was the highest-value missing asset on the whole list, and its `requires`
 * read: "Per unit type, a clean 2D floor plan exported from art66.dwg as SVG
 * (preferred): walls only, no title block, no CAD furniture, no layer noise.
 * Room labels in Arabic … We restyle them in the brand palette."
 *
 * That is now exactly what `scripts/extract-floor-plan.py` produces, from the
 * DXF the operator converted on 2026-08-22 — walls, columns, door swings,
 * glazing and the stair, with the title block, the dimension strings, the CAD
 * furniture and every other layer left behind, and the five apartments
 * segmented out of the drawing itself. It is not an image and there is no
 * `src`: it is vector data in `content/floor-plan.generated.ts`, drawn inline
 * with the site's own tokens, which is better than the PNG the request settled
 * for. A `MediaFact` with a null `src` would now render an honest-looking gap
 * over a section that has the real thing in it — the exact inverse of this
 * file's job.
 *
 * The `.dwg` and the `.dxf` both stay OUTSIDE `public/` and are still not
 * served. Nothing about that changed.
 * -------------------------------------------------------------------------- */

/**
 * ⛔ THE ONE THING THE DRAWING DOES NOT SAY.
 *
 * The plate, the five apartments, their areas and their orientations are all
 * in the file. WHICH PROJECT IT IS, IS NOT. The title blocks name the plot —
 * «المقسم: D-66» — and stop there, and `projects.ts` has no plot numbers to
 * match it against because those six records are the client's provisional
 * placeholder data.
 *
 * So the site says what the drawing says (D-66) and renders this as a visible
 * gap beside it, rather than picking whichever of the six sounds likeliest.
 * Guessing here would attach a real, drawn, dimensioned building to a project
 * name that may belong to a different site entirely — and a member could read
 * it as the plan for the flat they are paying instalments on.
 */
export const planProject: Fact = {
  id: "drawings.planProject",
  value: null,
  fallback: "يضاف اسم المشروع",
  requires:
    "Which of the association's projects plot D-66 belongs to, and whether the D-66 drawing is the approved set or a study. If other projects have their own approved drawings, send those DWG/DXF files too — the extractor takes them as they are.",
  blocker: false,
};

/**
 * The materials strip in the interior section — SOVA §18 shot 8. Cheap to
 * shoot, disproportionate credibility return: it lets the site *evidence*
 * `مواصفات جيدة` instead of asserting it. The strip ships as one honest slot
 * with NO material names, because naming the stone, tile or hardware before
 * the specification is approved would be inventing a spec.
 */
export const materialSamples: MediaFact = {
  id: "interior.materialSamples",
  src: null,
  alt: "عينات من مواد التشطيب",
  fallback: "تضاف صور عينات التشطيب",
  requires:
    "Flat-lay of the approved finish samples — stone, floor tile, door hardware, paint chips, tap — on neutral linen, top-down, 1:1, soft directional light, min 2000px. Send the approved material SCHEDULE with it; we will not caption a sample we cannot name.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 4c. GEOGRAPHY — SOVA §9 gap 11. Added in WAVE 3 for the location section.
 *
 * ⛔ THERE ARE NO COORDINATES AND NONE MAY BE GUESSED.
 * The site names four operating areas and publishes zero geography (SOVA §9
 * #11, severity high). ضاحية الفردوس, الفيحاء, جمرايا and الهامة are real
 * places in ريف دمشق الغربي, and a plausible-looking pin dropped on any of
 * them is a fabricated statement about where a stranger's money is going to
 * build a house. Neither a map tile, a lat/long, a distance nor a drive time
 * is inferred here, from the old site, from a search engine or from memory.
 * -------------------------------------------------------------------------- */

/**
 * The styled static map of the four operating areas. A raster/vector image the
 * association approves, NOT a live embed: an embed would need an API key, ship
 * third-party trackers onto an Arabic page with no privacy policy (§9 #17),
 * and still show pins we cannot place.
 */
export const regionsMap: MediaFact = {
  id: "geo.regionsMap",
  src: null,
  alt: "خريطة مناطق عمل الجمعية في ريف دمشق الغربي",
  fallback: "تضاف خريطة مناطق العمل",
  requires:
    "A single approved map image covering the four operating areas (ضاحية الفردوس · الفيحاء · جمرايا · الهامة), with each project site marked, exported at 2× for a 16:10 frame, min 2000px wide. Send the underlying coordinates too — with the association's confirmation that publishing them is permitted — and we restyle the map in the brand palette. Do not send a screenshot of a maps site: the tiles are licensed.",
  blocker: false,
};

/**
 * Travel times / distances from each area to central Damascus. Era publishes
 * exactly this and SOVA §11 row 11 names it as enough on its own to make the
 * section worth having. It is also the fact a buyer converts into a commute.
 */
export const travelTimes: Fact = {
  id: "geo.travelTimes",
  value: null,
  fallback: "تضاف المسافات وأوقات الوصول",
  requires:
    "Per operating area: distance to central Damascus in km and a typical drive time, with the reference route and who measured it. An estimate the association is willing to stand behind — not one we produce.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 4d. PROCESS — SOVA §11 rows 8 and 9. Added in WAVE 3 for `#process`.
 * -------------------------------------------------------------------------- */

/**
 * The member's journey: apply → approve → pay → allocate → contract → deliver.
 *
 * SOVA §11 row 8 asks for it and it is the highest-conversion content on the
 * page — but the client has never published it. What the client HAS published
 * is (a) the four PROJECT stages (`projectDetail.steps`, §5.10) and (b) five
 * membership CONDITIONS (§5.12). Neither is a procedure.
 *
 * A six-step admission process assembled out of «ابدأ طلبًا مبدئيًا» and
 * «تُراجع الوثائق … قبل قبول الطلب» would be us drafting a regulated
 * cooperative's admission rules and putting them on its own website. So
 * `#process` ships the four real project stages and names this gap once.
 */
export const memberJourney: Fact = {
  id: "process.memberJourney",
  value: null,
  fallback: "تضاف خطوات الانتساب التفصيلية",
  requires:
    "The admission procedure as the association actually runs it, in order: what an applicant submits, who reviews it, what is paid and when, how a unit is allocated, when the contract is signed, and what the member receives at each step. Plus which steps happen at the office and which can be done remotely.",
  blocker: false,
};

/* -----------------------------------------------------------------------------
 * 4e. THE CONTACT FORM'S DESTINATION — SOVA §9 #6. WAVE 3.
 *
 * The enquiry form is real: a Server Action, zod validation, a honeypot and
 * honest Arabic error states (src/app/actions/contact.ts). What it does not
 * have is anywhere to deliver a message — the association has no published
 * inbox and no mail service is configured.
 *
 * `src/lib/enquiry-transport.ts` is the single seam. While this fact is null
 * the transport reports `ok: false` and the form tells the visitor, in the
 * client's own words, that nothing was sent. IT NEVER REPORTS SUCCESS.
 * -------------------------------------------------------------------------- */
/* ⛔ TEST DATA — operator, 2026-08-22. NOT the association's inbox.
   This is the SAME personal gmail as `email` above, and it is here so the
   enquiry pipeline can be proved end to end before the association supplies
   anything. Resend's sandbox sender (`onboarding@resend.dev`, the default for
   `ENQUIRY_FROM`) can ONLY deliver to the address that owns the API key, which
   is what makes this destination testable and makes any other destination fail
   with a 403 until a domain is verified.

   TO GO LIVE, BOTH OF THESE, NOT ONE:
     1. `value` below becomes the association's monitored inbox
     2. `ENQUIRY_FROM` becomes an address on a domain verified in Resend
   Change one without the other and every enquiry is silently refused. */
export const contactDelivery: Fact = {
  id: "contact.delivery",
  value: "dxd.mody2017@gmail.com",
  /* ⛔ THIS FIELD IS WHAT MAKES THE FORM'S NOTICE HONEST, AND IT WAS MISSING
     FOR ABOUT AN HOUR. `isTestData()` returns true only when a fact is
     resolved AND carries this string. Setting `value` without it told
     <ContactForm> the destination was real, and the form rendered
     «يصل الطلب إلى بريد الجمعية» over an inbox that is not the
     association's. Caught by a test asserting the notice, not by review.
     DELETE THIS FIELD ONLY WHEN THE VALUE ABOVE IS THE REAL ONE. */
  testData:
    "Supplied by the OPERATOR on 2026-08-22 to prove the Resend pipeline end to end. It is the same personal gmail as `email`, NOT a monitored association inbox — and Resend's sandbox sender can only deliver to it. Replace `value` and delete this field when the association supplies a real inbox, in writing.",
  fallback: "تضاف جهة استقبال الطلبات",
  requires:
    "Where an enquiry should land, and the credentials to send it: a monitored inbox on the association's domain (see contact.email) plus ONE transport — a Resend API key, or SMTP host/port/user/password. Then set the value here and implement deliverEnquiry() in src/lib/enquiry-transport.ts. Until both exist the form refuses to claim it sent anything.",
  blocker: true,
};

/* -----------------------------------------------------------------------------
 * 5. DOCUMENTS — SOVA §9 gaps 14 and 17
 * Footer document links (§11 row 14). Each renders as plain text, never as a
 * link, until a real file exists under /public/documents/.
 * -------------------------------------------------------------------------- */

export interface DocumentFact extends Fact {
  /** Arabic label for the document itself. Shown whether or not it resolves. */
  readonly label: string;
}

export const bylawsDocument: DocumentFact = {
  id: "documents.bylaws",
  label: "النظام الأساسي",
  value: null,
  fallback: "يضاف الملف",
  requires:
    "The association's articles / نظام أساسي as a PDF cleared for publication.",
  blocker: false,
  protocol: "url",
};

export const membershipFormDocument: DocumentFact = {
  id: "documents.membershipForm",
  label: "نموذج طلب الانتساب",
  value: null,
  fallback: "يضاف الملف",
  requires:
    "The printable membership application form as a PDF, matching whatever the office actually hands out.",
  blocker: false,
  protocol: "url",
};

export const privacyPolicyDocument: DocumentFact = {
  id: "documents.privacyPolicy",
  label: "سياسة الخصوصية",
  value: null,
  fallback: "يضاف الملف",
  requires:
    "A privacy policy — required the moment the contact form starts collecting a name and phone number (SOVA §9 #17). Can be a page rather than a PDF; say which.",
  blocker: false,
  protocol: "url",
};

/* -----------------------------------------------------------------------------
 * Helpers — the ONLY sanctioned way to put a fact on the page.
 * -------------------------------------------------------------------------- */

/** A fact whose value the client has actually supplied. */
export type ResolvedFact = Fact & { readonly value: string };

export function isResolved(fact: Fact): fact is ResolvedFact {
  return typeof fact.value === "string" && fact.value.trim().length > 0;
}

/**
 * True when `value` is set to something that is NOT the association's real
 * detail — see the `testData` field on `Fact`. Components use this to stamp
 * `data-test-data` on the rendered node; `testDataFacts()` below is the report.
 */
export function isTestData(fact: Fact): boolean {
  return isResolved(fact) && typeof fact.testData === "string";
}

export function isMediaResolved(
  fact: MediaFact,
): fact is MediaFact & { readonly src: string } {
  return typeof fact.src === "string" && fact.src.trim().length > 0;
}

/** The string to render. Real value if we have it, honest Arabic gap if not. */
export function factText(fact: Fact): string {
  return isResolved(fact) ? fact.value : fact.fallback;
}

/**
 * The href, or `null` while the fact is pending — so an unresolved phone number
 * cannot become `tel:يُضاف رقم التواصل`. Callers must handle null by rendering
 * text instead of a link.
 */
export function factHref(fact: Fact): string | null {
  if (!isResolved(fact)) return null;
  switch (fact.protocol) {
    case "tel":
      return `tel:${fact.value.replace(/[^\d+]/g, "")}`;
    case "mailto":
      return `mailto:${fact.value}`;
    case "whatsapp":
      return `https://wa.me/${fact.value.replace(/\D/g, "")}`;
    case "url":
      return fact.value;
    default:
      return null;
  }
}

/* -----------------------------------------------------------------------------
 * The register. Anything added above must be added here too — this list is what
 * the pending-facts report and any future audit script read.
 * -------------------------------------------------------------------------- */

export const FACTS = {
  phone,
  whatsapp,
  email,
  facebook,
  instagram,
  address,
  officeHours,
  licenceNumber,
  licenceAuthority,
  chairmanName,
  boardDeputyName,
  boardSecretaryName,
  boardTreasurerName,
  boardMemberName,
  unitSpecs,
  planProject,
  pricing,
  instalmentPlan,
  deliveryDate,
  travelTimes,
  memberJourney,
  contactDelivery,
  bylawsDocument,
  membershipFormDocument,
  privacyPolicyDocument,
} as const;

export const MEDIA_FACTS = {
  licenceDocument,
  ministryEmblem,
  chairmanPortrait,
  boardDeputyPortrait,
  boardSecretaryPortrait,
  boardTreasurerPortrait,
  boardMemberPortrait,
  materialSamples,
  regionsMap,
} as const;

/**
 * ⛔ EVERY FACT CURRENTLY SHOWING A VALUE THAT IS NOT THE ASSOCIATION'S.
 *
 * This is the launch gate that `pendingFacts()` cannot be: a test value is
 * RESOLVED, so it is invisible to the pending report by definition. If this
 * returns anything, the site is publishing a detail the association did not
 * give it, and it must return an empty array before launch.
 */
export function testDataFacts(): Array<{ id: string; value: string; testData: string }> {
  return Object.values(FACTS)
    .filter(isTestData)
    .map((f) => ({
      id: f.id,
      value: f.value as string,
      testData: f.testData as string,
    }));
}

/** Everything still missing, blockers first. Used by the dev-time report. */
export function pendingFacts(): Array<{
  id: string;
  blocker: boolean;
  requires: string;
}> {
  const pending = [
    ...Object.values(FACTS)
      .filter((f) => !isResolved(f))
      .map((f) => ({ id: f.id, blocker: f.blocker, requires: f.requires })),
    ...Object.values(MEDIA_FACTS)
      .filter((f) => !isMediaResolved(f))
      .map((f) => ({ id: f.id, blocker: f.blocker, requires: f.requires })),
  ];
  return pending.sort((a, b) => Number(b.blocker) - Number(a.blocker));
}
