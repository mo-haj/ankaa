/* =============================================================================
 * UNIT TYPES & PLANS (#plans) — SOVA §11 row 6.
 *
 * =============================================================================
 * ⛔ THIS SECTION WAS REBUILT ON 2026-08-22 AND THE OLD STANDING ORDER IS DEAD.
 * =============================================================================
 * It used to open with: "There is NO unit schedule … ⛔ Nothing in this section
 * may be filled in from anywhere except the client, in writing. Not from the
 * .dwg by reading it." That rule was written when `art66.dwg` was an opaque
 * 13.8 MB binary nobody could open, and its real content was "do not invent a
 * schedule to fill the gap".
 *
 * THE GAP IS CLOSED, AND NOT BY INVENTION. The operator converted the file to
 * DXF on 2026-08-22. It is the association's own architectural drawing for
 * plot D-66, and it carries a complete unit schedule the association wrote
 * itself: five apartments per floor, an area and an orientation recorded in
 * each of FIFTY apartment-allocation title blocks, and the drawn plate they
 * sit in. `scripts/extract-floor-plan.py` reads it into
 * `content/floor-plan.generated.ts`; that script's header documents every
 * cross-check, including the two that make it refuse to emit rather than
 * guess. Reading the client's own drawing is not the thing the old rule
 * forbade — it is the client, in writing, in the most literal sense available.
 *
 * ⛔ WHAT THE OLD RULE STILL FORBIDS, VERBATIM AND FOREVER: a number here that
 * is not IN the drawing. No price. No delivery date. No "typical Syrian
 * 3-room flat". No rounding 114 to 115 because it reads better.
 *
 * =============================================================================
 * WHY THIS IS NOT THE PROJECTS SECTION AGAIN — THE OPERATOR'S QUESTION
 * =============================================================================
 * The operator's objection to the old version was exact: "it's just a
 * duplication of the projects, same information". It was. The old section
 * listed the six projects with their area ranges — the same six rows the rail
 * above already shows, linking to the same six pages.
 *
 * The two sections now answer different questions and share no data:
 *
 *   المشاريع        WHERE      six locations across four areas. Names, unit
 *                              counts and area ranges that `projects.ts`
 *                              marks `provisional: true` — the client's own
 *                              placeholder data, disclaimed on the page.
 *   المساحات والمخططات  WHAT      one building, drawn. Five apartment types,
 *                              their real areas, orientations and room
 *                              programmes, and the architect's plate with
 *                              every wall, door and window in it.
 *
 * There is a sharp inversion in there worth stating out loud: the projects
 * rail is provisional placeholder data, and this section is the only place on
 * the site showing something the association has actually built a drawing of.
 * Do not "harmonise" the two. The area ranges above are not these areas.
 *
 * ⛔ AND DO NOT ATTACH THIS PLAN TO ONE OF THE SIX PROJECTS. The drawing names
 * its plot, D-66, and says nothing about which project that is. `planProject`
 * in placeholders.ts is that open question, rendered on the page as a gap.
 *
 * Every string below is AUTHORED — the client wrote no copy for a section that
 * did not exist. The room names, the areas, the orientations and the plot
 * number are NOT authored: they are transcribed, and they live in
 * `floor-plan.generated.ts`, not here.
 * ========================================================================== */

export const units = {
  /** authored — unchanged, `#plans` and the nav label both depend on it. */
  kicker: "المساحات والمخططات",

  /** authored */
  title: {
    a: "الطابق النموذجي،",
    /** gold — the section's one gold element. See the note in unit-types.tsx. */
    b: "كما رسمه المعماري.",
  },

  /**
   * authored. «معلنة» (declared), not «نهائية» (final) — the areas are what the
   * allocation sheets record, and `notes.status` carries the caveat in full.
   */
  lead: "خمس شقق في كل طابق، بمساحات معلنة من 114 إلى 137 م². المخطط أدناه مستخرج من الملف المعماري للجمعية؛ اختر أي شقة لعرض غرفها واتجاهها.",

  /** authored — the drawing itself. */
  plan: {
    /** Names the <figure> for assistive tech. */
    label: "مخطط الطابق النموذجي",
    /**
     * Discoverability. Five regions that respond to a press look exactly like
     * five that do not — the same lesson `regions-schematic.tsx` learned.
     */
    hint: "اختر شقة على المخطط لعرض تفاصيلها.",
    /** Back to all five. Escape does the same thing. */
    clear: "عرض كامل الطابق",
    /**
     * ⛔ NORTH IS THE DRAWING'S LEFT AND THAT IS MEASURED, NOT ASSUMED. See the
     * header of `floor-plan.generated.ts` for the derivation from the five
     * recorded orientations. A compass here is honest precisely because the
     * architect wrote the orientations down — unlike the regions schematic,
     * where a compass is forbidden for exactly the opposite reason.
     */
    north: "شمال",
    /** Completes each region's aria-label: «الشقة 4 — عرض تفاصيل الشقة». */
    selectAction: "عرض تفاصيل الشقة",
    /** The idle-state caption under the drawing. */
    idle: "خمس شقق حول بهو وسطي ودرج واحد.",
  },

  /** authored — the row labels in the selected-apartment card. */
  fields: {
    apartment: "الشقة",
    area: "المساحة الفعلية",
    orientation: "الاتجاه",
    rooms: "التوزيع",
    /**
     * ⚠️ SHORT ON PURPOSE. These two sit on one line inside the apartment card,
     * which is height-locked so a selection cannot shove the list underneath
     * it. «المساحة في القبو» and «الحديقة الملحقة» wrapped that line to two
     * rows at 320px and pushed the lock from 9.5rem to 15.75rem — 159px of
     * dead card on every phone, to hold room for four words. The card is
     * already titled «الشقة 4», so «القبو» is unambiguous inside it, and
     * `notes.basement` carries the full explanation once, in the section.
     */
    basement: "القبو",
    garden: "حديقة ملحقة",
    unit: "م²",
  },

  /** authored — the list beside the drawing. */
  listLabel: "نماذج الشقق في الطابق النموذجي",

  /* ===========================================================================
   * THE BAND ON THE HOME PAGE, AND THE PAGE IT OPENS — 2026-08-23.
   * ===========================================================================
   * The drawing moved off `/` to `/plans/d-66`. The operator's objection was
   * about weight and it was measured: the section was 1,748px on desktop and
   * 2,749px on a phone — 15.4% of the whole page and 3.3 screens, the largest
   * single section on the site, larger than the projects rail, which is the
   * part a visitor is actually shopping in.
   *
   * ⛔ IT IS NAMED FOR THE PLOT, NOT FOR A PROJECT, AND THAT IS THE WHOLE
   * REASON THE URL LOOKS LIKE THAT. The operator's first instinct was to hang
   * the plan inside a project's overlay, which is the right home the day the
   * client says which project plot D-66 is — and a false claim until then,
   * because placement asserts what a disclaimer cannot walk back. `/plans/d-66`
   * is true today: it is the drawing for a plot, and it says so. When the
   * mapping arrives, a project links to it; nothing here has to move.
   * ======================================================================== */

  /** authored — the compact band left behind on `/`. */
  band: {
    /**
     * Shorter than `lead`, which the page itself now carries. This one has one
     * job: say what is behind the button, in one line, without repeating the
     * areas that are listed as chips directly underneath it.
     */
    lead: "خمس شقق في كل طابق، مستخرجة من الملف المعماري للجمعية.",
    /** The band's one control. */
    cta: "استعرض المخطط",
    /** Names the preview for assistive tech. It is not the drawing itself. */
    previewLabel: "لمحة من مخطط الطابق النموذجي",
    /** Names the row of five area chips. */
    areasLabel: "مساحات الشقق في الطابق النموذجي",
  },

  /* ===========================================================================
   * THE LINK INTO THE PLAN FROM A PROJECT — operator, 2026-08-23.
   * ===========================================================================
   * "u can link this D-66 to every project for now and if we have new one
   * later we can just change what is inside this plan page."
   *
   * ⛔ EVERY PROJECT, OR NONE — AND THAT IS WHAT MAKES IT HONEST. The concern
   * with putting this drawing behind a project was that placement asserts
   * ownership: a plan inside الفردوس ١'s panel says "this is الفردوس ١", and
   * the drawing does not say that. A link that appears on ALL SIX asserts
   * nothing of the kind — it says the association has a drawing, and here it
   * is. ⛔ Do not make this conditional on the project until `planProject` is
   * answered; six identical links are honest, one is a claim.
   *
   * `note` does the rest of the work: it says out loud that this is a sample
   * and that the project's own plan follows. That sentence is the price of the
   * link and it is not optional.
   * ======================================================================== */
  fromProject: {
    /**
     * The link, and the tile's whole accessible name.
     *
     * ⛔ THERE IS NO «المخططات» SECTION LABEL ANY MORE — removed 2026-08-23
     * when the row became a tile. An overline naming the block was worth its
     * 36px while the affordance was a line of text that needed introducing;
     * with the drawing itself sitting in the tile the label was saying
     * "plans" directly above a picture of a plan and the words «مخطط الطابق
     * النموذجي». Put it back and you are labelling a label.
     */
    label: "مخطط الطابق النموذجي",
    /**
     * ⚠️ NO PLOT CODE IN THIS SENTENCE, ON PURPOSE. «D-66» is Latin and
     * numeric and would need `<bdi>` isolation mid-paragraph (SOVA §16.8); the
     * plot is named properly on the plan page itself, next to the gap it
     * belongs beside. Here the useful fact is the caveat, not the code.
     */
    note: "مخطط نموذجي من الملف المعماري للجمعية — يضاف مخطط هذا المشروع عند اعتماده.",
  },

  /** authored — `/plans/d-66`. */
  page: {
    /** Back to the band that sent them. */
    back: "العودة إلى الصفحة الرئيسية",
    /** <title> and the meta description. Not shown on the page. */
    metaTitle: "مخطط الطابق النموذجي — المقسم D-66",
    metaDescription:
      "الطابق النموذجي لمقسم D-66: خمس شقق بمساحات من 114 إلى 137 م²، باتجاهاتها وتوزيع غرفها، مستخرجة من الملف المعماري للجمعية.",
  },

  /* ===========================================================================
   * THE 3D MODEL AT THE TOP OF `/plans/d-66` — 2026-08-23.
   * ===========================================================================
   * `public/images/plan-d-66-model.webp`, generated from
   * `exports/floor-plan-3000.png` — the coloured plate this site draws from the
   * DXF — so the walls in the render are the association's own walls and not a
   * stock apartment. The corridor, the lift bank, the stair and the five
   * apartments are all where the drawing puts them.
   *
   * ⛔ AND THE FURNITURE IS INVENTED, WHICH IS WHY `caption` IS NOT OPTIONAL.
   * No finish schedule exists. Every sofa, floor, worktop and colour in that
   * image is a guess made by an image model, and the one thing this site does
   * not do is let a guess pass as a specification — `art66.jpg` is banned from
   * publication for exactly that reason (it is an AI picture of a DIFFERENT
   * building, ~20% wall match, measured). This render is allowed where that one
   * is not because its geometry is derived from the real file, and the sentence
   * below is the price of the difference. ⛔ Do not render the image without it.
   *
   * ⛔ IT LIVES ON THE PLAN PAGE AND NOWHERE ELSE. Put it in a project panel
   * and placement turns "a floor from the association's file" into "this is
   * what الفردوس ١ looks like inside", which nobody has confirmed — the same
   * trap the plan link itself is built to avoid. See `fromProject` above.
   *
   * ⚠️ NO PLOT CODE IN THE CAPTION, same as `fromProject.note`: «D-66» is Latin
   * and numeric and would need `<bdi>` isolation mid-sentence (SOVA §16.8). The
   * plot is named properly in the metadata table further down the page.
   * ======================================================================== */
  model: {
    /** The honest sentence. Renders directly under the image. */
    caption:
      "الجدران والغرف في المجسّم مطابقة للمخطط المعماري للجمعية. أما الأثاث والتشطيبات والألوان فهي تصوّر توضيحي، وليست مواصفات معتمدة.",
    /**
     * `alt`, and it describes the LAYOUT rather than the styling — a screen
     * reader user needs the same fact a sighted visitor takes from the image
     * (five apartments around a central corridor), not a list of the sofas.
     */
    alt: "مجسّم ثلاثي الأبعاد للطابق النموذجي: خمس شقق موزّعة حول ممر مركزي، بغرفها وأثاثها.",
  },

  /** authored — the building, floor by floor. */
  stack: {
    title: "الطوابق",
    /**
     * 10 levels x 5 apartments = 50, and that is not arithmetic on an
     * assumption: the DXF contains exactly FIFTY allocation title blocks, one
     * per apartment, and their الطابق fields read القبو + الأرضي + الأول…الثامن,
     * five of each.
     */
    levels: [
      { name: "القبو السكني", note: "خمس شقق بحدائق ملحقة" },
      { name: "الطابق الأرضي", note: "خمس شقق" },
      { name: "الطوابق المتكررة", note: "من الأول إلى الثامن — خمس شقق لكل طابق" },
    ],
    totalLabel: "مجموع الشقق في البناء",
    total: "50",
    floorsLabel: "عدد الطوابق",
    floors: "10",
  },

  /** authored — the drawing's own metadata, and the one thing still missing. */
  meta: {
    plotLabel: "المقسم",
    projectLabel: "المشروع",
  },

  /** authored — the caveats. Three, and each says something different. */
  notes: {
    source:
      "المساحات أعلاه هي «المساحة الفعلية» المدونة في بطاقات تخصيص الشقق ضمن الملف المعماري للجمعية.",
    status:
      "المخطط معروض للاطلاع، وقد تطرأ عليه تعديلات قبل الاعتماد النهائي.",
    basement:
      "شقق القبو تختلف في مساحاتها وتلحق بها حدائق خاصة؛ التفاصيل تظهر مع كل شقة.",
  },

  /** authored */
  cta: {
    label: "استفسر عن المساحات والمخططات",
    href: "/#contact",
  },
} as const;

export type Units = typeof units;
