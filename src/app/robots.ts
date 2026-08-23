import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

/* -----------------------------------------------------------------------------
 * robots.txt — SOVA §9 #15.
 *
 * `/styleguide` is disallowed: it is ASTRA's internal design-system page with
 * live contrast ratios and token tables. It is genuinely useful to the squad
 * and meaningless in a search result for a housing cooperative.
 *
 * ⚠ The sitemap URL is only as correct as `NEXT_PUBLIC_SITE_URL`. Without it
 * this points at the reserved placeholder origin — see src/lib/site-url.ts.
 * -------------------------------------------------------------------------- */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/styleguide"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
