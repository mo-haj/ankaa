import type { Metadata } from "next";
import Link from "next/link";

import { FactText } from "@/components/content/fact";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { privacy } from "@/content/privacy";
import { privacyPolicyDocument } from "@/content/placeholders";

/* =============================================================================
 * /privacy — SOVA §9 #17.
 *
 * The enquiry form collects a name and a phone number, so this page has to
 * exist. What it must NOT be is a generated privacy policy: see the header of
 * `src/content/privacy.ts` for why writing one on the association's behalf
 * would be inventing legally operative facts about a real organisation.
 *
 * So the page states three true things — no policy has been supplied, exactly
 * which fields the form collects, and that nothing is delivered or stored
 * today — and links back. `placeholders.privacyPolicyDocument` stays PENDING
 * and is rendered on the page, so this route existing does not quietly close
 * gap #17 in the launch audit. It is still open. This is the interim.
 *
 * ⚠ IF ANYONE IMPLEMENTS `deliverEnquiry()`, ADDS STORAGE, LOGGING OR
 * ANALYTICS: `privacy.collected.note` becomes false in that same commit.
 *
 * Light, surface-0 — a document page, not a section of the home page. It gets
 * `space="hero"` because it starts at the top of the document and needs the
 * fixed header's clearance, the same as `/projects/[slug]`.
 * ========================================================================== */

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.lead,
  alternates: { canonical: "/privacy" },
  // Nothing here is a search destination, but it must stay crawlable: a
  // privacy link that robots cannot follow defeats the point of publishing it.
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="flex-1">
      <Section
        theme="light"
        surface={0}
        space="hero"
        container={false}
        aria-labelledby="privacy-title"
      >
        <Container width="prose">
          <SectionHeader
            kicker={privacy.kicker}
            headingId="privacy-title"
            as="h1"
            size="h1"
            heading={privacy.title}
            lead={privacy.lead}
          />

          <div className="mt-16 flex flex-col gap-12">
            <section>
              <h2 className="font-display text-h3 text-fg">
                {privacy.status.title}
              </h2>
              <p className="text-body text-fg-muted mt-4 text-pretty">
                {privacy.status.body}
              </p>
              <p className="text-body-sm mt-4">
                {privacy.documentLabel}{" "}
                <FactText fact={privacyPolicyDocument} />
              </p>
            </section>

            <section>
              <h2 className="font-display text-h3 text-fg">
                {privacy.collected.title}
              </h2>
              {/* The four fields, read as a list. This is our own code, so it
                  is the one thing on the page we can state precisely. */}
              <ul className="mt-4 flex flex-col">
                {privacy.collected.items.map((item) => (
                  <li
                    key={item}
                    className="border-line text-body text-fg-muted border-t py-3 first:border-t-0 first:pt-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-body text-fg-muted mt-6 text-pretty">
                {privacy.collected.note}
              </p>
            </section>
          </div>

          <Button asChild variant="outline" className="mt-16">
            <Link href={privacy.back.href}>{privacy.back.label}</Link>
          </Button>
        </Container>
      </Section>
    </main>
  );
}
