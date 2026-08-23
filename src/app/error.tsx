"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Accent } from "@/components/layout/typography";
import { Button } from "@/components/ui/button";
import { errors } from "@/content/errors";
import { site } from "@/content/site";

/* =============================================================================
 * THE ROUTE ERROR BOUNDARY.
 *
 * Wraps every page in the app — a throw anywhere below the root layout lands
 * here instead of on Next's built-in English error screen. (It does NOT wrap
 * the root layout itself; that is `global-error.tsx`'s job, and the two are
 * not interchangeable.)
 *
 * "use client" is not a choice: React error boundaries are class components
 * with `componentDidCatch`, so this file cannot be a Server Component. The
 * cost is a client bundle on a route nobody should ever see, which is why the
 * markup below is deliberately small — <Section>, <SectionHeader>, <Button>,
 * nothing else. No motion, no GSAP, no images.
 *
 * -----------------------------------------------------------------------------
 * ⛔ WHAT THE VISITOR IS NOT SHOWN, AND WHY
 *
 * `error.message` is never rendered. In production Next replaces a SERVER
 * Component's message with a generic one specifically to stop internals
 * leaking — but an error thrown in a CLIENT component keeps its original text,
 * which is an untranslated English string at best and a stack-shaped
 * description of the codebase at worst. Printing it into an Arabic page helps
 * nobody and tells a prober something.
 *
 * `error.digest` IS shown. It is a hash of the error, it carries no content,
 * and it is the only thing that lets a visitor's phone call ("رمز الخطأ …") be
 * matched to a line in the Vercel log. It is rendered `dir="ltr"` inside a
 * <bdi>: a bare hex hash dropped into an RTL paragraph reorders, and a
 * mis-transcribed digest is worse than no digest.
 *
 * The `console.error` is what makes the digest useful client-side. Replace it
 * with a real reporter (Sentry et al.) if one is ever added; do not delete it.
 * -----------------------------------------------------------------------------
 *
 * RECOVERY. Next 16.3 ships `retry()` alongside `reset()` and the file
 * convention doc for this exact version says to prefer it: `reset()` only
 * clears the boundary's error state and re-renders the same children, so a
 * failure in a Server Component's data — the likely case here — reproduces
 * instantly. `retry()` re-fetches the segment first. Both are wired: the
 * button calls `retry`, and `reset` is accepted so the signature stays honest
 * about what Next passes.
 *
 * GROUND: light / surface-0, matching /privacy and the root 404. The header is
 * solid here with no JS (globals.css §8.2 — no `[data-slot="hero-media"]` on
 * the page), and `space="hero"` is the clearance that fixed header needs.
 * GOLD BUDGET: one element, the <Accent>. Hence `rule={false}`.
 * ========================================================================== */

export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    // Console only. The visitor sees the digest, never this.
    console.error("[ankaa] route error", error);
  }, [error]);

  return (
    <main id="main" className="flex-1">
      {/* ⛔ SAGE-2 — a client boundary cannot export `metadata`, so without this
          the failure screen was titled «جمعية العنقاء السكنية», identical to
          the home page (WCAG 2.4.2, Level A). React 19 hoists <title> out of
          any component; `global-error.tsx` already uses the same mechanism. */}
      <title>{`${errors.error.metaTitle} | ${site.meta.title}`}</title>
      <Section
        theme="light"
        surface={0}
        space="hero"
        container={false}
        aria-labelledby="route-error-title"
      >
        <Container width="prose">
          <SectionHeader
            kicker={errors.error.kicker}
            rule={false}
            headingId="route-error-title"
            as="h1"
            size="h1"
            heading={
              <>
                {errors.error.title.a} <Accent>{errors.error.title.b}</Accent>
              </>
            }
            lead={errors.error.lead}
          />

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => retry()}>
              {errors.error.retry}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">{errors.error.home}</Link>
            </Button>
          </div>

          {error.digest ? (
            <p className="text-caption text-fg-subtle border-line mt-16 border-t pt-6">
              {errors.error.digestLabel}{" "}
              {/* The hash is Latin/Western in an RTL paragraph: it needs its
                  own bidi isolate AND its own direction, or the characters
                  reorder and the visitor reads it out wrong. */}
              <bdi dir="ltr" className="font-mono">
                {error.digest}
              </bdi>
            </p>
          ) : null}
        </Container>
      </Section>
    </main>
  );
}
