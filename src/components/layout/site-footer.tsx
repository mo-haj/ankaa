import Link from "next/link";

import { AnkaaMark } from "@/components/brand";
import { FactLink, FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Label } from "@/components/layout/typography";
import { footer, copyrightLine } from "@/content/footer";
import { footerNav } from "@/content/nav";
import {
  address,
  bylawsDocument,
  email,
  licenceAuthority,
  licenceNumber,
  membershipFormDocument,
  phone,
  privacyPolicyDocument,
  type DocumentFact,
} from "@/content/placeholders";
import { site } from "@/content/site";
import { trust } from "@/content/trust";

/* -----------------------------------------------------------------------------
 * <SiteFooter> — SOVA §11 row 14: the footer is where an institution proves it
 * is one. Licence number, address, phone, email, documents, privacy.
 *
 * Every one of those six is missing today (SOVA §9), so every one renders
 * through placeholders.ts as an honest Arabic gap rather than a plausible
 * dummy. The SHAPE is finished; the day the client sends the details, one file
 * changes and the whole footer fills in.
 *
 * `theme="dark" surface={3}` — #001613, the floor of the page. It is the only
 * place surface-3 is used, which is what makes it read as a floor.
 *
 * Server Component.
 * -------------------------------------------------------------------------- */

function DocumentRow({ doc }: { doc: DocumentFact }) {
  /**
   * WAVE 3 — the privacy row is a special case, and deliberately not a lie.
   *
   * `/privacy` now exists (SOVA §9 #17: the enquiry form collects a name and a
   * phone number, so it has to). It is NOT the policy — it is an honest interim
   * page saying no policy has been supplied and naming exactly what the form
   * collects. So the LABEL links to it, and the pending marker stays beside it:
   * the page is reachable AND `documents.privacyPolicy` is still counted as an
   * open gap by `grep data-pending`. Resolving the fact is what removes it.
   */
  const interim = doc.id === "documents.privacyPolicy" ? "/privacy" : null;
  const href = doc.value;

  if (!href && interim) {
    return (
      <li className="text-body-sm text-fg-muted">
        <Link
          href={interim}
          className="hover:text-fg underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-current"
        >
          {doc.label}
        </Link>{" "}
        <FactText fact={doc} className="text-caption" />
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <a
          href={href}
          className="text-body-sm text-fg-muted hover:text-fg transition-colors"
        >
          {doc.label}
        </a>
      </li>
    );
  }

  return (
    <li className="text-body-sm text-fg-muted">
      {doc.label}{" "}
      <FactText fact={doc} className="text-caption" />
    </li>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Section
      as="footer"
      theme="dark"
      surface={3}
      space="default"
      container={false}
      /* ⛔ ASYMMETRIC ON PURPOSE — operator, 2026-08-22, item 17.
         `space="default"` is `py-[var(--section-y)]`, i.e. 88 → 128px on BOTH
         edges. On every other section that symmetry is the rhythm. On the
         footer the bottom edge is not a gap between two sections, it is the
         end of the document: 128px of surface-3 below the copyright line with
         nothing after it reads as a rendering bug, not as breathing room —
         which is exactly what the operator's screenshot showed.

         The TOP padding is untouched, because that one IS a real gap: it
         separates the footer from the contact band above it and it carries the
         dark → darker surface flip.

         48px is the space ladder's rung under the copyright's own 24px
         `pt-6` — enough that the line is not jammed against the viewport
         floor, small enough that the page ends where the content ends. */
      className="pb-12"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand — the FULL legal name finally used as text. On the old site
              it existed only inside an alt attribute (SOVA §5.1). */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <AnkaaMark className="text-accent-hair w-9 shrink-0" />
              <span className="font-display text-h4 text-fg font-semibold">
                {footer.brand}
              </span>
            </div>
            <p className="text-body-sm text-fg-muted mt-6 max-w-[34ch]">
              {site.brand.fullName}
            </p>
            <p className="text-body-sm text-fg-subtle mt-3">{footer.tagline}</p>
          </div>

          {/* Navigation */}
          <nav className="lg:col-span-2" aria-label={footer.headings.nav}>
            <Label className="text-fg-subtle block">{footer.headings.nav}</Label>
            {/* `gap-2` + `py-1` rather than `gap-3`: the same 24px rhythm
                between links, with 4px of it moved INSIDE each link so its
                pointer target clears WCAG 2.5.8's 24px AA minimum (they
                measured 22px). Audited 2026-08-22. */}
            <ul className="mt-6 flex flex-col gap-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-fg-muted hover:text-fg inline-block py-1 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact — four facts, none of which exist yet. */}
          <div className="lg:col-span-3">
            <Label className="text-fg-subtle block">
              {footer.headings.contact}
            </Label>
            <dl className="mt-6 flex flex-col gap-3">
              <div className="text-body-sm">
                <dt className="text-fg-subtle text-caption">
                  {footer.labels.phone}
                </dt>
                <dd className="text-fg-muted">
                  <FactLink fact={phone} />
                </dd>
              </div>
              <div className="text-body-sm">
                <dt className="text-fg-subtle text-caption">
                  {footer.labels.email}
                </dt>
                <dd className="text-fg-muted">
                  <FactLink fact={email} />
                </dd>
              </div>
              <div className="text-body-sm">
                <dt className="text-fg-subtle text-caption">
                  {footer.labels.address}
                </dt>
                <dd className="text-fg-muted">
                  <FactText fact={address} />
                </dd>
              </div>
              {/* ⛔ THE «أوقات الدوام» ROW WAS HERE. Deleted 2026-08-21 —
                  operator decision, "delete it entirely", made about the
                  contact band and applied here too because this was the second
                  of the two places it rendered and leaving one of them would
                  have been half the instruction.

                  It showed «تُضاف أوقات الدوام» — a pending row telling a
                  visitor nothing they can act on, in the block that is supposed
                  to be this footer's proof that an institution is behind the
                  site.

                  `contact.officeHours` STILL EXISTS in placeholders.ts and is
                  still counted as an unsupplied fact, because it still is one.
                  But nothing renders it now, so filling its `value` in will
                  NOT make hours appear anywhere — a row has to be added back
                  first. That note is on the fact itself. */}
            </dl>
          </div>

          {/* Licence + documents — the trust block. */}
          <div className="lg:col-span-3">
            <Label className="text-fg-subtle block">
              {footer.headings.licence}
            </Label>
            <dl className="mt-6 flex flex-col gap-3">
              <div className="text-body-sm">
                <dt className="text-fg-subtle text-caption">
                  {trust.credential.licenceNumberLabel}
                </dt>
                <dd className="text-fg-muted">
                  <FactText fact={licenceNumber} />
                </dd>
              </div>
              <div className="text-body-sm">
                <dt className="text-fg-subtle text-caption">
                  {trust.credential.licenceAuthorityLabel}
                </dt>
                <dd className="text-fg-muted">
                  <FactText fact={licenceAuthority} />
                </dd>
              </div>
            </dl>

            <Label className="text-fg-subtle mt-8 block">
              {footer.headings.documents}
            </Label>
            <ul className="mt-6 flex flex-col gap-3">
              <DocumentRow doc={bylawsDocument} />
              <DocumentRow doc={membershipFormDocument} />
              <DocumentRow doc={privacyPolicyDocument} />
            </ul>
          </div>
        </div>

        {/* ⛔ THE STANDING DISCLAIMER WAS HERE, AND IT IS GONE — operator,
            2026-08-22, closing out «remove all the صور تصورية».

            It read «الصور المعروضة تصورية وليست صورًا للمشاريع المنفذة فعليًا.»
            and it was the LAST place on the site that said the imagery is
            rendering rather than photography. The old site shipped nine such
            lines on one page (SOVA §9 #19); the rebuild cut that to one; this
            removes the one. `footer.disclaimer` is deleted with it so nothing
            here is an orphan string.

            ⚠️ WHAT THE SITE NOW ASSERTS ABOUT ITS IMAGES: nothing, in visible
            copy. The claim survives only in `alt` text, where every render is
            described as a «منظور». If it should come back, this <p> plus one
            line in `footer.ts` is the whole change.

            The bottom bar now has ONE child, so it drops `justify-between`
            and simply starts where every other column in this footer starts —
            under the brand lockup, on the inline-start edge. `justify-end` was
            tried first and put the line alone in the far corner with the whole
            width empty beside it, which looked like the other half had failed
            to render. */}
        <div className="border-line mt-12 flex border-t pt-6">
          <p className="text-caption text-fg-subtle">{copyrightLine(year)}</p>
        </div>
      </Container>
    </Section>
  );
}
