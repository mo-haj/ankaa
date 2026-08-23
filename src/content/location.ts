/* =============================================================================
 * LOCATION (#location) — SOVA §11 row 11. A NEW section.
 *
 * ⛔ THERE ARE NO COORDINATES. NONE MAY BE INFERRED.
 * SOVA §9 #11: "four region names, zero geography". That is still true, and it
 * stays true here — no lat/long, no pin, no map tile, no distance and no drive
 * time is written into this file or derived anywhere in the section. All four
 * belong to `placeholders.regionsMap` and `placeholders.travelTimes`.
 *
 * WHAT THE SECTION SHOWS INSTEAD (see the header of location.tsx for the call)
 * The DISTRIBUTION: which of the six projects sits in which of the four areas.
 * That is real, client-supplied data — `projects.items[].region` — and it is
 * the one thing about location the site has never actually said. The region
 * names, their order and their count labels come from `regions.ts`; the
 * projects come from `projects.ts`. Nothing is copied into this file.
 *
 * `ريف دمشق الغربي` in the title is NOT authored: it is the client's own
 * phrase, verbatim from the FAQ answer «أين تقع المشاريع؟» (SOVA §5.14) and
 * from the site description (§5.1). It is the only geographic statement the
 * association has published, so it is the only one the section makes.
 *
 * Every other string below is AUTHORED.
 * ========================================================================== */

export const location = {
  /** authored */
  kicker: "مناطق العمل",

  /** authored — `ريف دمشق الغربي` is the client's phrase (SOVA §5.14/§5.1). */
  title: {
    a: "أربع مناطق في",
    /** gold — the section's one gold element. */
    b: "ريف دمشق الغربي.",
  },

  /** authored */
  lead: "توزع مشاريع الجمعية الحالية على أربع مناطق. تنشر الخريطة والمسافات التقريبية إلى مركز دمشق فور اعتمادها.",

  /** authored — aria-label for the distribution list. */
  distributionLabel: "توزع المشاريع على مناطق العمل",

  /** authored — headings for the two pending slots. */
  map: {
    title: "خريطة مناطق العمل",
    note: "خريطة موحدة تظهر مواقع المشاريع، تنشر بعد اعتمادها من الجمعية.",
  },

  /**
   * authored — 2026-08-22, THE SCHEMATIC THAT NOW FILLS THE MAP SLOT.
   *
   * ⛔ `caption` IS NOT DECORATION AND IT IS NOT A DISCLAIMER BOLTED ON. It is
   * the sentence that makes the drawing legal to show. `<RegionsSchematic>`
   * draws four labelled plots; without a line saying they are a diagram and
   * not positions, a visitor reads them as four located places — which is
   * exactly the claim this section has refused to make since it was built
   * (SOVA §9 #11, "four region names, zero geography").
   *
   * It says both halves on purpose: NOT a geographic map, and NOT the actual
   * locations. Dropping either one leaves the other readable as a hedge about
   * accuracy rather than a statement that there is no geography here at all.
   *
   * ⚠️ `map.note` STILL RENDERS UNDER IT. The real approved map is still an
   * open request and the schematic does not close it.
   */
  schematic: {
    caption:
      "مخطط توضيحي لتوزع مناطق عمل الجمعية، وليس خريطة جغرافية ولا يعبر عن المواقع الفعلية للمشاريع.",
    /* ⛔ `toward` («باتجاه مركز دمشق») AND ITS ARROW ARE DELETED — operator,
       2026-08-22: "the direction to damascus i didnt like this ... and the
       arrow that you create just remove it and keep the rest".

       IT COST NOTHING TO REMOVE, which is worth recording because the argument
       for it was long. The marker restated the client's own «ريف دمشق الغربي»
       and was the sheet's only spatial statement; the reasoning for why a
       DIRECTION was permissible where a POSITION is not is still in the header
       of `regions-schematic.tsx` and still governs anything anyone adds later.
       The heading of this very section already says «أربع مناطق في ريف دمشق
       الغربي», so the sentence was never load-bearing — it was a second copy
       of a line the visitor had just read.

       ⚠️ DO NOT REINSTATE IT AS A COMPASS OR A SCALE BAR. Both assert an
       orientation and a distance nobody has supplied. If the association ever
       asks for the direction back, it is this string plus the four-line
       <path> that was in the title block. */
    /**
     * Completes each plot's `aria-label`: «الهامة — عرض تفاصيل المنطقة».
     *
     * ⚠️ IT SAID «عرض مشاريع المنطقة» while a plot was a LINK that navigated
     * to the projects rail. Pressing one now SELECTS it and swaps the card
     * below the drawing, and the label had to stop promising a journey it no
     * longer takes — a screen-reader user who hears "show the area's projects"
     * and then does not move has met the same surprise the operator reported
     * as a visual bug.
     */
    hotspotAction: "عرض تفاصيل المنطقة",

    /** The card's default state. Four plots that respond to a press look
        exactly like four that do not, and nothing else on the sheet says so. */
    hint: "اختر منطقة على المخطط لعرض مشاريعها.",

    /** The one control that still navigates — into the filtered rail. */
    showProjects: "عرض المشاريع",

    /**
     * Back to all four. Escape does the same thing.
     *
     * ⚠️ IT WAS «عرض كل المناطق» AND THAT WAS 37px OF LAYOUT SHIFT AT 320px.
     * Beside «عرض المشاريع» the pair overflowed the card's inner width on the
     * narrowest phones and wrapped to a second row, so the card grew by a line
     * the moment an area was selected — measured, 365 → 402. «عرض الكل» fits,
     * and it is the vocabulary the projects filter already uses for exactly
     * this idea (`allRegions.label` = «الكل»), so it costs no clarity.
     */
    clear: "عرض الكل",
  },

  travel: {
    title: "المسافات إلى مركز دمشق",
  },

  /** authored */
  cta: {
    label: "تصفح المشاريع",
    href: "/#projects",
  },
} as const;

export type Location = typeof location;
