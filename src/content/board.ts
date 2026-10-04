/* =============================================================================
 * BOARD (/board) — مجلس الإدارة. A NEW page, 2026-08-22, operator request.
 *
 * =============================================================================
 * ⛔ WHY THIS IS ITS OWN ROUTE AND NOT A SECTION OF THE HOME PAGE
 * =============================================================================
 * `#president` is «كلمة رئيس مجلس الإدارة» — one man's STATEMENT, and SOVA
 * §10.5 calls its displacement sentence the emotional core of the whole site.
 * The board is a different thing entirely: WHO the association is governed by.
 * Folding a roster of five people into that section would bury the statement
 * and turn a page's worth of governance into a footnote under a quote.
 *
 * The header's «مجلس الإدارة» link used to point at `/#president`, which was
 * simply the wrong destination for its own label — a visitor clicking a link
 * that says "board of directors" landed on one person talking. It now points
 * here, and `#president` keeps its place on the home page as what it is.
 *
 * =============================================================================
 * ⛔ WHAT IS REAL ON THIS PAGE, AND WHAT IS NOT — READ BEFORE ADDING A NAME
 * =============================================================================
 * REAL: the OFFICES. A Syrian housing cooperative's board carries a chairman,
 * a deputy, a secretary, a treasurer and members — that is the structure the
 * cooperative framework defines, not something invented here.
 *
 * NOT SUPPLIED, AND THEREFORE NOT WRITTEN: which PERSON holds which office.
 * The association has published no roster. Every name on this page comes from
 * `placeholders.ts` and every one of them is `null`, so the cards render the
 * client's own «الاسم يضاف بعد اعتماده» rather than a plausible-looking Arabic
 * name that a visitor would have no way to know was invented.
 *
 * ⚠️ THAT INCLUDES THE COUNT. Five seats is the STANDARD shape and the page
 * says so in `note` — it is not a claim that this association's board has
 * exactly five members. If the association sends a roster of seven, this file
 * grows two entries and nothing else moves.
 *
 * ⛔ THE CHAIRMAN'S SEAT IS NOT DUPLICATED HERE. It reads `chairmanName` and
 * `chairmanPortrait` — the SAME two facts `#president` uses — so the day his
 * name is supplied it appears in both places from one edit. Do not add a
 * `name` field to that seat.
 * ========================================================================== */

import { chairmanName, chairmanPortrait } from "@/content/placeholders";
import type { Fact, MediaFact } from "@/content/placeholders";
import {
  boardDeputyName,
  boardDeputyPortrait,
  boardMemberName,
  boardMemberPortrait,
  boardSecretaryName,
  boardSecretaryPortrait,
  boardTreasurerName,
  boardTreasurerPortrait,
} from "@/content/placeholders";

export interface BoardSeat {
  /** Stable key. Latin, and the filename stem for the portrait when it lands. */
  readonly slug: string;
  /** The OFFICE. Real — this is the structure, not a person. */
  readonly role: string;
  /** The person's name. Pending for every seat today. */
  readonly name: Fact;
  /** The portrait. Only the chairman's is resolved (an interim asset). */
  readonly portrait: MediaFact;
}

/**
 * The five seats, in order of office.
 *
 * ⛔ THE ORDER IS THE HIERARCHY AND IT IS NOT ALPHABETICAL. A board list that
 * sorts by name reads as a directory; one that sorts by office reads as a
 * structure, which is the thing a prospective member is actually trying to
 * understand when they open this page.
 */
export const boardSeats: readonly BoardSeat[] = [
  {
    slug: "chairman",
    role: "رئيس مجلس الإدارة",
    // The same two facts `#president` renders. One name, one edit, two places.
    name: chairmanName,
    portrait: chairmanPortrait,
  },
  {
    slug: "deputy",
    role: "نائب رئيس مجلس الإدارة",
    name: boardDeputyName,
    portrait: boardDeputyPortrait,
  },
  {
    slug: "secretary",
    role: "أمين السر",
    name: boardSecretaryName,
    portrait: boardSecretaryPortrait,
  },
  {
    slug: "treasurer",
    role: "أمين الصندوق",
    name: boardTreasurerName,
    portrait: boardTreasurerPortrait,
  },
  {
    slug: "member",
    role: "عضو مجلس الإدارة",
    name: boardMemberName,
    portrait: boardMemberPortrait,
  },
];

export const board = {
  /** authored */
  kicker: "مجلس الإدارة",

  /** authored — `h1`, this is a page and not a section. */
  title: {
    a: "من يدير",
    /** gold — the page's one gold element. */
    b: "جمعية البنيان السكنية.",
  },

  /** authored */
  lead: "يشرف على أعمال الجمعية مجلس إدارة منتخب ضمن الإطار التعاوني المنظم، ويتولى متابعة المشاريع والانتساب والالتزامات المالية.",

  /**
   * authored — THE SENTENCE THAT KEEPS THIS PAGE HONEST. It is rendered above
   * the cards, not under them, for the same reason the contact form's notice
   * sits above its inputs: nobody should read five cards and only then find
   * out the names on them have not been published yet.
   */
  note: "لم تعتمد الجمعية بعد أسماء وصور أعضاء مجلس الإدارة للنشر. المناصب أدناه هي التشكيل النظامي لمجلس إدارة جمعية تعاونية سكنية، وتنشر الأسماء فور اعتمادها.",

  /** authored — aria-label on the roster list. */
  rosterLabel: "أعضاء مجلس الإدارة",

  /** authored — links back to the chairman's statement on the home page. */
  cta: {
    label: "قراءة كلمة رئيس مجلس الإدارة",
    href: "/#president",
  },
} as const;

export type Board = typeof board;
