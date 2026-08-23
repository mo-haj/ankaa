import type { NextConfig } from "next";

/* =============================================================================
 * next.config.ts — BRIMSTONE.
 *
 * This file was the untouched `create-next-app` scaffold (`{ /* config options
 * here *\/ }`) until launch prep. Everything below is either a header the host
 * will not add for us, or a setting that was MEASURED before it was changed.
 * Nothing here is cargo-culted; each block says why it exists and what it cost.
 *
 * There is deliberately NO `vercel.json`. Next is zero-config on Vercel and a
 * second source of truth for headers is how a header silently stops applying.
 * ========================================================================== */

/* -----------------------------------------------------------------------------
 * SECURITY HEADERS
 *
 * Vercel adds none of these. They are cheap, they are checked by every
 * third-party scanner a client will run at us, and three of them close real
 * classes of attack rather than box-ticking.
 * -------------------------------------------------------------------------- */
const securityHeaders = [
  {
    // Stops a browser second-guessing a declared Content-Type. Without it a
    // file served as text/plain that happens to start with `<script>` can be
    // executed as one. Zero-risk, universally supported.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Send the full URL to our own origin, only the ORIGIN cross-site, and
    // nothing at all when downgrading to http. This is a real privacy setting
    // here, not a formality: `/?region=fayhaa` and `/projects/<slug>` say which
    // project a visitor was reading, and enquiries about housing in Syria are
    // not neutral information to leak into a third party's referrer log. It is
    // also Chrome's and Firefox's default — declaring it makes it true on the
    // browsers where it is not.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Clickjacking. A cooperative that takes membership enquiries is exactly
    // the kind of site that gets framed inside a look-alike. SAMEORIGIN rather
    // than DENY so an internal preview can still iframe it.
    // Superseded by CSP `frame-ancestors` on modern browsers — both ship,
    // because X-Frame-Options is what the old ones understand.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Nothing on this site uses a camera, a microphone, geolocation, a payment
    // handler or a USB device, so every one of them is denied outright. The
    // list is deliberately SHORT and limited to features every current browser
    // recognises: an unknown feature name makes Chrome log
    // "Unrecognized feature" on every page load, which is console noise in
    // exchange for nothing. Verified clean in Edge 151 — see DEPLOY.md.
    //
    // `browsing-topics=()` opts the site out of Chrome's Topics API, so the
    // pages a visitor reads here cannot become an ad-interest signal.
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  {
    // HSTS. Vercel serves HTTPS and redirects http→https already; this closes
    // the first-request window where that redirect can be intercepted.
    //
    // ⚠ DELIBERATELY WITHOUT `includeSubDomains` AND WITHOUT `preload`. Both
    // are one-way doors:
    //   · `includeSubDomains` forces HTTPS on EVERY subdomain of the final
    //     custom domain — including a webmail, a cPanel or an old office
    //     server that may be plain http. Any visitor who loaded this site once
    //     would then be unable to reach them for two years.
    //   · `preload` bakes the domain into a list compiled into browsers.
    //     Removal takes months.
    // Neither can be decided from here: they depend on what else lives under
    // the association's domain, which nobody has told us. DEPLOY.md carries
    // the exact upgrade step for once that is known.
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
];

/* -----------------------------------------------------------------------------
 * CONTENT SECURITY POLICY — the careful half.
 *
 * MEASURED, NOT GUESSED. `default-src 'self'; script-src 'self'; style-src
 * 'self'; …` was built, served from a production build and driven in headless
 * Edge 151 at 1440. Violations counted via a `securitypolicyviolation`
 * listener; the page state read out of the live DOM afterwards.
 *
 *   `/`                 21 violations — 3 script-src-elem, 18 style-src-attr
 *   `/projects/firdous-1` 12 violations — 10 script-src-elem, 2 style-src-attr
 *
 * The three blocked scripts on `/` are exactly the three inline <script>
 * elements the document ships that are actually JavaScript: the ~296-byte
 * INTRO GUARD from `layout.tsx`, and Next's own two bootstrap pushes
 * (`self.__next_f=…` plus a 220 KB RSC payload). Blocking the second pair
 * means the App Router flight data never reaches the client — the page does
 * not hydrate.
 *
 * WHAT THAT LOOKS LIKE, measured on the same page after the block:
 *   · `data-scrolled` still `"false"` at `scrollY 2000` — <HeaderMotion> never
 *     ran, so the header is white type on cream over every light section. That
 *     is the exact legibility bug NEON was brought in to fix, reintroduced.
 *   · 5 of 5 `[data-prevent-flicker]` nodes still `visibility: hidden` — the
 *     SplitText pre-hide is released by JS, so the HERO HEADLINE NEVER APPEARS.
 *   · `window.gsap` undefined, no `lenis` class: no motion, no smooth scroll.
 *   Screenshot: a dark hero with a half-drawn blueprint, no headline, no CTA.
 *
 * `style-src 'self'` accounts for the rest: the 18 violations on `/` match the
 * document's 18 `style=""` attributes one-for-one, and GSAP animates by
 * writing more of them at runtime.
 *
 * ✅ ONE THING THAT IS *NOT* BROKEN, contrary to the obvious assumption: the
 * three `<script type="application/ld+json">` blocks from
 * `components/seo/json-ld.tsx` are NOT blocked. 6 inline scripts ship on `/`,
 * 3 of them ld+json, and only 3 violations were raised — browsers never
 * execute a non-JS script type, so CSP has nothing to stop. The structured
 * data survives an enforcing policy untouched.
 *
 * So a strict policy is NOT shippable as-is, and shipping one with
 * `'unsafe-inline'` in `script-src` would be theatre: `'unsafe-inline'` is the
 * exact thing CSP exists to prevent, and its presence also makes browsers
 * ignore any hash or nonce next to it.
 *
 * Report-Only was considered and rejected: with no `report-uri` collector it
 * enforces nothing and merely prints 21 red console errors on every visit.
 *
 * WHAT SHIPS INSTEAD — the directives that need no nonce and were verified to
 * break nothing. They are enforcing, not report-only, because each one is
 * independently useful and none of them touches inline script or style:
 *
 *   frame-ancestors  clickjacking, the modern half of X-Frame-Options
 *   base-uri         stops an injected <base> re-pointing every relative URL
 *   form-action      the enquiry form can only ever POST to this origin
 *   object-src       no <object>/<embed> plugin surface at all
 *
 * ⛔ DO NOT ADD `default-src` HERE. It applies to script-src and style-src by
 * fallback and would reintroduce all four failures above.
 *
 * THE ENFORCING VERSION, and what it costs: a `src/middleware.ts` that mints a
 * per-request nonce, sets `script-src 'self' 'nonce-…' 'strict-dynamic'`, and
 * passes the nonce to the inline guard and to every JSON-LD tag. That also
 * forces `/` and every currently-static route through the middleware on every
 * request. `style-src` still needs `'unsafe-inline'` while GSAP owns the
 * motion. Full write-up in DEPLOY.md — this is a deliberate follow-up, not an
 * oversight.
 * -------------------------------------------------------------------------- */
const contentSecurityPolicy = [
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
].join("; ");

/* -----------------------------------------------------------------------------
 * GITHUB PAGES — a SECOND, REDUCED build target. Off unless GITHUB_PAGES=true.
 *
 * Vercel is the primary target and nothing below changes it: every option here
 * is behind the flag, so `npm run dev`, `npm run build` and a Vercel deploy
 * behave exactly as they did before this block existed.
 *
 * The repo is `mo-haj/ankaa`, so Pages serves it from the SUBPATH
 * `https://mo-haj.github.io/ankaa` — hence `basePath`. Next rewrites its own
 * <Link> hrefs and asset URLs for it; a hand-written `/images/x.webp` in a
 * plain <img> or in CSS would NOT be rewritten and would 404 in production
 * while working perfectly in dev. There are none today. Do not add one.
 *
 * ⛔ TWO FEATURES ARE REMOVED BEFORE THIS TARGET CAN BUILD AT ALL, by
 * `scripts/pages-preview/apply.mjs`, which runs ONLY in the Pages workflow on
 * a throwaway checkout. Both refusals are quoted from a real build:
 * "Intercepting routes are not supported with static export" (the @modal
 * project overlay) and "Server Actions are not supported with static export"
 * (the enquiry form). Read that script before changing either feature.
 *
 * ⛔ WHAT THIS TARGET CANNOT DO, so nobody re-discovers it in production:
 *
 *   1. THE ENQUIRY FORM DOES NOT SEND. `src/app/actions/contact.ts` is a
 *      Server Action and a static export has no server to run it on. There is
 *      no partial version of this: no email, no rate limiting, no per-field
 *      validation round-trip.
 *   2. NO SECURITY HEADERS. `headers()` is a server feature. GitHub Pages
 *      sends its own fixed set and there is no configuration for it, so the
 *      CSP, HSTS and the rest simply do not exist on this target. They are
 *      omitted below rather than silently ignored.
 *   3. NO IMAGE OPTIMISATION. `unoptimized: true` serves the original .webp
 *      at full size to every device. The AVIF work in `formats` is inert here.
 *
 * That makes Pages a genuine PREVIEW target — right for showing the owner, and
 * not the launch host. DEPLOY.md §0 already gates a public launch on the
 * client blockers; this adds a technical one.
 * -------------------------------------------------------------------------- */
const GITHUB_PAGES = process.env.GITHUB_PAGES === "true";

/** The repo name, and therefore the subpath Pages serves this from. */
const PAGES_BASE_PATH = "/ankaa";

const nextConfig: NextConfig = {
  /* ---------------------------------------------------------------------------
   * `X-Powered-By: Next.js` on every response tells an attacker the framework
   * and narrows their exploit search for nothing in return. It is also a byte
   * cost on every single request.
   * ------------------------------------------------------------------------ */
  poweredByHeader: false,

  images: {
    /* -------------------------------------------------------------------------
     * AVIF FIRST, WEBP SECOND.
     *
     * Next 16's default is `['image/webp']` alone — AVIF is opt-in. The source
     * assets in `public/images/` are already .webp, so without this line the
     * optimiser's best case is re-encoding webp to webp.
     *
     * MEASURED with `Network.setCacheDisabled`, headless Edge, full-page
     * scroll so every lazy image fires:
     *      before (webp only)   1440: 620KB / 12 images   430: 509KB / 15
     * The after-numbers and the per-image breakdown are in DEPLOY.md. Content
     * negotiation is by `Accept`, so a browser too old for AVIF silently gets
     * the webp — there is no fallback to write and nothing to detect.
     *
     * Cost, stated: AVIF encodes slower than webp, so the FIRST request for
     * each variant on Vercel is slower. Every later one is a cache hit.
     * ---------------------------------------------------------------------- */
    formats: ["image/avif", "image/webp"],

    /* On the Pages target there is no optimiser, so the loader must be turned
       off or `next build` refuses to export. See the GITHUB_PAGES block. */
    ...(GITHUB_PAGES ? { unoptimized: true } : {}),

    /* -------------------------------------------------------------------------
     * `deviceSizes` and `imageSizes` are LEFT AT THE DEFAULTS ON PURPOSE, and
     * that is a finding, not an omission.
     *
     * Every `sizes` attribute on the site was traced to the variant it actually
     * requests (`_next/image?...&w=`), at 430 and at 1440:
     *
     *     430px   every image      -> w=640   (the smallest device size)
     *     1440px  hero, night      -> w=1920  (sizes="100vw")
     *             aerial (58vw)    -> w=1080
     *             project cards    -> w=640   (sizes="…26rem")
     *             interior thumbs  -> w=640
     *
     * Three of the eight defaults do the work, and the five that look unused —
     * 750, 828, 1200, 2048, 3840 — are the DPR-2 and DPR-3 rungs. A 390px
     * phone at DPR 2 asks for 828; this 1440 desktop at DPR 2 asks for 2880 and
     * gets 3840. Deleting them to "match the breakpoints" would hand every
     * retina phone a blurrier image and save nothing, because a size that is
     * never requested costs nothing.
     *
     * `minimumCacheTTL` is also left at its default 4h, deliberately: the
     * client is due to replace this concept imagery with real photography
     * under the SAME FILENAMES, and a 31-day optimiser cache would keep
     * serving the old renders long after they were swapped.
     * ---------------------------------------------------------------------- */
  },

  /* Static export writes plain files; `basePath` puts them under /ankaa and
     `trailingSlash` emits `board/index.html` rather than `board.html`, which
     is what GitHub Pages resolves reliably on a subpath. */
  ...(GITHUB_PAGES
    ? {
        output: "export" as const,
        basePath: PAGES_BASE_PATH,
        trailingSlash: true,
        /* Readable from components. `?region=` filtering is server-side and
           cannot work on a static host, so the region chips are hidden on this
           target rather than left on screen doing nothing. See projects.tsx. */
        env: { NEXT_PUBLIC_PAGES_PREVIEW: "true" },
      }
    : {
        async headers() {
          return [
            {
              // `/:path*` covers every route AND `/_next/*`, which matters:
              // nosniff and the CSP have to apply to the JS chunks too, not
              // just documents.
              source: "/:path*",
              headers: [
                ...securityHeaders,
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
