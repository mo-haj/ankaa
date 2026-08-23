/* =============================================================================
 * CONTACT (#contact) — SOVA §5.16.
 *
 * Two of the old site's strings are internal to-do notes that leaked into the
 * user interface:
 *
 *   · the phone field's placeholder reads `يُضاف رقم التواصل الفعلي لاحقًا`
 *     ("the real contact number will be added later") — that is a message to
 *     the developer sitting inside a form field the visitor is meant to type in
 *   · the submit button's LABEL reads `إرسال الطلب بعد إضافة بيانات التواصل`
 *     ("send the request after the contact details are added")
 *
 * Both are preserved verbatim under `clientNotes` because they are evidence of
 * what is missing, and both are replaced in the UI by authored strings that do
 * the job the element actually has. The missing number itself lives in
 * placeholders.ts (`phone`, `whatsapp`), which is what makes the difference
 * between "an honest gap" and "a to-do note shipped as copy".
 *
 * The form is a wave 2 build (Server Action, per SOVA §9 #6 — the old one is
 * `onsubmit="return false"` with a disabled button and sends nothing).
 * ========================================================================== */

export const contact = {
  kicker: "تواصل معنا",
  title: {
    a: "ربما يبدأ منزلك القادم",
    /** gold */
    b: "من سؤال بسيط.",
  },
  lead: "أرسل طلبا مبدئيا للاستفسار عن الانتساب والمناطق والأقساط وتحديثات المشاريع.",

  trust: {
    a: "جمعية سكنية مرخصة",
    b: "ضمن الإطار التعاوني المنظم",
  },

  form: {
    name: { label: "الاسم الكامل", placeholder: "اكتب اسمك" },
    phone: {
      label: "رقم الهاتف",
      /**
       * authored — REWRITTEN 2026-08-22 with the split. It used to read
       * «اكتب رقم هاتفك», which was fine for a field that took anything and
       * is now under-specified: the country code moved out, so what belongs
       * here is the national number and nothing else. The example is a real
       * Syrian mobile SHAPE, not a real number, and it teaches the two things
       * the field now needs — digits only, and the leading 0 is optional
       * (`stripTrunk` removes it either way).
       */
      placeholder: "9XX XXX XXX",
    },
    region: { label: "المنطقة المطلوبة", placeholder: "اختر المنطقة" },
    type: {
      label: "نوع الاستفسار",
      options: [
        "الانتساب",
        "مشروع محدد",
        "الأقساط",
        "استفسار عام",
      ] as readonly string[],
    },
    // authored — replaces a to-do note that shipped as a button label.
    submit: "إرسال الطلب",

    /**
     * ⛔ THIS NOTICE IS NOW A PAIR, AND THE CODE PICKS WHICH ONE IS TRUE.
     *
     * It used to be one string: «النموذج تجريبي ولا يرسل بيانات في النسخة
     * الحالية.» That was exactly right for eleven months and became A LIE on
     * 2026-08-22, the moment `deliverEnquiry()` was implemented — the form
     * now really does send, and a notice saying otherwise would be the same
     * class of error as claiming a receipt that never happened, pointed the
     * other way.
     *
     * IT COULD NOT SIMPLY BECOME "yes, it sends" EITHER, because of where it
     * sends: `contactDelivery` is currently the OPERATOR'S personal inbox,
     * marked `testData`, not the association's. Telling a visitor their
     * details reached the association would be false.
     *
     * So `<ContactForm>` reads `isTestData(contactDelivery)` and renders
     * whichever line is true. Resolve the fact for real — a monitored inbox
     * on the association's domain, `testData` deleted — and `live` starts
     * rendering by itself. NOTHING ELSE HAS TO BE REMEMBERED.
     */
    note: {
      /** While the destination is still test data. */
      testing:
        "النموذج قيد الاختبار: يرسل الطلب إلى بريد تجريبي وليس إلى بريد الجمعية.",
      /** Once a real association inbox is configured. */
      live: "يصل الطلب إلى بريد الجمعية. لا تحفظ بياناتك على الموقع.",
    },

    /**
     * authored — the honeypot's label. It is real text on a real <input> that
     * is removed from the accessibility tree and from the tab order; a person
     * never meets it, a naive bot fills it, and the action drops the request.
     * No CSS-only `display:none` trap: some password managers autofill those.
     */
    honeypot: "اترك هذا الحقل فارغا",

    /** authored — <SubmitButton> while the action is in flight. */
    sending: "جاري الإرسال…",

    /**
     * authored — field-level validation messages. They say what to do, not
     * what went wrong: an Arabic form that answers «غير صالح» tells the
     * visitor nothing about which of the two numbers he typed was rejected.
     */
    errors: {

      name: "اكتب الاسم الكامل.",
      phone: "اكتب رقم هاتف يمكن التواصل عبره.",
      region: "اختر إحدى مناطق عمل الجمعية.",
      type: "اختر نوع الاستفسار.",
    },

    /**
     * authored — the three outcomes of the Server Action.
     *
     * ⛔ `sent` IS UNREACHABLE TODAY AND MUST STAY THAT WAY UNTIL A MESSAGE
     * ACTUALLY LEAVES THE SERVER. It is returned only when
     * `deliverEnquiry()` reports success, which it cannot do while
     * `placeholders.contactDelivery` is null. Do not return it optimistically,
     * do not return it "for the demo", and do not soften `notConnected` into
     * something that sounds like a receipt.
     */
    result: {
      invalid: "راجع الحقول المعلمة ثم أعد الإرسال.",
      /**
       * authored — the rate limiter tripped (`src/lib/rate-limit.ts`).
       *
       * It says WHAT happened and that the request was not sent, and it does
       * not name a number of minutes: the window is a constant in code and a
       * copy string that promises "خلال ١٠ دقائق" would go stale the moment
       * anyone tunes it.
       */
      tooMany:
        "أرسلت عدة طلبات خلال وقت قصير، ولم يرسل هذا الطلب. يرجى المحاولة بعد قليل.",
      /**
       * authored — REWRITTEN 2026-08-22, THE DAY THE TRANSPORT SHIPPED.
       *
       * It used to read «لم يرسل الطلب. لا يوجد حتى الآن عنوان استقبال
       * معتمد لدى الجمعية…» — which was exactly true while there was no
       * destination and no provider, and became a GUESS the moment there was.
       * `notConnected` is now returned for three different causes: no API key
       * configured, no destination configured, or a provider that refused the
       * send. Naming only the second one would tell a visitor something false
       * about the association in the two cases where the fault is ours.
       *
       * So it states only what is certainly true — not sent, nothing kept —
       * and then does the one useful thing available: points at the channels
       * directly above it, which DO work.
       */
      notConnected:
        "لم يرسل الطلب، ولم تحفظ البيانات التي كتبتها. يمكنك التواصل مباشرة عبر واتساب أو البريد الإلكتروني.",
      /**
       * ⛔ REACHABLE SINCE 2026-08-22, AND THEREFORE A PROMISE.
       * Returned only when Resend confirms it accepted the message. While
       * `contactDelivery` is test data the notice above the form has already
       * told the visitor where it goes, so this stays a plain receipt rather
       * than repeating the caveat inside a success message.
       */
      sent: "وصل طلبك إلى الجمعية.",

      /**
       * authored — the WhatsApp follow-up, shown UNDER the receipt above and
       * only when that receipt is true (2026-08-22, operator request).
       *
       * ⛔ THE WORDING CARRIES THE WHOLE HONESTY OF THIS FEATURE. Nothing is
       * sent when the visitor taps it: `wa.me` opens THEIR WhatsApp with the
       * text already typed and they press send. So `prompt` asks a question
       * and `cta` says «متابعة» — "follow up" — and neither of them says the
       * request will be sent again, because tapping it sends nothing.
       *
       * A label like «أرسل عبر واتساب» was rejected for exactly that reason:
       * a visitor who taps it and then closes WhatsApp without pressing send
       * would believe they had done something they had not.
       */
      whatsapp: {
        prompt: "يمكنك متابعة طلبك مباشرة عبر واتساب:",
        cta: "متابعة عبر واتساب",
        /**
         * The first line of the draft. It is what the ASSOCIATION reads, not
         * the visitor, and it names the source so a message arriving in a
         * personal WhatsApp is not mistaken for one.
         */
        draftTitle: "طلب من موقع جمعية العنقاء السكنية",
      },
    },
  },

  /**
   * authored — the direct contact channels. They are no longer a sidebar
   * beside the form: they are the band's first block, ABOVE it. See the header
   * of `contact.tsx` for why that order is the honest one.
   *
   * ⛔ `hours` («أوقات الدوام») WAS DELETED 2026-08-21 — operator decision,
   * here and in the footer. The `contact.officeHours` fact stays in
   * placeholders.ts (it is still something the association has not supplied);
   * what went is the row that rendered «the opening hours will be added» in two
   * places. If the hours ever arrive, a row has to be added back — setting the
   * placeholder's `value` alone will no longer show them anywhere.
   */
  channels: {
    title: "قنوات التواصل",
    phone: "الهاتف",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    facebook: "فيسبوك",
    instagram: "إنستغرام",
    address: "العنوان",
  },

  /** authored — heading over the enquiry form, under the channels. */
  formTitle: "أو أرسل طلبا مبدئيا",

  /* ⛔ `privacy` IS DELETED, AND HERE IS WHAT IT WAS — operator decision,
     2026-08-21, on the look of the band.

     It was `{ label: "ما الذي يجمعه هذا النموذج", href: "/privacy" }`,
     rendered as a <FieldDescription> link beside the submit button, on the
     SOVA §9 #17 argument that a form collecting a name and a phone number
     should say what it collects AT THE POINT OF COLLECTION and not only in the
     footer.

     ⚠️ THAT ARGUMENT DID NOT GO AWAY WITH THE LINK. `/privacy` still exists
     and is still linked from the footer's documents list, so the page is
     reachable — it is one screen further away, at the foot of a ~19,000px
     page. FLAGGED TO THE OPERATOR rather than quietly reinstated: if the
     answer is that the link belongs back on the form, this object is the
     whole change, plus five lines in `contact-form.tsx`.

     `conceptLabel` («صورة تصورية») is deleted too, with every other
     per-image concept badge — see the block on `site.disclaimer`. */
  background: {
    src: "/images/night.webp",
    width: 1672,
    height: 941,
    alt: "منظور ليلي للمبنى",
  },

  /** Verbatim client strings that are to-do notes, not copy. Not rendered. */
  clientNotes: {
    phonePlaceholder: "يضاف رقم التواصل الفعلي لاحقا",
    submitLabel: "إرسال الطلب بعد إضافة بيانات التواصل",
  },
} as const;

/**
 * SOVA §5.17 — the floating WhatsApp button. STILL NOT SHIPPED.
 *
 * ⚠️ Its condition used to read "ships only once the number does", and as of
 * 2026-08-21 a WhatsApp number IS resolved — but it is the operator's TEST
 * number, not the association's (see the block on `whatsapp` in
 * placeholders.ts). A button that follows a visitor down every screen of the
 * page is a much louder commitment than a row in the contact band, so the real
 * condition is now: ships once the ASSOCIATION'S OWN number does, i.e. once
 * `testDataFacts()` is empty.
 */
export const whatsappButton = {
  label: "واتساب",
  cta: "تواصل معنا",
} as const;
