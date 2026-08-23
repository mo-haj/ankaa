/* =============================================================================
 * THE SITE'S OWN ADDRESS — one place, because six things need it and none of
 * them may guess: `metadataBase`, canonical URLs, the OG card, `sitemap.ts`,
 * `robots.ts` and the JSON-LD `@id`.
 *
 * ⛔ WAVE 1 SHIPPED `https://ankaa.sy` AS THE FALLBACK. THAT IS A GUESS, AND A
 * GUESSED DOMAIN IS A FACT WE INVENTED — it may belong to someone else, and a
 * canonical tag pointing at a stranger's site is the most damaging piece of
 * metadata a page can carry. It is removed.
 *
 * The fallback below is `ankaa.example`. `.example` is reserved by RFC 2606 and
 * can never be registered by anyone, so it is unmistakably a placeholder in
 * every log, crawl and share preview — a broken link that is obviously a
 * placeholder beats a working link to the wrong company.
 *
 * TURNING IT ON — one environment variable, at build time, on the host:
 *
 *     NEXT_PUBLIC_SITE_URL=https://the-real-domain.example
 *
 * It must be `NEXT_PUBLIC_` because the value is inlined at build time and read
 * during static generation. See `.env.example`. A build without it prints a
 * warning; nothing else changes, so a deploy never silently breaks — it just
 * tells you.
 * ========================================================================== */

/** RFC 2606 reserved. Cannot be registered. Deliberately not a real domain. */
const PLACEHOLDER_ORIGIN = "https://ankaa.example";

const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/** True once the client's real domain is set. Falsey builds warn, not fail. */
export const isSiteUrlConfigured = Boolean(configured);

/** Absolute origin, no trailing slash. */
export const siteUrl = (configured || PLACEHOLDER_ORIGIN).replace(/\/+$/, "");

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}

if (!isSiteUrlConfigured && process.env.NODE_ENV !== "test") {
  // One line, at build/boot, naming the exact fix. Not an error: a missing
  // domain must not block a preview deploy.
  console.warn(
    `[ankaa] NEXT_PUBLIC_SITE_URL is not set — canonical URLs, the sitemap and the OG card are using the placeholder origin ${PLACEHOLDER_ORIGIN}. Set it before launch (see .env.example).`,
  );
}
