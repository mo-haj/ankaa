"use client";

import { ChevronDown, LoaderCircle, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitEnquiry } from "@/app/actions/contact";
import { FactText } from "@/components/content/fact";
import { useReducedMotion } from "@/components/motion/motion-env";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { contact } from "@/content/contact";
import { SYRIA_DIAL_CODE } from "@/content/dial-codes";
import {
  contactDelivery,
  isResolved,
  isTestData,
  whatsapp,
} from "@/content/placeholders";
import { regions } from "@/content/regions";
import {
  ENQUIRY_KEY_FIELD,
  HONEYPOT_FIELD,
  initialEnquiryState,
} from "@/lib/enquiry";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <ContactForm> — the enquiry form. SOVA §11 row 13.
 *
 * The ONLY client component in wave 3. It exists for three reasons and no
 * others: `useActionState` for the result, `useFormStatus` for the pending
 * label, and `aria-invalid`/`aria-describedby` wiring that has to follow the
 * action's response. Everything around it is a Server Component.
 *
 * NO-JS: this is a plain `<form action={formAction}>`. React posts it to the
 * Server Action natively, so the form submits, validates and reports without a
 * line of client JavaScript running. The pending label is the only thing that
 * degrades.
 *
 * ⛔ READ `src/app/actions/contact.ts` BEFORE CHANGING THE RESULT STATES.
 *
 * ⚠️ THIS BLOCK USED TO SAY `sent` WAS UNREACHABLE. It was, for eleven months,
 * and it stopped being true on 2026-08-22 when `deliverEnquiry()` shipped. The
 * rule did not loosen when that happened, it INVERTED: `sent` now means an
 * email really left the server, so nothing in this component may render the
 * `sent` branch — the receipt, or the WhatsApp follow-up under it — from any
 * other state. `state.status === "sent"` is the only permission slip, and the
 * action grants it only on the transport's word.
 *
 * The notice above the fields is still placed BEFORE the inputs rather than
 * under the button, so nobody types a phone number to find out where it goes.
 * It is now a PAIR of sentences with the code choosing the true one — see the
 * block on it further down, and `form.note` in `content/contact.ts`.
 *
 * shadcn `field`, not `form`: `shadcn add form` writes nothing in v4
 * (AGENTS §4). The field primitives already speak the shadcn semantic layer,
 * which `<Section theme="dark">` remaps — so this whole form is correct on the
 * dark contact band with no `onDark` prop and no overrides.
 *
 * NEON (SOVA §15.3, "Form fields"): Framer owns this — it is state-driven, not
 * scroll-driven. `[data-enquiry-form]` is the root, each `[data-slot="field"]`
 * is a target. The submit button already swaps its label from `useFormStatus`;
 * animate around that, do not replace it.
 *   → DONE, and nothing about the action, the validation or the a11y wiring
 *     moved: the submit label cross-fades and gains a spinner, validation
 *     messages rise instead of appearing, and the outcome region animates its
 *     CONTENTS while the `role="status"` element itself stays mounted. No
 *     ScrollTrigger touches anything inside this form — a scrubbed field is
 *     unusable, and §15.1 forbids it anyway.
 *
 *     Field FOCUS is left to CSS. <Input> already transitions its border on
 *     `:focus-visible` and ASTRA's 2px gold ring is the indicator; a Framer
 *     layer on top of a focus ring is two systems drawing one affordance, and
 *     the CSS one is correct before hydration. There is no floating label in
 *     this design to lift.
 * -------------------------------------------------------------------------- */

/**
 * Matches <Input> exactly — same height, radius, border and 17px body size —
 * because a select that does not look like the field above it reads as a
 * different kind of control.
 *
 * `appearance-none` removes the native arrow, which paints its own light
 * chrome on a dark ground and cannot be themed. The replacement is the
 * <ChevronDown> below: `pointer-events-none`, at the inline-END, so it mirrors
 * with the document. `pe-11` reserves its space — without that a long region
 * name runs underneath the icon.
 */
const SELECT_CLASSES = [
  "rounded-field border-line-strong h-12 w-full min-w-0 border bg-transparent ps-4 pe-11 py-2",
  "text-body text-fg font-body appearance-none",
  "transition-[border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]",
  "hover:border-fg/35",
  "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "aria-invalid:border-destructive",
];

/* -----------------------------------------------------------------------------
 * NEON — the submit state, in Framer (SOVA §15.3, "Form fields").
 *
 * The label swap was already driven by `useFormStatus`; this animates AROUND
 * it rather than replacing it, exactly as the brief asks. Two details:
 *
 *   · the two labels cross-fade in place with `mode="wait"`, so the button
 *     never flashes empty and never mutates its label in place;
 *   · the spinner keeps turning under `prefers-reduced-motion`, at a third of
 *     the rate. A pending control with no indicator at all is worse than a
 *     slow one, and this is the one place on the page where motion is
 *     carrying information rather than character.
 *
 * `aria-live` is deliberately absent here: the outcome region at the foot of
 * the form is the announcement, and two live regions for one submit is noise.
 * -------------------------------------------------------------------------- */
function SubmitButton() {
  const { pending } = useFormStatus();
  const reduced = useReducedMotion();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={pending ? "sending" : "idle"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2"
        >
          {pending ? (
            <motion.span
              aria-hidden
              className="inline-flex"
              animate={{ rotate: 360 }}
              transition={{
                duration: reduced ? 2.4 : 0.9,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              <LoaderCircle className="size-4" />
            </motion.span>
          ) : null}
          {pending ? contact.form.sending : contact.form.submit}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

/**
 * NEON — a validation message arriving instantly reads as a jolt on a form
 * this quiet. It rises 4px over 0.24s instead, and `AnimatePresence` keeps the
 * element mounted through its exit so a corrected field does not snap shut.
 * <FieldError> itself is untouched, so the `id` / `aria-describedby` wiring
 * JETT built still holds.
 */
function ErrorReveal({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <FieldError id={id}>{children}</FieldError>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * A fresh idempotency key. `randomUUID` needs a secure context, which every
 * origin this ships on has, and the fallback keeps a `file://` preview or an
 * unusual embed working rather than sending an empty key.
 */
function newEnquiryKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * How long an unchanged form refuses to re-post.
 *
 * It is not a rate limit and it is not about the server. It is the window in
 * which a second click means "did that work?" rather than "send another one" —
 * and inside it, the answer is that the first request is still the only
 * enquiry. Past it, a deliberate retry is allowed through carrying THE SAME
 * key, so the transport can tell it is the same enquiry arriving twice.
 */
const REPEAT_COOLDOWN_MS = 2000;

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitEnquiry,
    initialEnquiryState,
  );
  const uid = useId();

  /* ---------------------------------------------------- the double-submit
     ⛔ `disabled={pending}` DOES NOT STOP THIS, and VIPER measured it: four
     clicks produced FOUR POSTs at every gap tested — 40ms, 150ms, 300ms and
     600ms — and at 40ms the button never even reported `disabled`. React's
     `useFormStatus` is state: it lands a render later, and the browser will
     happily dispatch three more submits inside that gap.

     It is latent TODAY only because `deliverEnquiry()` is unimplemented and
     every one of those four POSTs returns the honest `notConnected`. The day
     the transport lands (client blocker #3) the same four clicks become four
     identical enquiries in the association's inbox. Fixing it after that
     means fixing it in production.

     A ref is part of the fix because a ref is SYNCHRONOUS: it is set inside
     the submit event itself, before the browser can dispatch another one, and
     no render has to happen in between.

     ⛔ BUT THE REF ALONE IS NOT ENOUGH, AND THE FIRST VERSION OF THIS PROVED
     IT. Against a local server each submit settles in well under 150ms, so at
     every gap of 150ms and above the guard had already cleared and four clicks
     still sent FOUR POSTs — measured, not assumed. "In flight" is the wrong
     question. The right one is WHETHER THIS IS THE SAME ENQUIRY, and the
     idempotency key is what answers it:

       · the key rotates when the form's VALUES CHANGE, not when a response
         settles — so clicking submit again without touching anything is, by
         definition, the same enquiry;
       · a submit whose key was already sent inside `REPEAT_COOLDOWN_MS` is
         dropped here and never reaches the network;
       · a deliberate retry after that window goes through WITH THE SAME KEY,
         so `deliverEnquiry()` can recognise it (see `enquiry-transport.ts`).

     Rotating on settle — which is what this did first — is exactly backwards:
     it gave each of the four duplicate POSTs a DIFFERENT key and made them
     undedupable at the only layer that could still catch them. */
  const inFlight = useRef(false);
  const keyField = useRef<HTMLInputElement>(null);
  const lastSent = useRef<{ key: string; at: number } | null>(null);

  /* ⛔ THE REF IS THE KEY. THE HIDDEN INPUT IS ONLY HOW IT TRAVELS.
     React 19 calls `form.reset()` itself once a form action settles, which
     puts every uncontrolled field back to its `defaultValue` — including the
     hidden key, which snapped back to the SSR placeholder after every submit.
     Measured: that alone let the SECOND of four clicks through (2 POSTs, not
     1), because its key no longer matched the one just sent. Keeping the value
     in a ref and writing it into the field inside `onSubmit` — which runs
     before React collects the FormData, the same ordering `preventDefault()`
     already depends on — makes the reset irrelevant. */
  const enquiryKey = useRef("");

  useEffect(() => {
    if (!isPending) inFlight.current = false;
  }, [isPending, state]);

  useEffect(() => {
    /* SSR renders a deterministic `${uid}-0` so hydration matches; this is the
       first rotation, on mount, once randomness is safe. */
    enquiryKey.current = newEnquiryKey();
  }, []);

  const ids = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    region: `${uid}-region`,
    type: `${uid}-type`,
    notice: `${uid}-notice`,
    result: `${uid}-result`,
  };

  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form
      data-enquiry-form
      action={formAction}
      noValidate
      /* Any edit makes this a different enquiry, so it earns a new key. Fires
         on every keystroke; writing a string to a hidden input is free, and
         doing it here rather than on a debounce means the key is always
         correct at the instant of submit. */
      onInput={() => {
        enquiryKey.current = newEnquiryKey();
      }}
      onChange={() => {
        enquiryKey.current = newEnquiryKey();
      }}
      onSubmit={(event) => {
        const key = enquiryKey.current;
        if (keyField.current) keyField.current.value = key;
        const sent = lastSent.current;
        const repeat =
          sent !== null &&
          sent.key === key &&
          Date.now() - sent.at < REPEAT_COOLDOWN_MS;

        if (inFlight.current || repeat) {
          /* React checks `defaultPrevented` before running a form action, so
             this drops the duplicate without touching the action at all. */
          event.preventDefault();
          return;
        }
        inFlight.current = true;
        lastSent.current = { key, at: Date.now() };
      }}
    >
      {/* ------------------------------------------------------- the notice
          ⛔ IT SAYS WHICHEVER OF TWO THINGS IS TRUE, AND THE CODE DECIDES.

          Until 2026-08-22 this was one sentence — "the form is a test and
          sends nothing" — and it was accurate, because `deliverEnquiry()` was
          a stub. The transport shipped that day. A notice claiming the form
          does not send, on a form that sends, is the same failure as a fake
          receipt with the sign flipped, so it could not stay.

          It could not simply become "yes, it sends" either: `contactDelivery`
          is still the operator's personal inbox, marked `testData`. Telling a
          visitor their name and phone reached the association would be false.

          `isTestData()` is the switch, and it is the same predicate that
          `testDataFacts()` reports on — so the day a real monitored inbox is
          configured and `testData` is deleted from the fact, this line becomes
          the `live` one on its own. Nothing here has to be remembered.

          The <FactText> stays only while the destination is unresolved: once
          there IS an address, printing it under the form is not a gap, it is
          just an email address the contact band above already shows. */}
      <p
        id={ids.notice}
        className="border-line text-body-sm text-fg-muted rounded-card border p-4 text-pretty"
      >
        {isTestData(contactDelivery)
          ? contact.form.note.testing
          : contact.form.note.live}{" "}
        {isResolved(contactDelivery) ? null : (
          <FactText fact={contactDelivery} className="text-caption" />
        )}
      </p>

      {/* TWO-UP FROM `md`. The 2026-08-21 rebuild gave this form the full
          width of the section instead of seven of twelve columns, and a
          single-column stack at that measure produces 600px-wide inputs for a
          name and a phone number — a field far wider than anything anyone
          types into it, which reads as an unfinished layout.

          `<FieldGroup>` is `flex flex-col gap-6`; `md:grid md:grid-cols-2`
          replaces the flex axis and `md:gap-8` (32px, AGENTS §10) opens the
          column gutter. Four cells, four fields, exactly full:

              name    | phone
              region  | type

          ⛔ THE TWO NON-FIELDS INSIDE THIS GROUP DO NOT TAKE CELLS, and that
          is not luck. The idempotency key is `type="hidden"` → `display:none`
          → not a grid item at all. The honeypot wrapper is `sr-only` →
          `position:absolute` → out of flow, so it is not a grid item either.
          If either one ever stops being hidden the way it is hidden now, it
          will punch a hole in this grid and the field after it will move. */}
      <FieldGroup className="mt-8 md:grid md:grid-cols-2 md:gap-8">
        {/* ------------------------------------------------------------ name */}
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor={ids.name}>{contact.form.name.label}</FieldLabel>
          <Input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            required
            /* FADE 7: the schema caps this at 80 and the field advertised no
               limit at all, so a 10,078-character string was accepted, posted,
               and echoed straight back to the client. The cap belongs in both
               places — the browser stops the typing, zod stops everything
               else. Keep these two numbers equal to `schema` in
               `actions/contact.ts`. */
            maxLength={80}
            defaultValue={values.name}
            placeholder={contact.form.name.placeholder}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${ids.name}-error` : undefined}
          />
          <ErrorReveal id={`${ids.name}-error`}>{errors.name}</ErrorReveal>
        </Field>

        {/* ----------------------------------------------------------- phone
            ⛔ TWO CONTROLS, ONE CELL — operator, 2026-08-22: "just numbers
            only and the +[country code] on the own field".

            WHAT WAS WRONG. One free-text box up to 24 characters accepted
            `0934…`, `+963 934…`, `00963-934…` and ٠٩٣٤… — the same number in
            four spellings, none of which matched the next, all landing in the
            association's inbox for a human to normalise by eye.

            THE SPLIT IS ALSO WHAT MAKES THE VALUE SAFE. The country half is
            now a <select> validated against `dialCodes` with `z.enum()`, so it
            cannot carry arbitrary text; the number half is folded to digits by
            `normaliseDigits()` before anything else sees it. Neither can be a
            header-injection surface — see the block in `enquiry-transport.ts`.

            THE GRID. `grid-cols-[7.5rem_1fr]` keeps this ONE cell of the
            outer two-column form grid: the code box is fixed at 120px (wide
            enough for «أمريكا وكندا +1», the longest entry) and the number
            takes the rest. It does NOT become two cells, or the region and
            type fields below it shift by one and the 2×2 layout breaks.

            `dir="ltr"` on the number INPUT ONLY: a digit run reorders visibly
            inside an RTL field (SOVA §16.8). `text-end` then pulls it back to
            the right — inside an `ltr` element `end` IS the right edge — so it
            still lines up with every other field. The label, the select and
            the rest of the form stay RTL.

            AUTOCOMPLETE IS SPLIT TO MATCH: `tel-country-code` and
            `tel-national` are the exact HTML tokens for these two halves, so a
            browser filling a saved number puts each part in the right box.
            `autoComplete="tel"` on a national-only field would paste the whole
            international number into it. */}
        <Field data-invalid={errors.phone ? true : undefined}>
          <FieldLabel htmlFor={ids.phone}>{contact.form.phone.label}</FieldLabel>
          {/* ⛔ `dir="ltr"` ON THE WRAPPER, AND IT IS THE WHOLE FIX FOR THE
              SIDE THE CODE SITS ON.

              The first build put the country control at the inline-START,
              which in this RTL document is the RIGHT — so the field read
              «+963» then «99330303» right-to-left, i.e. the prefix and the
              number in the opposite order to how a phone number is read. The
              operator caught it from a screenshot.

              A phone number is an LTR run whatever language surrounds it
              (SOVA §16.8). Declaring `dir="ltr"` here makes the box itself an
              LTR context, so `start-4` on the affix resolves to the LEFT edge
              and `ps-16` on the input reserves space there — and the whole
              thing reads `+963 934826796` left to right, exactly as it would
              be dialled. AGENTS §1's logical properties are UNBROKEN by this;
              they simply resolve the other way inside a box that genuinely is
              left-to-right.

              THE FIELD IS ALSO LEFT-ALIGNED, unlike every other field on this
              form, and that is deliberate for the same reason: right-aligning
              the digits would strand `+963` alone at one end of a 600px box
              with a gap in the middle of one number.

              `aria-hidden` on the affix: it is not a label and not a control,
              and a screen reader reading "plus nine six three" between the
              field's label and its value would be noise. What a screen-reader
              user needs is the LABEL, and «رقم الهاتف» is already on it. */}
          <div dir="ltr" className="relative">
            <span
              aria-hidden
              className="text-fg-subtle text-body pointer-events-none absolute inset-y-0 start-4 flex items-center"
            >
              +{SYRIA_DIAL_CODE}
            </span>
            <Input
              id={ids.phone}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              /* Nine digits is the rule (`SYRIA_NATIONAL_DIGITS`); 10 is the
                 cap, so a visitor who types the trunk `0` out of habit —
                 `0934826796` — is not cut off mid-number. The server strips it.
                 A `maxLength` that fights the way people actually write their
                 own number is a field that looks broken. */
              maxLength={10}
              defaultValue={values.phone}
              placeholder={contact.form.phone.placeholder}
              className="ps-16 text-start"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
            />
          </div>
          <ErrorReveal id={`${ids.phone}-error`}>{errors.phone}</ErrorReveal>
        </Field>

        {/* ---------------------------------------------------------- region */}
        <Field data-invalid={errors.region ? true : undefined}>
          <FieldLabel htmlFor={ids.region}>
            {contact.form.region.label}
          </FieldLabel>
          <div className="relative w-full">
            {/* `key` IS LOAD-BEARING. A <select> is uncontrolled here, and
                React applies `defaultValue` on MOUNT only — but re-rendering
                the <option> children after the action responds makes the
                browser reset `selectedIndex`, so the region a visitor had
                chosen silently cleared itself on every failed submit while the
                name and phone survived. Keying on the echoed value remounts
                the select exactly when that value changes, and `defaultValue`
                applies again. Measured, not theoretical — the round trip was
                driven in a browser and this was the one field that lost its
                answer. */}
            <select
              key={`region-${values.region ?? ""}`}
              id={ids.region}
              name="region"
              required
              defaultValue={values.region ?? ""}
              className={cn(SELECT_CLASSES)}
              aria-invalid={errors.region ? true : undefined}
              aria-describedby={
                errors.region ? `${ids.region}-error` : undefined
              }
            >
              <option value="" disabled>
                {contact.form.region.placeholder}
              </option>
              {regions.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="text-fg-subtle pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2"
            />
          </div>
          <ErrorReveal id={`${ids.region}-error`}>{errors.region}</ErrorReveal>
        </Field>

        {/* ------------------------------------------------------------ type
            Four radio chips rather than a second select. The client supplied
            four options and no placeholder string, and four visible choices
            are one fewer interaction than a dropdown on a phone. */}
        <FieldSet
          data-invalid={errors.type ? true : undefined}
          /* ⛔ SAGE-2 recorded "4/4 fields get `aria-invalid`". FADE measured
              THREE. This group rendered its `role="alert"` message and its
              `aria-describedby`, but never the state the message describes —
              so a screen reader heard the error and then found four radios
              that claimed to be fine. On a radio group the attribute goes on
              the <fieldset>, not on each <input>; the inputs are `sr-only`
              chips and there is no single control to mark. */
          aria-invalid={errors.type ? true : undefined}
          aria-describedby={errors.type ? `${ids.type}-error` : undefined}
        >
          <FieldLegend variant="label">{contact.form.type.label}</FieldLegend>
          <div className="flex flex-wrap gap-3">
            {contact.form.type.options.map((option, i) => (
              <label
                key={option}
                className={cn(
                  "text-body-sm border-line-strong text-fg-muted rounded-full border px-4 py-2",
                  "cursor-pointer transition-colors duration-[var(--dur-fast)]",
                  "hover:bg-veil-05 hover:text-fg",
                  "has-checked:bg-veil-10 has-checked:text-fg has-checked:border-fg/40",
                  "has-focus-visible:outline-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={option}
                  id={i === 0 ? ids.type : undefined}
                  defaultChecked={values.type === option}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
          <ErrorReveal id={`${ids.type}-error`}>{errors.type}</ErrorReveal>
        </FieldSet>

        {/* -------------------------------------------------- idempotency key
            SSR renders a deterministic value derived from `useId` so hydration
            matches. The real value lives in the `enquiryKey` ref — React 19
            resets this field to its `defaultValue` after every form action, so
            the DOM cannot be the source of truth — and `onSubmit` writes it in
            just before the FormData is collected. The ref rotates on
            `onInput`/`onChange`, i.e. when the ANSWERS change, and never when
            a response settles: that is what made four duplicate POSTs carry
            four different keys.

            With JS disabled it keeps the deterministic value, which is
            correct: a browser posting a plain form cannot double-submit inside
            a frame the way a click can. */}
        <input
          ref={keyField}
          type="hidden"
          name={ENQUIRY_KEY_FIELD}
          defaultValue={`${uid}-0`}
        />

        {/* --------------------------------------------------------- honeypot
            Off-screen, out of the tab order, out of the accessibility tree —
            but NOT `display:none`, which some password managers autofill. A
            real person never meets it; a naive bot fills it and the action
            drops the request without telling it why. */}
        <div aria-hidden className="sr-only">
          <label htmlFor={`${uid}-hp`}>{contact.form.honeypot}</label>
          <input
            id={`${uid}-hp`}
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>
      </FieldGroup>

      {/* ⛔ «ما الذي يجمعه هذا النموذج» — the /privacy link — USED TO SIT HERE,
          beside the button, as a <FieldDescription>. Deleted 2026-08-21 by
          operator decision on the look of the band.

          The reason it existed has not gone away: this form collects a name
          and a phone number, and SOVA §9 #17 says a form that does should name
          what it collects at the point of collection. `/privacy` is still a
          real page and is still linked from the footer's documents list — one
          screen further away, at the foot of a ~19,000px page. The full note,
          and the object that has to come back if the operator reverses this,
          is in `src/content/contact.ts` where `privacy` used to be.

          Do not reinstate it silently; and do not reinstate it as a
          <FieldDescription> without re-reading the gold note that used to be
          here — that primitive styles its links `text-accent-gold` by default,
          and this section's one gold element is the <Accent> in the heading
          (AGENTS §8). The old override was `[&>a]:text-fg-muted`. */}
      <div className="mt-10">
        <SubmitButton />
      </div>

      {/* ------------------------------------------------------- the outcome
          `role="status"` so a screen reader hears the result without the focus
          moving. `notConnected` is styled as INFORMATION, not as an error: the
          visitor did nothing wrong, the association has not published an inbox
          yet. And it never, under any state, says the message was sent unless
          the transport said so.

          ⛔ THIS IS ALSO THE SUCCESS SCREEN, and since 2026-08-22 it carries a
          second thing — the WhatsApp follow-up. Operator: "one button ... the
          request that the user did send should be send to both email and the
          whatsapp". One button is what shipped; the second channel is offered
          HERE, after the first one is confirmed, because a site cannot send a
          WhatsApp message for anyone and a link fired after the action settles
          is eaten by every popup blocker. The full reasoning, including why
          Meta's Cloud API was rejected, is in `src/lib/enquiry-whatsapp.ts`. */}
      <div
        id={ids.result}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-6 text-body-sm text-pretty",
          state.status === "invalid" ? "text-destructive" : "text-fg-muted",
        )}
      >
        {/* The live region itself never unmounts — replacing it would stop a
            screen reader announcing the second and later results. Only its
            contents animate, keyed on the message so a NEW outcome
            cross-fades instead of mutating in place. */}
        <AnimatePresence mode="wait" initial={false}>
          {state.message ? (
            <motion.div
              key={state.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p>{state.message}</p>

              {/* ------------------------------------ the WhatsApp follow-up
                  ⛔ BOTH CONDITIONS, AND NEITHER IS REDUNDANT.

                  `status === "sent"` is the honesty gate: this offers to
                  «متابعة طلبك» — follow up ON a request — and there is no
                  request to follow up on in any other state. The action only
                  ever sets the href on `sent`, so this looks belt-and-braces;
                  it is the assertion that keeps it that way if someone later
                  adds a state that carries values.

                  `state.whatsappHref` is the FACT gate. The href is built from
                  `placeholders.whatsapp` through `factHref()`, which is null
                  while the number is unresolved — so this button appears and
                  disappears with the association's number and can never be a
                  dead link. No fallback digits exist to strand here.

                  ⚠️ `data-fact` / `data-test-data` ARE NOT DECORATION. The
                  honesty system's audit claim is that `grep data-test-data`
                  over a built page is COMPLETE "by construction, because
                  <FactText> and <FactLink> are the only way a fact reaches the
                  DOM" (placeholders.ts). This href is a third way — the number
                  is inside it — so it carries the same two attributes and the
                  claim stays true. Delete them and the operator's test number
                  ships inside a link no audit can see.

                  `target="_blank"`, unlike the `wa.me` row in the channel band
                  above, which navigates in place: there the visitor is leaving
                  anyway, here they have just been handed a receipt and it must
                  not be replaced by a QR page on a desktop with no WhatsApp.

                  QUIET, NOT GOLD (AGENTS §8): this section's one gold element
                  is the <Accent> in its heading, and `variant="outline"` at
                  `size="default"` also keeps it visibly under the 52px primary
                  above — a follow-up, never a rival to «إرسال الطلب». */}
              {state.status === "sent" && state.whatsappHref ? (
                <div className="mt-4 flex flex-col items-start gap-3">
                  <p>{contact.form.result.whatsapp.prompt}</p>
                  <Button asChild variant="outline">
                    <a
                      href={state.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-fact={whatsapp.id}
                      data-test-data={
                        isTestData(whatsapp) ? whatsapp.value : undefined
                      }
                    >
                      <MessageCircle aria-hidden />
                      {contact.form.result.whatsapp.cta}
                    </a>
                  </Button>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
