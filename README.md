# جمعية عنقاء السكنية — Ankaa Housing Association

Next.js rebuild of the Ankaa site. **Arabic-first, RTL from commit 1.**

Scaffolded by **KILLJOY**. This repo is the foundation only — there is no real
page content yet. ASTRA (design system) → JETT (build) → NEON (motion) →
CYPHER (RTL audit) come next.

> This is a **separate repository** from the live vanilla site
> (`ankaa_website_v3_2/` → `github.com/mo-haj/ankaa`). Never cross-commit.
> No git remote is configured here on purpose.

---

## Stack (exact versions as installed)

| Package                    | Version  | Notes |
| -------------------------- | -------- | ----- |
| `next`                     | 16.3.1   | App Router, **Turbopack is the default bundler** for dev *and* build |
| `react` / `react-dom`      | 19.2.8   | |
| `typescript`               | 5.9.3    | |
| `tailwindcss`              | **4.3.3** | **v4 — CSS-first.** There is **no `tailwind.config.ts`.** Tokens live in `@theme` inside `src/app/globals.css` |
| `@tailwindcss/postcss`     | 4.3.3    | |
| `eslint` / `eslint-config-next` | 9.39.5 / 16.3.1 | flat config |
| `shadcn`                   | **4.18.0** | **CLI v4** — see the shadcn notes below, a lot changed |
| `radix-ui`                 | 1.6.7    | single-package Radix (not per-primitive packages) |
| `lucide-react`             | 1.31.0   | icons |
| `clsx` / `tailwind-merge`  | 2.1.1 / 3.6.0 | behind `cn()` in `src/lib/utils.ts` |
| `class-variance-authority` | 0.7.1    | |
| `tw-animate-css`           | 1.4.0    | replaces `tailwindcss-animate` on v4 |
| `gsap` / `@gsap/react`     | 3.15.0 / 2.1.2 | cinematic scroll |
| `lenis`                    | 1.3.26   | smooth scroll (current package; **not** `@studio-freight/lenis`) |
| `motion`                   | **13.1.0** | UI micro-motion — see "framer-motion vs motion" below |
| `sonner` / `next-themes`   | 2.0.8 / 0.4.6 | pulled in by the `sonner` component |
| `embla-carousel-react`     | 8.6.0    | pulled in by the `carousel` component |

### framer-motion vs motion — which one, and why

Installed: **`motion`** (v13).

`framer-motion` is the legacy name. The library was renamed and now ships as
`motion`; React bindings import from `motion/react`. New third-party registries
(Animate UI in particular) are written against `motion/react`.

Caveat worth knowing: some **older** community components — several Vengeance UI
items, and a few older Magic UI ones — still declare `framer-motion` as a
dependency and `import { motion } from "framer-motion"`. If you pull one of
those, **rewrite the import to `motion/react`** rather than installing
`framer-motion` alongside. Two copies of the animation runtime in one bundle is
a real bug, not just bloat.

---

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint (must be clean)
```

Verified green after ASTRA's design-system pass: `npm run build` ✓ and
`npm run lint` ✓ (zero warnings).

---

## RTL discipline — read this before writing a single class

The document is `lang="ar" dir="rtl"` (`src/app/layout.tsx`). The layout mirrors
automatically **only if you use logical properties.**

| Never write        | Always write            |
| ------------------ | ----------------------- |
| `ml-*` / `mr-*`    | `ms-*` / `me-*`         |
| `pl-*` / `pr-*`    | `ps-*` / `pe-*`         |
| `left-*` / `right-*` | `start-*` / `end-*`   |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l-*` / `border-r-*` | `border-s-*` / `border-e-*` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |
| `float-left` / `float-right` | `float-start` / `float-end` |

**Why this matters more than it looks:** a physical class renders correctly on
your screen while you build in English-reading habits, and is mirrored-wrong for
every actual user of the site. It is the single easiest way to ship a broken
Arabic layout that passes a casual review.

This is **enforced by ESLint** (`eslint.config.mjs`) as a **warning** on any
`className` containing a physical-direction class. It is a warning rather than an
error because a small number of elements genuinely must not mirror (an embedded
LTR map control, a Latin wordmark). Those are rare. Silence one with an inline
`// eslint-disable-next-line no-restricted-syntax` **plus a one-line reason.**

Other RTL foundations already in place:

- **`DirectionProvider dir="rtl"`** wraps the tree in `layout.tsx`. Radix
  primitives read direction from React context, not from the DOM — without this,
  popovers, menus, tabs and the carousel compute their side/align against LTR
  even though the page is mirrored.
- `components.json` has `"rtl": true`, so **shadcn CLI v4 emits components with
  logical properties already**. Anything you `shadcn add` from now on is
  RTL-correct out of the box.
- **Horizontal scroll is the one thing logical properties do not fix.** RTL
  `scrollLeft` is negative in Chromium/Firefox. If NEON adds horizontal Lenis or
  a GSAP horizontal pin, the sign must be flipped by hand.

### Arabic typography

Set in `src/app/globals.css`:

- **`letter-spacing: 0 !important`** across the RTL tree. Arabic is a *cursive*
  script — letters physically join. Any non-zero tracking severs those joins and
  renders words as disconnected glyphs. Latin `tracking-*` must never reach
  Arabic text. Opt a genuinely-Latin run back out with `lang="en"` or
  `class="latin"`.
- **`line-height: 1.8`** on `html`. Arabic needs more leading than Latin —
  taller ascenders/descenders, and tashkeel sit above and below the baseline.
  Headings drop to `1.35`.

### Fonts (`next/font/google`, self-hosted, zero layout shift)

All three families were confirmed present in Next 16's Google Fonts data with
both `arabic` and `latin` subsets. **Nothing had to be substituted.**

| Role | Family | CSS var | Tailwind class |
| ---- | ------ | ------- | -------------- |
| Display / headings | **Alexandria** (variable) | `--font-display` | `font-display` |
| Body (default) | **IBM Plex Sans Arabic** (300–700 static) | `--font-body` | `font-body`, also `font-sans` |
| Editorial accent | **Noto Naskh Arabic** (variable) | `--font-naskh` | `font-naskh` |

Noto Naskh is **wired up but deliberately not applied globally** — reach for
`font-naskh` on quotation/editorial moments only (e.g. the president's message).

IBM Plex Sans Arabic has no variable build, so its weights are enumerated
explicitly — ASTRA trimmed them to **400 / 500 / 600**, the three the type system
actually uses. Alexandria and Noto Naskh are variable — do **not** add a `weight`
array to those, it forces static cuts and increases payload.

---

## Design system — delivered by ASTRA

Everything lives in **`src/app/globals.css`**. There is no `tailwind.config.ts`
(Tailwind v4). The file has a numbered header explaining its own layout — read
that before writing a class.

**`/styleguide` renders the entire system** with every type token at real size,
the full palette, and **live WCAG ratios computed at build time**. Check there
first; it cannot drift, because it parses `globals.css` rather than restating it.

### The one idea

```tsx
<Section theme="dark" surface={2} space="lg">…</Section>
```

`data-theme` swaps the ground tokens — `--bg --fg --fg-muted --fg-subtle --line
--line-strong --accent-gold --accent-hair --kicker` — **and** the whole shadcn
semantic layer beneath it. Write a component once against those tokens and it is
correct on a light band and a dark one. **There is no `onDark` prop.**

### The light/dark axis — KILLJOY's open question, resolved

The scaffold had two independent "is this dark?" signals: `.dark` (next-themes
site-wide **mode**) and `[data-theme="dark"]` (per-section **ground**). They
collide in the place that matters: every vendored shadcn component styles itself
with `dark:` utilities, so an `<Input>` inside a dark *section* would have kept
its light-mode look — 17 components, silently wrong, across ~45% of the page.

**Resolution: one axis, and the section ground is the truth.**

```css
@custom-variant dark (&:is([data-theme="dark"], [data-theme="dark"] *, .dark, .dark *));
```

One line makes every vendored `dark:` utility correct inside a dark section
without forking a component. `[data-theme="dark"]` additionally remaps the whole
shadcn semantic layer, so components using `bg-card`/`text-muted-foreground`
rather than `dark:` are correct too. `.dark` is kept as an alias of the same
block so next-themes still works if it is ever wired — but it is **not** how this
site themes. **Never put `data-theme` on `<html>`.**

There is deliberately **no theme toggle**. SOVA §13.5 specifies a fixed
light/dark alternation by section; a user-level toggle would fight it.

### Colour — audited, not asserted

| Group | Tokens |
| --- | --- |
| Light grounds | `surface-0` `#fbfaf6` · `surface-1` `#f6f4ee` · `surface-2` `#ece8dc` |
| Dark grounds | `surface-inverse-1` `#002724` · `-2` `#00201d` · `-3` `#001613` |
| Ink on light | `ink-1` `#0e1c19` · `ink-2` `#3a4a46` · `ink-3` `#5c6763` |
| Ink on dark | `ink-inv-1` white · `-2` 78% · `-3` 58% |
| Brand | `brand-900` `#002724` · `brand-800` `#0a3b36` · `brand-600` `#275c55` |
| Gold | `gold-700` `#756435` · `gold-500` `#b8a57a` · `gold-300` `#d7cca9` |
| Lines | `line-1/2`, `line-inv`, `line-inv-2` + a six-stop `veil-*` alpha ladder |

**Two SOVA values were changed because they fail AA. Both are fixed, not documented:**

| Token | Brief proposed | Measured | Shipped | Now |
| --- | --- | --- | --- | --- |
| `gold-700` | `#8e7f58` | 3.77 / 3.58 / **3.22** — fails | **`#756435`** | 5.54 / 5.26 / **4.72** |
| `ink-3` | `#69746f` | 4.65 / 4.41 / **3.96** — fails | **`#5c6763`** | 5.62 / 5.34 / **4.79** |

(ratios against surface-0 / surface-1 / surface-2)

**Every text pairing the system permits passes WCAG AA.** The full table is
printed on `/styleguide`.

### The gold is the logo's gold

`ankaa-mark.png` and `ankaa-logo.png` are flat artwork: **45.7% / 37.3% of their
opaque pixels are exactly `#b8a57a`.** The value the old site shipped
(`#b9aa81`) is ΔE00 **1.97** away and hue-shifted the wrong way — true gold sits
at Lab a\* **+0.45** (warm), the old value at **−0.93** (cool). `gold-500` is now
the measured fill, and 700/300 are re-derived from it at the same hue angle
(88.96°) so all three read as one metal. **Do not reinstate `#b9aa81`.**

Policy (SOVA §13.4), enforced by the token names:

- `gold-700` — the **only** gold allowed as text on a light ground
- `gold-500` — **non-text only**: hairlines, dots, 1px borders, the mark
- `gold-300` — text and CTAs on dark grounds only
- prefer `text-accent-gold` (flips 700 ⇄ 300 automatically) over a literal
- **one gold element per section, maximum**; gold never exceeds ~5% of a viewport

### Type — twelve tokens, hard floor 13px

`text-display-1 · display-2 · h1 · h2 · h3 · h4 · lead · body · body-sm · label ·
caption · quote · stat`

Nothing under 13px may exist as a token. The old site shipped **12 sizes at or
below 13px, four at or below 10px** — deleting that cluster is the single biggest
luxury gain in the rebuild, and it is why the display size stayed at 84px rather
than inflating to Rio's 120px+ (an Arabic headline that large reads as a wall of
strokes). `letter-spacing` is locked to `0`; body `line-height` stays 1.9.

### Space, radius, elevation, motion

- **Space:** one 4px ladder — `0 1 2 3 4 6 8 12 16 24 32 40 50` (0–200px).
- **Radius:** `rounded-field` 8 · `rounded-md` 12 · `rounded-card` 16 ·
  `rounded-figure` 24 · `rounded-media` 32 · `rounded-full`. Buttons are pills.
- **Elevation:** `shadow-sm` and `shadow-lg` only; the default is a hairline.
- **Motion:** `--ease-out-expo` (house ease), `--ease-out-quart`,
  `--dur-fast/base/slow`.
- **Section rhythm:** `space="sm|default|lg|hero"`. A light↔dark flip gets `lg`.
- **Breakpoints:** Tailwind defaults — 640 / 768 / 1024 / 1280 / 1536.

### Derived from the mark, not chosen

The mark is a phoenix whose wing sweeps over three rising towers. Both shapes
were measured off the PNG rather than eyeballed:

| Measurement | Value | Becomes |
| --- | --- | --- |
| Wing outer edge | circular arc, **R 490.4px** over a **321.2px** chord, mean deviation **0.91px** | `--arc-radius-ratio: 1.527` |
| Sagitta ÷ chord | **8.41%** | `--arc-rise` · `<WingArc>` · `<WingRule>` |
| Subtended angle | **38.27°** | `--arc-sweep` |
| Tower heights | 85 / 123 / 171px → ×1.45, ×1.39 (mean **√2**) | `--step-ratio: 1.414`, the radius ladder |

### What ASTRA built

```
src/app/globals.css            the whole token layer + theming mechanism
src/app/styleguide/            the proof — live palette, type, contrast, components
src/components/layout/         Container · Section · Ground · SectionHeader
                               Accent · Display · Lead · Label · Prose
src/components/brand/          AnkaaMark (traced SVG) · WingArc · WingRule
src/lib/contrast.ts            WCAG ratio maths used by the styleguide
src/lib/tokens.ts              build-time reader for globals.css
src/lib/utils.ts               cn() taught this theme (see the trap below)
```

Restyled to the brand: `button` `card` `badge` `separator` `input` `textarea`
`label` `accordion` `field`. The other eight vendored components inherit
correctness through the shadcn semantic layer.

`<AnkaaMark />` is a **real vector trace** of `ankaa-mark.png` — alpha
supersampled 6×, marching-squares iso-contour, Schneider cubic-Bézier fitting —
verified by rasterising it back and comparing masks: **IoU 0.9917**. Do not hand-edit
the path data. It exposes `phoenix` / `towers` / `blade` separately for NEON.

### Two traps that fail silently

1. **Never pair `outline-none` with `focus-visible:outline-*`.** In Tailwind v4
   `outline-none` sets `--tw-outline-style: none`, which `outline-2` then reads,
   producing an invisible focus ring and no build error. The scaffold's shadcn
   components shipped exactly that pairing; it is removed from
   button/input/textarea/accordion.
2. **Register new tokens in `src/lib/utils.ts`.** `cn()` is an
   `extendTailwindMerge` instance that knows this theme. An unregistered token
   gets mis-grouped and silently dropped — this is what made the primary button's
   label invisible on the dark hero before it was fixed.

---

## Component registries

`components.json` already declares four registries, so the short
`@namespace/component` form works directly:

```jsonc
"registries": {
  "@magicui":     "https://magicui.design/r/{name}",
  "@animate-ui":  "https://animate-ui.com/r/{name}.json",
  "@skiper-ui":   "https://skiper-ui.com/registry/{name}.json",
  "@vengeanceui": "https://www.vengeanceui.com/r/{name}.json"
}
```

**Verified working** (smoke-tested during scaffold):

```bash
npx shadcn@latest add @magicui/marquee -y
```

That pulled `src/components/ui/marquee.tsx` **and** appended its keyframes into
`globals.css` automatically. The Magic UI pipeline is proven end-to-end.

These are **copy-in registries, not npm dependencies.** There is no
"Magic UI package" to install — the CLI copies source files into your repo,
which you then own and edit.

Other registries, all confirmed real and resolvable:

- **Animate UI** — `npx shadcn@latest add @animate-ui/<name>` — 580 items.
  Names are path-shaped, e.g. `components-animate-tabs`,
  `components-backgrounds-gradient`. Browse `https://animate-ui.com/r/registry.json`.
- **Skiper UI** — `npx shadcn@latest add @skiper-ui/<name>` (e.g. `skiper40`).
  24-ish free components; the rest are paid and need a license key.
- **Vengeance UI** — `npx shadcn@latest add @vengeanceui/<name>`. Real, but it
  is **not** listed in the official shadcn registry directory, its index is a
  bare JSON array rather than a proper registry object, and several items still
  depend on legacy `framer-motion`. Treat it as the least-trusted of the four
  and read what it copies in.

**Pull only what a section actually uses. Do not bulk-add.** Every component you
add is source code this squad now maintains.

> **"Animaster" does not exist.** It was in the original brief and could not be
> verified as a real package or registry. Magic UI / Animate UI are its
> replacement. Do not go looking for it.

### shadcn CLI v4 — things that changed and will trip you up

- **`--base-color` is gone.** Style is now `--base <base|radix|aria>` (primitive
  library) plus `--preset <nova|vega|maia|lyra|mira|luma|sera|rhea>`.
  This project was initialised with **`--base radix --preset nova`**, which
  resolves to style `radix-nova` with **`baseColor: neutral`** — the untinted
  base the brief asked for, so the Ankaa palette layers cleanly on top.
  Radix was chosen over Base UI because the third-party registries above are
  overwhelmingly written against the Radix-flavoured shadcn.
- **`init` prompts for a preset even with `-y`.** In a non-interactive shell it
  will hang or die. Always pass `--preset` explicitly.
- **`form` is dead in v4.** `npx shadcn add form` reports success and silently
  writes nothing — the registry item for every v4 style (`radix-nova`,
  `radix-vega`, `base-nova`) is an empty stub with no `files` array. It is only
  populated in the legacy `new-york` / `default` styles. **`field` is the
  successor** and is what this project has (`src/components/ui/field.tsx`:
  `Field`, `FieldSet`, `FieldLabel`, `FieldError`, …).
  If JETT needs react-hook-form + zod validation on the contact form, install
  `react-hook-form zod @hookform/resolvers` and wire it to `field` manually —
  they were **not** pre-installed.

---

## Installed shadcn components (`src/components/ui/`)

`accordion`, `badge`, `button`, `card`, `carousel`, `dialog`, `direction`,
`field`, `input`, `label`, `marquee` (Magic UI), `navigation-menu`, `separator`,
`sheet`, `skeleton`, `sonner`, `tabs`, `textarea`

---

## Folder map

```
src/
  app/                  App Router. layout.tsx owns lang/dir/fonts/metadata
                        and the @modal parallel slot.
                        globals.css is the ENTIRE design system (ASTRA).
                        styleguide/ renders it with live contrast ratios.
                        page.tsx is the real home page (waves 1-2).
                        projects/[slug]/ is the real project page, SSG x6.
                        @modal/(.)projects/[slug]/ intercepts it into an
                        overlay when a card is clicked from /.
  components/
    ui/                 shadcn + registry components (vendored, restyled by ASTRA)
    brand/              AnkaaMark (traced SVG) · WingArc · WingRule
    layout/             Container · Section · SectionHeader · typography
    sections/           hero, trust-strip, story, projects (+ rail, card,
                        detail-panel, overlay), unit-types, interior; wave 3
                        adds process, membership, president, location, faq,
                        contact
    content/fact.tsx    <FactText>/<FactLink>/<FactMedia> — the ONLY sanctioned
                        way to render a client-supplied fact (see
                        src/content/placeholders.ts)
    motion/             reusable motion primitives + smooth-scroll-provider.tsx
  lib/                  utils.ts (cn, theme-aware) · contrast.ts · tokens.ts
  content/              Arabic copy — JETT fills this from SOVA's brief
  styles/
public/
  images/               the web assets — renders, photos, logos. EVERYTHING
                        under public/ is deployed, so only web-weight files go
                        here.
source-assets/          NOT served. Raw client source material: the
  Residential_complex/  architect's JPEGs (0.7-1.1 MB), two unencoded MP4s
                        (19 MB / 26 MB) and معماري66.dwg (13.5 MB). JETT wave 2
                        moved this out of public/ — 62 MB of source files were
                        being deployed to serve zero requests. Re-encode into
                        public/images/ before using anything from here; the
                        .dwg is an export job for the client (see
                        `drawings.floorPlans` in src/content/placeholders.ts).
```

`src/components/motion/smooth-scroll-provider.tsx` is written but **not mounted**
— NEON should mount it in `layout.tsx` and do the GSAP ScrollTrigger handshake.
It already guards `prefers-reduced-motion`.

---

## Next steps / handoff

### → ASTRA (design system) — **done**

Delivered: the token layer, the section-theming mechanism, the layout and
typography primitives, nine restyled shadcn components, the traced brand mark,
and `/styleguide` with a live contrast audit. `npm run build` and
`npm run lint` green.

Two SOVA colour values were corrected because they failed AA (`gold-700`,
`ink-3`) and the brand gold was corrected to the logo's measured fill
(`#b8a57a`). See "Design system" above.

**Still open:** the projects rail, dialog, sheet, tabs, navigation-menu and
carousel are token-correct but have not been styled for the brand — they had no
design context to style against until JETT composes the sections that use them.

### → JETT (build)

1. **Delete `src/app/page.tsx`** and compose real sections from
   `src/components/sections/`.
2. Put all Arabic copy in `src/content/` — do not inline strings in components.
   Decide Arabic-Indic (٠١٢٣) vs Western (0123) digits **per string** there;
   it is deliberately not forced globally.
3. Use `next/image` for everything in `public/images/`. The raw client source
   material now lives in `source-assets/`, outside `public/`, because it was
   62 MB of undeployed-but-deployed weight; re-encode anything you need into
   `public/images/` first. The two MP4s (19 MB / 26 MB) need re-encoding to
   SOVA §18's ≤2.5 MB loop spec plus `preload="none"`/poster frames, never
   autoplay of the source file.
4. Logical properties only. Run `npm run lint` and treat the RTL warnings as
   errors unless you have a real reason.
5. Contact form: build on `field`, and install react-hook-form + zod yourself if
   you need validation (see the CLI v4 note above).

### → NEON (motion)

Mount `SmoothScrollProvider`, drive `ScrollTrigger.update()` from Lenis's
`scroll` event, run Lenis's raf off `gsap.ticker`. Mind the RTL horizontal
scroll sign if you pin anything sideways.

### → CYPHER (RTL audit)

The guard rail is a lint **warning**, not proof of correctness. Still needs a
human pass on: mirrored icons (arrows/chevrons that indicate direction),
number/date formatting, bidi-isolation for mixed Arabic/Latin runs
(`unicode-bidi: isolate` / `<bdi>`), and horizontal scroll behaviour.
