/* =============================================================================
 * NAVIGATION — SOVA §5.2 (header) and §5.17 (footer).
 *
 * Labels verbatim. The two lists differ on purpose in the client's own copy:
 * the header says `تواصل معنا`, the footer says `التواصل`, and the footer adds
 * `الأسئلة الشائعة`. Both are preserved exactly as written.
 *
 * Anchors follow SOVA §11's section order. The header and footer render the
 * FINAL nav — that is the shell's job — but only `#about` (and `#trust`) exist
 * on the page after wave 1. Items whose target section lands in a later wave
 * carry `wave: 2`; when wave 2 composes those sections nothing here changes.
 * ========================================================================== */

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Which build wave lands the target section. 1 = already on the page. */
  readonly wave: 1 | 2;
}

/* =============================================================================
 * ⛔ EVERY HREF IS ROOT-ANCHORED (`/#about`), NOT A BARE FRAGMENT (`#about`),
 * AND THAT IS A BUG FIX, NOT A STYLE PREFERENCE — 2026-08-22, item 20.
 *
 * WHAT WAS BROKEN. Both lists shipped bare fragments and both are rendered by
 * the SHARED header and footer, which appear on every route. A bare `#about`
 * resolves against the CURRENT document, so on `/privacy`, on
 * `/projects/[slug]` and on the 404, all five header links and all five footer
 * links pointed at sections that do not exist on that page. Clicking one did
 * nothing at all. That is ten dead controls on four of the five routes, and it
 * had been true since wave 1.
 *
 * `not-found.tsx` already knew: it renders `href={`/${item.href}`}` with a
 * comment explaining exactly this trap. The fix belongs here instead, once,
 * where every consumer gets it — so that prefix has been removed from
 * `not-found.tsx` and this file is now the single source of truth.
 *
 * IT COSTS NOTHING ON `/`. A same-document URL with a fragment is a
 * same-document navigation: with scripting off the browser scrolls and does
 * NOT reload, and with scripting on `<FragmentLinks>` (`smooth-scroll.tsx`)
 * intercepts it, scrolls smoothly and keeps the `#` out of the address bar.
 * From any other route it is a real navigation home followed by a scroll,
 * which is the behaviour that was missing.
 * ========================================================================== */

/** SOVA §5.2 — header navigation. */
export const primaryNav: readonly NavItem[] = [
  { label: "عن الجمعية", href: "/#about", wave: 1 },
  { label: "المشاريع", href: "/#projects", wave: 2 },
  { label: "الانتساب", href: "/#membership", wave: 2 },
  /* ⛔ `/board`, NOT `/#president` — 2026-08-22. This item is labelled «مجلس
     الإدارة» and pointed for months at «كلمة رئيس مجلس الإدارة», i.e. one
     man's statement. A visitor clicking "board of directors" landed on a
     quote. The board now has its own page and this points at it; `#president`
     keeps its place on the home page as the statement it is, and `/board`
     links back to it. The LABEL is unchanged, so the header geometry measured
     below is unaffected. */
  { label: "مجلس الإدارة", href: "/board", wave: 2 },
  /* ⛔ THE FIFTH ITEM IS LOAD-BEARING GEOMETRY AS WELL AS NAVIGATION —
     operator, 2026-08-22.

     WHY IT WAS ADDED. The header clusters at the inline-start edge so the bar
     stays off the hero render (see the block in `site-header.tsx`). The
     operator wanted the group to sit closer to the centre without moving it
     back onto the building, and adding a link does exactly that: the cluster
     grows leftward from the brand, it does not shift.

     MEASURED, not estimated. `hero.webp`'s building silhouette was sampled and
     mapped through the `object-cover` transform at 1024/1100/1280/1440/1600/
     1920 and at viewport heights 800 and 900. Only the building's TOP corner
     falls inside the 86px header band, and it sits far left of its mass:

       width   building top-right   nav starts   slack
       1024          x 143            x 312      169px   ← the worst case
       1280          x 271            x 552      281px
       1440          x 371            x 687      316px
       1600          x 567            x 767      200px
       1920          x 738            x 927      189px

     One item is ~84px including its `gap-8`. So ONE fits at every width with
     ≈85px to spare at the tightest. ⚠️ A SIXTH DOES NOT — at 1024×800 it lands
     on the building and re-opens the operator's item 5. If a section ever
     needs promoting into the header, something has to come out.

     WHY `المناطق`. It is the second question a buyer asks after price, the
     section is finished, and since the Story region list was cut (item 15)
     `#location` is the only place the four areas live — so it had no front
     door. Placed here because the nav follows PAGE order and
     <LocationSection> renders after <President>. */
  { label: "المناطق", href: "/#location", wave: 2 },
  { label: "تواصل معنا", href: "/#contact", wave: 2 },
];

/** SOVA §5.17 — footer navigation. */
export const footerNav: readonly NavItem[] = [
  { label: "عن الجمعية", href: "/#about", wave: 1 },
  { label: "المشاريع", href: "/#projects", wave: 2 },
  { label: "الانتساب", href: "/#membership", wave: 2 },
  /* Added 2026-08-22 on operator request: the board was reachable from the
     header only, and the footer is where a visitor looks for who an
     institution IS. It sits after الانتساب and before the FAQ so the column
     runs what-we-are → what-we-build → how-to-join → who-runs-it → questions
     → contact, which is the order the home page itself is in. */
  { label: "مجلس الإدارة", href: "/board", wave: 2 },
  { label: "الأسئلة الشائعة", href: "/#faq", wave: 2 },
  { label: "التواصل", href: "/#contact", wave: 2 },
];
