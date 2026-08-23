/* =============================================================================
 * ERROR & NOT-FOUND COPY — BRIMSTONE.
 *
 * ⚠ THIS FILE IS THE ONE EXCEPTION TO THE "VERBATIM CLIENT COPY" RULE, AND IT
 * IS ALLOWED FOR EXACTLY ONE REASON: none of it is a fact about the
 * association. It is UI chrome — "the page was not found", "try again" — the
 * same category as `site.skipToContent` and `site.closeMenu`, both of which
 * are already authored. Every string below is marked `// authored`.
 *
 * NOTHING HERE MAY GROW INTO A CLAIM. No phone number to call, no "contact us
 * on …", no promise about when a project page will exist. If a 404 ever wants
 * to say more than "this address does not resolve, here is the way back", the
 * extra sentence is a fact and belongs in `placeholders.ts`.
 *
 * WHY THESE ROUTES EXIST AT ALL: before this file there was no `not-found.tsx`
 * and no `error.tsx` anywhere in `src/app/`. A mistyped URL or a render crash
 * on an `ar` / `rtl` site served Next.js's built-in page — English, LTR,
 * unstyled, with a Latin sans-serif and a left-aligned "404 | This page could
 * not be found". On the launch checklist that is a real bug, not a polish item.
 *
 * Digits (SOVA §16.7): `404` is a protocol code a human may read out or search
 * for, so it is Western, like the areas and the phone numbers. It is not a
 * decorative counter.
 * ========================================================================== */

export const errors = {
  /* ---------------------------------------------------------------------------
   * The whole-site 404 — `src/app/not-found.tsx`. Also what Next renders for
   * ANY unmatched URL, so this is the copy a visitor sees after a bad link,
   * a stale bookmark or a crawler probing for `/wp-admin`.
   * ------------------------------------------------------------------------- */
  notFound: {
    /**
     * authored — THE STATUS CODE, AND IT IS THE PAGE'S LARGEST ELEMENT.
     *
     * It used to be `kicker: "الخطأ 404"` — 13px, weight 600, in
     * `--fg-subtle`, i.e. the quietest thing the system renders, above a 48px
     * heading. The operator asked for the number to be "much bigger and
     * visable", so it stopped being a label and became the display element;
     * `src/app/not-found.tsx` renders it at 96 → 192px and there is no kicker
     * on the page any more, which is why the word «الخطأ» went with it.
     *
     * NOT `aria-hidden`. "404" is the one piece of information on this page
     * that a visitor may need to repeat to someone else, so it is read out
     * before the heading rather than hidden as decoration.
     *
     * Digits: Western, per the note at the top of this file.
     */
    code: "404",
    /** authored — split so the second half can carry the section's one gold. */
    title: { a: "الصفحة التي تبحث عنها", b: "غير موجودة." },
    /** authored */
    lead: "قد يكون عنوان الصفحة قد تغير، أو أن الرابط الذي وصلت منه غير مكتمل. يمكنك العودة إلى الصفحة الرئيسية أو الانتقال إلى أحد أقسام الموقع مباشرة.",
    /** authored */
    home: "العودة إلى الصفحة الرئيسية",
    /** authored */
    sectionsTitle: "أقسام الموقع",
    /** authored — aria-label for the shortcut list. */
    sectionsLabel: "روابط أقسام الموقع",
    /** authored — <title> for the 404 document. */
    metaTitle: "الصفحة غير موجودة",
  },

  /* ---------------------------------------------------------------------------
   * A `/projects/[slug]` that does not resolve, reached by a CLIENT-SIDE
   * navigation — i.e. the intercepted overlay,
   * `src/app/@modal/(.)projects/[slug]/not-found.tsx`.
   *
   * A bad slug typed straight into the address bar does NOT land here: the
   * page segment declares `dynamicParams = false`, so it 404s at the routing
   * layer and the root `notFound` block above answers it. The block at the top
   * of `src/app/projects/[slug]/page.tsx` has the measurement behind that.
   *
   * The lead is NOT an excuse — it is the standing disclaimer that is already
   * on the projects section (`projects.disclaimer`, client copy): the six
   * names are provisional, so a project URL genuinely can stop resolving when
   * the real schedule lands. Saying so is the honest reason a shared link
   * might now 404.
   * ------------------------------------------------------------------------- */
  projectNotFound: {
    /** authored */
    kicker: "المشروع غير موجود",
    /** authored */
    title: { a: "لم نعثر على", b: "هذا المشروع." },
    /** authored */
    lead: "قد يكون الرابط قديما. أسماء المشاريع في النسخة الحالية تجريبية وقابلة للتغيير حتى اعتماد البيانات الفعلية، ومعها تتغير عناوين صفحاتها.",
    /** authored */
    listTitle: "المشاريع المعروضة حاليا",
    /** authored — aria-label for the list of project links. */
    listLabel: "قائمة المشاريع",
    /** authored */
    metaTitle: "المشروع غير موجود",
  },

  /* ---------------------------------------------------------------------------
   * The client error boundary — `src/app/error.tsx`.
   *
   * ⛔ THE MESSAGE IS NEVER SHOWN. In production Next replaces a Server
   * Component's error message with a generic one precisely so nothing
   * sensitive leaks, but a Client Component error keeps its ORIGINAL message —
   * which can be a stack-shaped English string, or worse. The visitor gets
   * this copy plus `error.digest`, which is a hash and is the only thing that
   * usefully joins a visitor's report to a server log line.
   * ------------------------------------------------------------------------- */
  error: {
    /** authored */
    kicker: "خطأ غير متوقع",
    /** authored */
    title: { a: "تعذر عرض", b: "هذه الصفحة." },
    /** authored */
    lead: "حدث خطأ غير متوقع أثناء عرض هذه الصفحة. يمكنك إعادة المحاولة، وإن تكرر الأمر فعد إلى الصفحة الرئيسية.",
    /** authored */
    retry: "إعادة المحاولة",
    /** authored */
    home: "العودة إلى الصفحة الرئيسية",
    /** authored — precedes the digest hash. */
    digestLabel: "رمز الخطأ",
    /** authored — <title> for the error document (WCAG 2.4.2). */
    metaTitle: "تعذر عرض الصفحة",
  },

  /* ---------------------------------------------------------------------------
   * The last-resort boundary — `src/app/global-error.tsx`.
   *
   * It REPLACES the root layout, so it has no header, no footer, no fonts and
   * no globals.css. Its copy is therefore shorter than `error` above: this is
   * the screen for "the shell itself failed", and the only thing it can
   * honestly offer is a retry and a reload.
   * ------------------------------------------------------------------------- */
  globalError: {
    /** authored */
    title: "تعذر تحميل الصفحة",
    /** authored */
    body: "حدث خطأ غير متوقع أثناء تحميل الموقع. يرجى إعادة المحاولة.",
    /** authored */
    retry: "إعادة المحاولة",
    /** authored */
    home: "الصفحة الرئيسية",
    /** authored */
    digestLabel: "رمز الخطأ",
  },
} as const;

export type Errors = typeof errors;
