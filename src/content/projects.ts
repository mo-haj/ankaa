/* =============================================================================
 * PROJECTS (#projects) — SOVA §5.9, and §5.10 for the detail view.
 *
 * ⚠ EVERY RECORD BELOW IS PROVISIONAL AND THE CLIENT SAYS SO.
 * The six names, the unit counts, the stages and the area ranges are the
 * client's own placeholder data — SOVA §9 gaps 3 and 5 — and the site carries
 * a standing disclaimer to that effect (`disclaimer` below, verbatim). They are
 * reproduced here EXACTLY as the old site shipped them, and they are not to be
 * "tidied up", rounded, extended or supplemented. When the real schedule
 * arrives it replaces this array wholesale, and `provisional` flips to false.
 *
 * Areas are Western digits (SOVA §16.7: anything measured stays Western) and
 * every range needs a <bdi> at render time — `85–145` reverses without it
 * (§16.8). The card index `n` ("1".."6") is Western for the same reason: an
 * index is counted.
 *
 * ⛔ 2026-08-22 — `الفردوس 1` AND `الفردوس 2` NOW USE WESTERN DIGITS,
 * BY EXPLICIT OPERATOR DECISION, AND THE ARGUMENT AGAINST IT IS KEPT BELOW SO
 * NOBODY HAS TO REDISCOVER IT.
 *
 * On 2026-08-21 these two were the ONE thing the Western-digit sweep refused
 * to touch, on the rule that a digit inside a CLIENT-SUPPLIED VERBATIM string
 * keeps whatever the client wrote. They are NAMES, hand-typed by the client:
 * the live site's `index.html:197` reads `data-title="الفردوس ١"` and
 * `:200` renders `<h3>الفردوس ١</h3>`. Retyping a project's name is not
 * a formatting change, it is renaming the project. So it was flagged, twice,
 * rather than done.
 *
 * The operator's instruction — "all the numbers should be in English" — was
 * restated on 2026-08-22 with these two named as the outstanding case, so the
 * call has been made by the person entitled to make it. What that means in
 * practice: the rebuild now displays a project name the association has never
 * written down that way. If the client's own paperwork says الفردوس ١,
 * these two strings are where it goes back.
 *
 * The `slug` values (`firdous-1`, `firdous-2`) were always Latin and are
 * unchanged, so no URL moved and nothing needs a redirect.
 *
 * Wave 2 builds the section and `/projects/[slug]`; the content is complete now.
 * ========================================================================== */

import type { Region } from "./regions";

export interface Project {
  /** Latin slug for /projects/[slug]. Authored — not client copy. */
  readonly slug: string;
  readonly n: string;
  readonly title: string;
  readonly region: Region["name"];
  /** Unit count as a number; render Western per §16.7. */
  readonly units: number;
  readonly stage: string;
  /** Area range, verbatim, including the en-dash. Wrap in <bdi>. */
  readonly sizes: string;
  readonly image: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
}

/** Alt-text pattern from SOVA §5.9. */
export function projectImageAlt(title: string): string {
  return `منظور لمشروع ${title}`;
}

export const projects = {
  kicker: "المشاريع الحالية",
  title: {
    a: "ستة مشاريع،",
    /** gold */
    b: "رؤية واحدة.",
  },
  lead: "مرر أفقيا، ثم افتح المشروع لمشاهدة الصورة والتفاصيل في تجربة مقسومة إلى نصفين.",
  hint: "تابع الاستكشاف",
  cardCta: "استكشف",
  disclaimer:
    "جميع الأسماء والمساحات والأرقام المعروضة في النسخة الحالية تجريبية إلى حين اعتماد البيانات الفعلية.",

  /** TRUE until the client approves the real schedule. */
  provisional: true,

  items: [
    {
      slug: "firdous-1",
      n: "1",
      title: "الفردوس 1",
      region: "ضاحية الفردوس",
      units: 96,
      stage: "مرحلة التخطيط",
      sizes: "85–145 م²",
      image: "/images/project-1.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
    {
      slug: "firdous-2",
      n: "2",
      title: "الفردوس 2",
      region: "ضاحية الفردوس",
      units: 72,
      stage: "مرحلة الدراسة",
      sizes: "90–160 م²",
      image: "/images/project-2.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
    {
      slug: "rawabi-fayhaa",
      n: "3",
      title: "روابي الفيحاء",
      region: "الفيحاء",
      units: 84,
      stage: "مرحلة التخطيط",
      sizes: "80–135 م²",
      image: "/images/project-3.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
    {
      slug: "ruba-jamraya",
      n: "4",
      title: "ربى جمرايا",
      region: "جمرايا",
      units: 68,
      stage: "مرحلة الدراسة",
      sizes: "95–170 م²",
      image: "/images/project-4.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
    {
      slug: "bawabat-hama",
      n: "5",
      title: "بوابة الهامة",
      region: "الهامة",
      units: 88,
      stage: "مرحلة التخطيط",
      sizes: "75–130 م²",
      image: "/images/project-5.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
    {
      slug: "hadaeq-fayhaa",
      n: "6",
      title: "حدائق الفيحاء",
      region: "الفيحاء",
      units: 72,
      stage: "مرحلة الدراسة",
      sizes: "85–150 م²",
      image: "/images/project-6.webp",
      imageWidth: 1448,
      imageHeight: 1086,
    },
  ] as readonly Project[],
} as const;

/**
 * SOVA §5.10 — the project detail view. `steps` is an existing, unused process
 * timeline that §11 row 8 promotes to a real section (`#process`); it is kept
 * here because it is where the client wrote it.
 */
export const projectDetail = {
  close: "إغلاق",
  /**
   * authored — the old site had a modal, so there was nothing to go "back" to.
   * `/projects/[slug]` is a real page now and needs a way out that is not the
   * browser button.
   */
  back: "العودة إلى المشاريع",
  /* `conceptLabel` (صور تصورية) was the figcaption chip on the detail
     view's photograph. Removed 2026-08-21 with every other per-image concept
     badge (operator decision — see `site.disclaimer`). */
  summary:
    "مشروع سكني تصوري ضمن منطقة عمل الجمعية، يوازن بين المساحات العملية والواجهة الحجرية والخدمات الأساسية.",
  facts: {
    stage: "المرحلة",
    units: "الوحدات",
    sizes: "المساحات",
  },
  steps: ["الدراسة", "الترخيص", "التنفيذ", "التسليم"] as readonly string[],
  cta: "تواصل حول المشروع",
  note: "المعلومات الحالية تقريبية لأغراض التصميم.",

  /**
   * authored — labels for the three facts a buyer actually opens a project
   * page to find, and which this cooperative has never published: price,
   * instalments, handover. SOVA §5.14's FAQ asks two of them and answers
   * "they will be determined". The detail view names them and renders the
   * honest gap from placeholders.ts rather than pretending they are not
   * questions. Nothing here is estimated.
   */
  pending: {
    title: "تفاصيل تنشر عند اعتمادها",
    price: "السعر",
    instalments: "الأقساط",
    delivery: "التسليم",
  },
} as const;
