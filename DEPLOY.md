# DEPLOY — جمعية العنقاء السكنية

Written by BRIMSTONE, 2026-08-20, against `Next.js 16.3.1` on this machine.
Every number in this file was measured on a production build, not estimated —
except the three LCP figures in §10, which are carried over from the
2026-08-19 QA pass and are labelled as such.

**Who runs what.** Everything below is yours to run. Nothing here was executed
for you, for two reasons that are not negotiable: the `vercel` CLI login is
interactive and hangs an agent, and this repo's working agreement is that the
squad never commits, pushes or creates a remote. The tree has **64 uncommitted
paths** right now and it is meant to.

---

## 0. Before you start — the two things that gate a public launch

1. **`NEXT_PUBLIC_SITE_URL` must be set on the host.** Without it every
   canonical URL, the sitemap, `robots.txt`'s `Sitemap:` line and the OG card
   point at `https://ankaa.example` — an RFC 2606 reserved domain that can
   never be registered. The build prints a warning and continues, so a
   misconfigured deploy does not fail; it just quietly indexes the wrong host.
2. **The client blockers in §10.** The site is honest about what it does not
   know — it renders `يُضاف رقم الترخيص` rather than inventing one — but a
   cooperative that claims `مرخصة` five times with no licence number, and
   publishes no phone number, is not ready to be linked publicly.

---

## 1. Commit

The tree is entirely uncommitted by instruction. Last commit is `eea4c3b`
(JETT wave 2). Everything after it — wave 3, NEON's motion, CYPHER's RTL fixes,
SAGE's QA fixes, and this launch-prep pass — is working-tree only.

```bash
cd "ankaa-next"
git status                 # expect ~64 paths
git add -A
git commit -m "Waves 3-6: sections, motion, RTL audit, QA, launch prep"
```

Two things to decide before `git add -A`:

- **`public/images/real_bulding_all.jpeg` (1.07 MB) and
  `real_bulding_down_camera.jpeg` (737 KB)** are untracked and **referenced by
  nothing** — `grep -rn "real_bulding" src/ public/` returns zero hits. Anything
  under `public/` is served publicly and shipped to the repo. If they are source
  photographs for the Tier‑0 shot list, they belong in `source-assets/`, not
  `public/`. If they are meant to replace the concept renders, they need to be
  converted, sized and wired through `next/image` first. **Do not commit 1.8 MB
  of unreferenced JPEG into `public/` by accident.**
- `src/app/favicon.ico` shows as **deleted**. That is deliberate — it was
  replaced by the generated `src/app/icon.tsx`. Keep the deletion.

`.gitignore` was audited and is correct: `/node_modules`, `/.next/`, `/out/`,
`.env*`, `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`. No stray screenshots,
logs or temp scripts are in the repo — every agent wrote to the scratchpad.

---

## 2. Create the remote

Either path works. The dashboard one needs no CLI auth at all.

**GitHub CLI**

```bash
gh repo create ankaa-next --private --source=. --remote=origin --push
```

**Or by hand**

```bash
git remote add origin git@github.com:<you>/ankaa-next.git
git push -u origin main
```

⚠ This is a **new, separate** repository. `../ankaa_website_v3_2/` is the LIVE
site (`github.com/mo-haj/ankaa` → `mo-haj.github.io/ankaa`) and must not be
touched, pushed to, or used as this repo's remote.

---

## 3. Import into Vercel

Dashboard → **Add New… → Project** → pick the repo. Everything is detected:

| setting | value | why |
|---|---|---|
| Framework | Next.js | auto-detected |
| Build command | `next build` | default |
| Output directory | *(leave empty)* | Next manages it |
| Install command | `npm install` | default |
| Node version | 20+ | Next 16 requires it |

There is **no `vercel.json`** and there should not be. Next is zero-config on
Vercel, and a second source of truth for headers is exactly how a security
header silently stops applying. All headers live in `next.config.ts`.

If you would rather use the CLI: `npx vercel login` opens a browser and
`npx vercel --prod` deploys. Do this yourself — an agent cannot complete the
login.

---

## 4. Environment variables

Vercel → Project → Settings → **Environment Variables**.

| name | value | environments | required |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<the real domain>` | **Production** | ✅ before launch |
| `NEXT_PUBLIC_SITE_URL` | the Vercel preview URL, or leave unset | Preview / Development | optional |

Origin only, **no trailing slash**. `NEXT_PUBLIC_` is required: the value is
inlined at build time and read during static generation, so **changing it needs
a redeploy, not just a save.**

Verified on a build with `NEXT_PUBLIC_SITE_URL=https://ankaa.example.com`:

- `<link rel="canonical">` → `https://ankaa.example.com` and `…/privacy` ✅
- `og:url`, `og:image`, `twitter:image` → all absolute on that host ✅
- `sitemap.xml` → absolute `<loc>` on that host ✅
- `robots.txt` → `Sitemap: https://ankaa.example.com/sitemap.xml` ✅
- placeholder-origin leak scan across `/`, `/privacy`,
  `/projects/firdous-1`, `/styleguide`, a 404 and a bad project slug:
  **0 occurrences of the placeholder origin in any shipped HTML** ✅
- build log: the `[ankaa] NEXT_PUBLIC_SITE_URL is not set` warning disappears ✅

**Not needed yet, and must not be invented:** the enquiry-form transport.
`deliverEnquiry()` in `src/lib/enquiry-transport.ts` is unimplemented and the
form says so, honestly, to the visitor. When the association supplies a real
inbox you will need **both** of:

1. `contactDelivery.value` in `src/content/placeholders.ts` set to the real
   destination address, in writing from the client, and
2. `deliverEnquiry()` implemented against one provider, with its credentials as
   env vars here — `RESEND_API_KEY`, or `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER`
   / `SMTP_PASSWORD`. These are **server-side**: do NOT prefix them
   `NEXT_PUBLIC_`, which would publish them in the client bundle.

`.env.example` documents all of the above. Do not create a committed `.env` or
`.env.local` with a placeholder value — a fake origin that reaches production is
worse than a missing one, because nothing warns.

---

## 5. ⚠ Vercel (or another Node host) is REQUIRED — static export is not viable

`/` is **dynamically rendered (`ƒ`)**. It reads `searchParams` for the projects
region filter (`/?region=fayhaa`), and awaiting `searchParams` opts the route
out of static prerendering.

That filter is not a gimmick: it is five plain `<Link>`s and **zero client
JavaScript**, which is what makes a filtered view linkable, shareable,
back-buttonable, correct on first paint with no flash of the unfiltered set,
and functional with scripting disabled. `<LocationSection>` links into the same
parameter, which is what makes the filter discoverable as geography.

**Consequence: the static-export-to-GitHub-Pages fallback in the original plan
is dead.** `output: "export"` cannot emit a route that reads `searchParams`.

If you ever need the static path back, the cost is one of:

- **Partial Prerendering** — a `next.config.ts` flag plus a `<Suspense>`
  boundary around `<Projects>`. Recovers a static shell with the filtered rail
  streamed. Cheapest by far, but it changes rendering for every section, so it
  is a squad-wide decision, not a deploy-time one.
- **Move the filter to the client** — `useSearchParams()` in a client
  component. Costs a client bundle on the most-read section of the site and
  reintroduces the unfiltered flash. Not recommended.
- **Six static routes** — `/`, `/mintaqa/[region]`. Static, no JS, but it
  fragments the home page into six near-duplicate URLs and needs canonical
  handling. Real work, not a config change.

Everything else is already static: `/privacy`, `/styleguide`, all six
`/projects/[slug]`, the 404, and the four generated images.

---

## 6. Custom domain

1. Vercel → Project → Settings → **Domains** → add the apex (`example.sy`) and
   `www`.
2. At the registrar, add what Vercel shows you — usually `A 76.76.21.21` for
   the apex and `CNAME cname.vercel-dns.com` for `www`. Vercel issues the TLS
   certificate automatically once DNS resolves; it can take up to an hour.
3. Pick one canonical host in Vercel (apex **or** `www`) and let it redirect
   the other. Then **set `NEXT_PUBLIC_SITE_URL` to that exact host and
   redeploy** — canonical tags and the sitemap must name the host you chose,
   not the one that redirects.

**HSTS, and why it currently stops short.** `next.config.ts` ships
`Strict-Transport-Security: max-age=63072000` — deliberately **without**
`includeSubDomains` and **without** `preload`. Both are one-way doors:

- `includeSubDomains` forces HTTPS on every subdomain of the final domain,
  including any webmail, cPanel or office box that may still be plain HTTP.
  A visitor who loaded this site once would be unable to reach them for two
  years.
- `preload` bakes the domain into a list compiled into browsers; removal takes
  months.

**Upgrade step, once you know what else lives under the domain:** if every
subdomain is HTTPS, change the value to
`max-age=63072000; includeSubDomains; preload` and submit at hstspreload.org.
Not before.

---

## 7. Security headers — what ships, and the CSP decision

All of these were verified live with `curl -D -` against `npm run start`, and
they apply to `/_next/*` chunks as well as documents (`source: "/:path*"`).

| header | value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `Strict-Transport-Security` | `max-age=63072000` |
| `Content-Security-Policy` | `base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'` |
| `X-Powered-By` | **removed** (`poweredByHeader: false`) |

### Why the CSP is four directives and not ten

A strict policy was **built and measured**, not assumed. With
`default-src 'self'; script-src 'self'; style-src 'self'; …` enforcing, in
headless Edge 151 at 1440, counted through a `securitypolicyviolation`
listener:

| route | violations |
|---|---|
| `/` | **21** — 3 `script-src-elem`, 18 `style-src-attr` |
| `/projects/firdous-1` | **12** — 10 `script-src-elem`, 2 `style-src-attr` |

The three blocked scripts on `/` are exactly the three inline `<script>`
elements the document ships that are actually JavaScript:

1. the ~296-byte **intro guard** in `layout.tsx`, which must run before first
   paint;
2. Next's own `(self.__next_f=self.__next_f||[]).push([0])`; and
3. Next's 220 KB RSC flight payload push.

Blocking (2) and (3) means the App Router payload never reaches the client.
Measured consequences on the same page after the block:

- `data-scrolled` still `"false"` at `scrollY 2000` — `<HeaderMotion>` never
  ran, so the header is **white type on cream** over every light section: the
  exact legibility bug NEON was brought in to fix, reintroduced.
- **5 of 5** `[data-prevent-flicker]` nodes still `visibility: hidden` — the
  SplitText pre-hide is released by JS, so **the hero headline never appears.**
- no Lenis class, no smooth scroll, no GSAP.
- Screenshot: a dark hero with a half-drawn blueprint, no headline, no CTA.

The 18 `style-src-attr` violations on `/` match the document's 18 `style=""`
attributes one-for-one, and GSAP writes more of them at runtime.

**One thing that is NOT broken, contrary to the obvious assumption:** the three
`<script type="application/ld+json">` blocks are untouched. `/` ships 6 inline
scripts, 3 of them `ld+json`, and only 3 violations were raised — browsers
never execute a non-JS script type, so CSP has nothing to stop. **The
structured data survives an enforcing policy.**

**Report-Only was considered and rejected.** With no `report-uri` collector it
enforces nothing and prints 21 red console errors on every visit, for every
visitor, forever. That is a cost with no benefit.

So what ships is the subset that needs no nonce and was verified to break
nothing: `base-uri`, `form-action`, `frame-ancestors`, `object-src 'none'`.
Verified after shipping: **0 violations on `/`**, contact form still submits
(both the invalid path with four Arabic field errors and the valid path with
the honest "not sent" message), header solidifies, SplitText releases, Lenis
runs, 0 horizontal overflow at 430 and 1440.

⛔ **Do not add `default-src` to that list.** It applies to `script-src` and
`style-src` by fallback and reintroduces every failure above.

### The enforcing version, and what it would cost

1. `src/middleware.ts` mints a per-request nonce and sets
   `script-src 'self' 'nonce-<n>' 'strict-dynamic'`.
2. The nonce is threaded to the inline intro guard in `layout.tsx` and to every
   `<script type="application/ld+json">` (harmless, but consistent).
3. `style-src` still needs `'unsafe-inline'` for as long as GSAP owns the
   motion — GSAP animates by writing inline styles and there is no nonce for a
   `style=""` attribute.
4. **The cost that matters:** middleware runs on every request, so `/privacy`,
   the six project pages, the 404 and the generated images stop being served
   as static files from the CDN. You would trade CDN delivery on every static
   route for a `script-src` that still cannot cover inline styles.

That is a real trade-off, not an oversight. Revisit it if the site ever accepts
user-generated content or third-party scripts; today it accepts neither.

---

## 8. Image formats — measured before and after

`next.config.ts` sets `images.formats: ["image/avif", "image/webp"]`. Next 16's
default is `["image/webp"]` alone, and the source assets in `public/images/` are
already `.webp`, so without this the optimiser's best case was re-encoding webp
to webp.

Measured in headless Edge with `Network.setCacheDisabled`, scrolled to the
bottom so every lazy image fires:

| viewport | before (webp only) | after (avif) | change |
|---|---|---|---|
| 1440 | 620 KB / 12 images | **346 KB** | **−44 %** |
| 430 | 509 KB / 15 images | **175 KB** | **−66 %** |

Total transfer on `/` went from 1644 KB to **1187 KB** at 1440, and from 951 KB
to **853 KB** at 430 (the rest is font 323 KB + script 319 KB, which AVIF does
not touch).

Content negotiation is by `Accept`, so a browser too old for AVIF silently gets
the webp. Cost: AVIF encodes slower, so the first request for each variant on
Vercel is slower; every later one is a cache hit.

**`deviceSizes` / `imageSizes` are left at the defaults, and that is a finding.**
Every `sizes` attribute was traced to the variant it actually requests:
at 430 everything asks for `w=640`; at 1440 the hero and night render ask for
`w=1920`, the aerial (58vw) for `w=1080`, and the project cards and interior
thumbs for `w=640`. The five defaults that look unused (750, 828, 1200, 2048,
3840) are the DPR‑2 and DPR‑3 rungs — a 390px phone at DPR 2 asks for 828.
Deleting them would blur every retina phone and save nothing.

`minimumCacheTTL` is also left at its default 4 h **on purpose**: the client is
due to replace this concept imagery with real photography under the same
filenames, and a 31-day optimiser cache would keep serving the old renders long
after the swap.

---

## 9. Post-deploy smoke checklist

Run these against the production URL. They take about three minutes.

**Routes — every one of these must return the status shown**

```bash
BASE=https://<your-domain>
for p in / /privacy /projects/firdous-1 /styleguide /robots.txt /sitemap.xml \
         /icon /apple-icon /opengraph-image /twitter-image; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)  $p"      # expect 200
done
for p in /this-does-not-exist /projects/nope; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)  $p"      # expect 404
done
```

**Headers**

```bash
curl -sI $BASE/ | grep -iE 'content-security|x-frame|referrer|permissions|strict-transport|x-content|x-powered'
```
`x-powered-by` must be **absent**. The other six must be present.

**Arabic renders RTL** — open `/` and confirm `<html lang="ar" dir="rtl">` in
view-source. Then check the same on `/privacy`, a project page, and a 404. All
four were verified locally; the 404 was verified **with JavaScript disabled**
too (`direction: rtl`, a real `<h1>` in the served HTML).

**The OG card** — paste the URL into the WhatsApp compose box, or
`opengraph.xyz`. Expect a 1200×630 dark-green card with the gold mark and the
association's full legal name. If it shows a broken image or an
`ankaa.example` host, `NEXT_PUBLIC_SITE_URL` is unset or the deploy predates
setting it — **redeploy, do not just save the variable.**

**The contact form is honest** — fill it in with a real-looking name and phone
and submit. It must say, verbatim:

> لم يُرسَل الطلب. لا يوجد حتى الآن عنوان استقبال معتمد لدى الجمعية، ولم تُحفظ البيانات التي كتبتها.

If it ever says anything that implies the message was sent while
`deliverEnquiry()` is still unimplemented, **that is a launch-blocking bug** —
people are handing over a phone number about a housing purchase.

Submit it empty too: four Arabic field errors and
`راجع الحقول المعلَّمة ثم أعد الإرسال.`

**The 404** — visit a nonsense path. Expect the Arabic RTL page with the site
header, the gold accent, and the six section links, not Next's English
"404 | This page could not be found".

**The gaps audit** — `curl -s $BASE/ | grep -c data-pending` returns the number
of facts the association still owes. It is not zero, and §10 is why.

---

## 10. Pre-launch client blockers

**These are not deploy steps. They are the reason the site should not be
publicly linked yet.** SOVA found 19 gaps; `src/content/placeholders.ts` names
each one with exactly what is needed. Highest value first:

1. **Licence / registration number, the issuing authority, and a photograph of
   the certificate.** The site claims `مرخصة` five times with no number. For a
   Syrian cooperative this *is* the trust signal. The ministry emblem is
   deliberately not shipped — it needs written authorisation, and the licence
   photograph is the better answer anyway.
2. **A phone number, a WhatsApp number, and a monitored email inbox.** None
   exist on the site today. `info@example.com` must never come back.
3. **The contact form has nowhere to send mail.** `sent` is unreachable by
   construction — see §4. Until `deliverEnquiry()` exists the form honestly
   says it did not send.
4. **Floor plans.** `source-assets/Residential_complex/معماري66.dwg` already
   contains them. Exporting to SVG is the cheapest high-value win on the
   project and fills the highest-intent section.
5. **The chairman's name and a consented portrait.** `abo_hmza.webp` is 23 KB
   and visibly over-compressed.
6. Prices, the instalment schedule, delivery dates; the office address and
   hours; the bylaws PDF; the privacy-policy text.
7. **Real photography is the biggest single lever.** Tier‑0 shot list in SOVA
   brief §18. Current images are concept renders (`صور تصورية` ×24) and the
   interior library is three files.

**Copy flag — do not silently fix.** Membership condition 05 ships verbatim as
`والروابط المالية` where `والضوابط المالية` is almost certainly intended. It is
a stated condition of a regulated cooperative and needs written client
instruction to change.

**One open art-direction decision, also not ours to take.** (Numbers from the
2026-08-19 QA pass, not re-measured here.) A first-time visitor waits
**2556 ms** for the hero text because the cinematic intro reveals it — right at Google's "good" LCP threshold *on localhost with zero latency*,
and worse from Syria. Returning visitors (828 ms) and reduced-motion users
(392 ms) are unaffected. Either keep it — the intro is the site's signature and
only new visitors pay — or start the headline reveal earlier so text lands at
~1.2–1.5 s while the blueprint keeps drawing.

---

## 11. Build reference

`npx tsc --noEmit`, `npm run lint` and `npm run build` all exit 0.

```
Route (app)                       render
/                                 ƒ   dynamic — reads searchParams (see §5)
/_not-found                       ○   static
/(.)projects/[slug]               ƒ   dynamic — the intercepted overlay
/apple-icon                       ○   static
/icon                             ○   static
/opengraph-image                  ○   static
/privacy                          ○   static
/projects/[slug]                  ●   SSG ×6 (generateStaticParams)
/robots.txt                       ○   static
/sitemap.xml                      ○   static
/styleguide                       ○   static
/twitter-image                    ○   static
```

Turbopack builds do not emit `app-build-manifest.json`, so there is no First
Load JS column. Measured in the browser instead, cache disabled, at 1440:

| route | script | document | css |
|---|---|---|---|
| `/` | 319.4 KB (16 files) | 78.6 KB | 20.2 KB |
| `/privacy` | 290.5 KB (14) | 29.3 KB | 20.2 KB |
| `/projects/firdous-1` | 290.5 KB (14) | 30.5 KB | 20.2 KB |
| `/styleguide` | 296.9 KB (15) | 67.8 KB | 20.2 KB |
| 404 | 290.5 KB (14) | 18.5 KB | 20.2 KB |

**The 290 KB floor is the thing to notice.** Every route — including the 404,
which has no motion at all — pays for GSAP, Lenis, `<SmoothScrollProvider>` and
`<HeaderMotion>`, because they are mounted in the root layout. Splitting the
motion stack behind a `next/dynamic` boundary on routes that have no hero is
the single largest JS win available, and it belongs to whoever owns motion, not
to a deploy pass.

### Dependencies that are in the wrong section

Not fixed here — moving them changes `package.json`, which affects everyone's
lockfile, and it changes nothing about what ships to a browser. Flagged for the
next person who touches `package.json`:

| package | in | reality |
|---|---|---|
| `shadcn` (6.2 MB) | `dependencies` | the CLI, used only via `npx shadcn add`. Belongs in `devDependencies`, or nowhere — `npx shadcn@latest` works without it installed. |
| `tw-animate-css` | `dependencies` | imported by `globals.css` and compiled away at build. Build-time only. |
| `sonner` + `next-themes` | `dependencies` | imported **only** by `src/components/ui/sonner.tsx`, which nothing mounts — the `<Toaster />` was deliberately removed from the layout because it shipped an English-labelled `aria-live` landmark into an Arabic document. Neither package reaches the client bundle today. Keep them only if toasts are actually coming. |

`embla-carousel-react` **is** genuinely used (`projects-rail.tsx`) — leave it.
