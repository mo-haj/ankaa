/* =============================================================================
 * INTERIOR (#interior) — SOVA §5.11.
 *
 * ⚠ The old gallery shows THREE images six times with six different captions —
 * `صالة معيشة` and `تفاصيل المعيشة` are the same file (SOVA §10.3). The six
 * captions are the client's copy and are kept verbatim; the image assignments
 * are NOT reproduced, because pairing one photograph with two different
 * captions is a small lie. Wave 2 renders as many frames as there are real
 * images and no more. SOVA §18 shot 7 asks the photographer for eight.
 * ========================================================================== */

export const interior = {
  kicker: "من الداخل",
  title: {
    a: "تشطيب هادئ،",
    /** gold */
    b: "عملي، وقابل للحياة.",
  },
  lead: "تصور داخلي مبدئي يوضح مستوى الجودة المقترح، وقد تختلف التفاصيل بحسب كل مشروع.",

  /** SOVA §5.11 — the six caption strings, verbatim. */
  captions: [
    "صالة معيشة",
    "غرفة نوم",
    "مطبخ",
    "تفاصيل المعيشة",
    "غرفة رئيسية",
    "مساحة عملية",
  ] as readonly string[],

  /**
   * The three images that actually exist today.
   *
   * `alt` is the live site's own alt text for these exact files — client copy,
   * not authored here. It says `تصورية` where the caption does not, which is
   * the right division of labour: the caption names the room, the alt tells a
   * screen-reader user the picture is a concept render.
   */
  images: [
    {
      src: "/images/living.webp",
      caption: "صالة معيشة",
      alt: "صالة معيشة تصورية",
    },
    {
      src: "/images/bedroom.webp",
      caption: "غرفة نوم",
      alt: "غرفة نوم تصورية",
    },
    { src: "/images/kitchen.webp", caption: "مطبخ", alt: "مطبخ تصوري" },
  ],
  imageWidth: 1448,
  imageHeight: 1086,

  /* `noteBadge` (صور تصورية) sat as a label in front of `note`.
     Removed 2026-08-21 with every other per-image concept badge (operator
     decision — see `site.disclaimer`). `note` below is CLIENT COPY and stays:
     it is a statement about specifications and contracts, not a badge. */
  note: "التصميم النهائي والتشطيبات الفعلية تخضع لمواصفات كل مشروع والعقود المعتمدة.",

  /**
   * THE MATERIALS STRIP — SOVA §18 shot 8, added in wave 2.
   *
   * Both strings AUTHORED: the client wrote no copy for a strip that did not
   * exist. It ships as ONE slot with no material names. Naming the stone, the
   * tile or the hardware before the finish schedule is approved would be
   * inventing a specification — and `مواصفات جيدة` is a claim this section is
   * supposed to *evidence*, not repeat. See `materialSamples` in
   * placeholders.ts for what the client has to send.
   */
  materials: {
    /** authored */
    title: "عينات التشطيب",
    /** authored */
    note: "تنشر عينات مواد التشطيب المعتمدة هنا فور توفرها.",
  },
} as const;
