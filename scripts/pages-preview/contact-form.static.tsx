/* =============================================================================
 * CI-ONLY SHIM — the enquiry form, on the GitHub Pages preview.
 *
 * ⛔ THIS FILE IS NEVER IMPORTED FROM `src/`. `scripts/pages-preview/apply.mjs`
 * copies it OVER `src/components/sections/contact-form.tsx` inside the Actions
 * runner, immediately before the static export, and nowhere else. Your working
 * tree, `npm run dev` and any server-hosted deploy keep the real 734-line form.
 *
 * WHY IT EXISTS. The real form posts to `submitEnquiry`, a Server Action, and
 * `next build` with `output: "export"` refuses outright:
 *
 *     > Server Actions are not supported with static export.
 *
 * There is no reduced version of a Server Action. A static host has nothing to
 * run it on, so the choice is an honest placeholder or a form that looks live
 * and silently discards what a visitor types. This is the placeholder.
 *
 * ⚠️ IT EXPORTS `ContactForm` AND TAKES NO PROPS, exactly like the real file,
 * so `contact.tsx` is untouched by the swap. Keep that contract if either side
 * changes.
 *
 * ⚠️ THE COPY IS INLINE, breaking the project's own rule that Arabic strings
 * live in `src/content/`. Deliberate: this text describes the PREVIEW, not the
 * product, and putting it in `contact.ts` would ship preview language into the
 * real site's content layer where the next reader would have to work out why.
 *
 * The channels above this block — WhatsApp and email — are real links and DO
 * work here. `contact.tsx` already orders them above the form for exactly this
 * reason, written when the old site's form could not deliver either.
 * ========================================================================== */
export function ContactForm() {
  return (
    <div className="rounded-card border-line bg-veil-05 border p-6 sm:p-8">
      <p className="text-body text-fg font-semibold text-pretty">
        نموذج الطلب غير مُفعَّل في نسخة المعاينة
      </p>
      <p className="text-body-sm text-fg-muted mt-3 max-w-[60ch] text-pretty">
        هذه معاينة ثابتة للموقع، وإرسال النموذج يحتاج إلى خادم. للتواصل الآن
        استخدم واتساب أو البريد الإلكتروني في الأعلى — وكلاهما يعمل.
      </p>
    </div>
  );
}
