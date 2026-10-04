import { faq } from "@/content/faq";
import {
  address,
  email,
  isResolved,
  licenceNumber,
  phone,
} from "@/content/placeholders";
import { regions } from "@/content/regions";
import { site } from "@/content/site";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/* =============================================================================
 * STRUCTURED DATA — SOVA §9 #16.
 *
 * =============================================================================
 * ⛔ THE RULE: OMIT EVERY PROPERTY WE DO NOT HAVE A REAL VALUE FOR.
 * =============================================================================
 * Structured data is a set of machine-readable ASSERTIONS about a real
 * organisation. Search engines surface them as facts — a phone number becomes a
 * call button, an address becomes a map pin, a founding date becomes a
 * knowledge-panel line. There is no `data-pending` in JSON-LD and no way for a
 * crawler to see a hedge, so a placeholder here does not read as "coming soon",
 * it reads as the association's own statement.
 *
 * Every property below is therefore CONDITIONAL on the corresponding fact
 * being resolved in `placeholders.ts`. Today that means the graph carries the
 * name, the alternate legal name, the URL, the logo, the language and the
 * areas served — nothing else. No `telephone`, no `address`, no `email`, no
 * `foundingDate`, no `numberOfEmployees`, no aggregate rating.
 *
 * =============================================================================
 * TWO TYPES DELIBERATELY NOT EMITTED
 * =============================================================================
 * · `RealEstateAgent` — SOVA §9 #16 lists it as applicable and it was
 *   considered. It is not emitted: the type describes a business that brokers
 *   property for others, and جمعية البنيان is a cooperative that builds and
 *   allocates housing to its own members. Beyond the semantics, the type's
 *   whole value comes from `address`, `telephone`, `openingHours` and
 *   `priceRange` — we have none of the four, so it would be an empty node
 *   asserting the wrong category. Revisit when the office details land.
 *
 * · `RealEstateListing` / `Residence` per project — the six projects are
 *   flagged provisional BY THE CLIENT («جميع الأسماء والمساحات والأرقام
 *   المعروضة في النسخة الحالية تجريبية»). Emitting them as structured listings
 *   would push admittedly-provisional names, unit counts and areas into a
 *   search index as facts about real housing. It ships when
 *   `projects.provisional` is false, and not a day earlier.
 *
 * `FAQPage` carries the four REAL questions only — `faq.items`. The five
 * unanswered topics in `faq.pendingTopics` are not here for the same reason
 * they are not on the page.
 * ========================================================================== */

/** One <script> tag. `JSON.stringify` output cannot break out of it. */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is compiled-in constants, never user input, and JSON's
      // escaping keeps `<` intact — so the only real hazard, `</script>`,
      // cannot occur. Replaced anyway: it costs nothing.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Organization — the association itself. Referenced by `@id` from the other
 * nodes so a crawler sees one entity, not three.
 */
export function OrganizationJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: site.meta.title,
    // The full legal name. On the old site it existed only in an alt attribute.
    alternateName: site.brand.fullName,
    url: siteUrl,
    /**
     * A REAL, SERVABLE FILE. Next's generated `icon.tsx` / `opengraph-image.tsx`
     * routes are served at `/icon?<hash>` and `/opengraph-image?<hash>`, and
     * the hash changes when the file does — so `/icon.png` and
     * `/opengraph-image.png` were 404s sitting inside the structured data,
     * asserting a logo that does not resolve. `public/images/new_logo_bonian.png`
     * is the brand artwork, at a stable path, 612×408.
     */
    logo: absoluteUrl("/images/new_logo_bonian.png"),
    description: site.meta.description,
    inLanguage: "ar",
    // The four operating areas ARE published, by name, by the client.
    areaServed: regions.map((region) => ({
      "@type": "Place",
      name: region.name,
    })),
  };

  /* ---------------------------------------------------------------------------
     Everything below this line is absent from the output today. Each appears
     the moment its fact is filled in — no code change, no second review.
     ------------------------------------------------------------------------ */
  if (isResolved(phone)) data.telephone = phone.value;
  if (isResolved(email)) data.email = email.value;
  if (isResolved(address)) {
    data.address = { "@type": "PostalAddress", streetAddress: address.value };
  }
  if (isResolved(licenceNumber)) {
    // `identifier` rather than a bare string: a licence number without the
    // scheme that issued it is not a meaningful identifier.
    data.identifier = {
      "@type": "PropertyValue",
      name: "رقم الترخيص",
      value: licenceNumber.value,
    };
  }

  return <JsonLd data={data} />;
}

/** WebSite — makes the home page's canonical explicit to a crawler. */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.meta.title,
        inLanguage: "ar",
        publisher: { "@id": `${siteUrl}/#organization` },
      }}
    />
  );
}

/** FAQPage — the four answered questions. Never the five unanswered ones. */
export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        inLanguage: "ar",
        mainEntity: faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}
