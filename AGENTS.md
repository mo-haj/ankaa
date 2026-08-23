<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Operation Ankaa — project rules

Arabic-first site for جمعية عنقاء السكنية. Read `README.md` before working here.

## 1. RTL is not a feature, it is the baseline

The document is `lang="ar" dir="rtl"`. **Use CSS logical properties only.**

- USE: `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s-* border-e-* rounded-s-* rounded-e-*`
- NEVER: `ml-* mr-* pl-* pr-* left-* right-* text-left text-right border-l-* border-r-* rounded-l-* rounded-r-*`

A physical class looks right to an English-reading developer and is
mirrored-wrong for every real user. ESLint warns on this; do not ignore it
without a written reason.

## 2. Arabic typography

- `letter-spacing` is locked to `0` in the RTL tree. Arabic is cursive — tracking
  severs the letter joins. Never add `tracking-*` to Arabic text.
- Body `line-height` is `1.8` on purpose. Do not "fix" it to a Latin value.
- Fonts: `font-display` (Alexandria), `font-body` (IBM Plex Sans Arabic),
  `font-naskh` (Noto Naskh Arabic, editorial accent only).

## 3. Tailwind v4 — there is no config file

All tokens live in `@theme` / `:root` / `.dark` inside `src/app/globals.css`.
Do not create `tailwind.config.ts`.

## 4. shadcn CLI v4

- Init requires `--base radix --preset nova`; it prompts for a preset otherwise.
- `shadcn add form` silently writes nothing in v4 — use `field`.
- Registries `@magicui`, `@animate-ui`, `@skiper-ui`, `@vengeanceui` are already
  declared in `components.json`. Pull only what a section uses.

## 5. Do not touch the old site

`../ankaa_website_v3_2/` is the LIVE production site and a separate git repo.
Read from it if you must; never write to it, never run git commands in it.

## 6. Ship green

`npm run build` and `npm run lint` must both pass before handing off.

---

# Design system — ASTRA (binding)

The system lives in `src/app/globals.css`. **Read that file's header before
writing a class.** `/styleguide` renders the whole thing with live contrast
ratios — check there first, not in the CSS.

## 7. Section theming is the whole API

```tsx
<Section theme="dark" surface={2} space="lg">…</Section>
```

`data-theme` swaps `--bg --fg --fg-muted --fg-subtle --line --line-strong
--accent-gold --accent-hair --kicker` **and** the full shadcn semantic layer
beneath it. Write a component once against the ground tokens and it is correct
on both grounds. **There is no `onDark` prop and there must never be one.**

- `theme="light"` surfaces: `0` `#fbfaf6` · `1` `#f6f4ee` · `2` `#ece8dc`
- `theme="dark"` surfaces: `1` `#002724` · `2` `#00201d` · `3` `#001613`
- Per-section assignment table: SOVA brief §13.5.

**One dark axis only.** The `dark:` variant fires on `[data-theme="dark"]` *and*
`.dark`. Do not put `data-theme` on `<html>`, and do not add a theme toggle
without re-reading §0 of `globals.css` first.

## 8. Gold is a metal, not a surface

| Token | Value | Allowed use |
| --- | --- | --- |
| `gold-700` | `#756435` | **the only** gold that may be text on a light ground |
| `gold-500` | `#b8a57a` | **non-text only** — hairlines, dots, 1px borders, the mark |
| `gold-300` | `#d7cca9` | text and CTAs on dark grounds only |

- `#b8a57a` is the **logo's actual fill**, sampled from the PNG. `#b9aa81` (the
  old site's value) is wrong by ΔE00 1.97 and hue-shifted cool. Do not reinstate it.
- Prefer `text-accent-gold` over a literal: it resolves to 700 on light and 300
  on dark automatically. `bg-accent-hair` for the non-text metal.
- **One gold element per section, maximum.** Accent phrase *or* CTA *or* rule —
  never two.
- **`<SectionHeader rule={false}>` whenever the heading contains an `<Accent>`.**
  The kicker's 28px hairline (`.kicker-rule`) is `--accent-hair` = gold-500 and
  the accent phrase is `--accent-gold` — shipping both is two gold elements in
  one section. `rule` defaults to `true`; turning it off leaves the kicker in
  `--kicker` (brand-600 green on light, gold-300 on dark), which costs nothing
  against the budget because weight, not metal, is what marks a label in
  Arabic. Do **not** hand-roll a second header to escape the rule — wave 1 did
  exactly that in Story and wave 2 deleted it. Companion prop `headingId` puts
  the `id` on the heading element rather than the `<header>`, so a section can
  still name itself with `aria-labelledby`.
- **Gold never exceeds ~5% of a viewport.** No gold panels, cards or grounds.
- Never: gold on gold, gold gradients, gold shadows, gold text over a photo
  without a solid scrim.

## 9. Type: thirteen tokens, hard floor 13px

`text-display-1 · display-2 · h1 · h2 · h3 · h4 · lead · body · body-sm ·
label · caption · quote · stat`

Count them: there are **thirteen**, and this heading said "twelve" over the
same list of thirteen until CHAMBER C6 counted them. `src/lib/utils.ts` had the
same error. It matters because of the sentence after this one — a wrong count
tells the next agent the budget is already spent.

Nothing under `0.8125rem` (13px) may exist. If something "needs" 11px it needs
to be 13px and quieter. Never add a fourteenth token without deleting one.
`letter-spacing` stays `0` (rule 2 above) and body `line-height` stays Arabic.

## 10. Space, radius, elevation

- **Space ladder:** `0 1 2 3 4 6 8 12 16 24 32 40 50` (= 0–200px). Nothing off it.
- **Radius:** `rounded-field` 8 · `rounded-md` 12 · `rounded-card` 16 ·
  `rounded-figure` 24 · `rounded-media` 32 · `rounded-full`. Buttons are pills.
- **Elevation:** `shadow-sm` and `shadow-lg` only. The default is a `border-line`
  hairline — reach for a border before a shadow.
- **Motion:** `--ease-out-expo` is the house ease. `--dur-fast/base/slow`.
- **Section rhythm:** a light↔dark flip gets `space="lg"`; same-theme siblings
  get the default; the first section after the hero gets `space="hero"`.

## 11. Two traps that fail silently

1. **Never pair `outline-none` with `focus-visible:outline-*`.** In Tailwind v4
   `outline-none` sets `--tw-outline-style: none`, which `outline-2` then reads —
   producing an invisible focus ring with no build error. ASTRA removed this
   pairing from button/input/textarea/accordion.
2. **New tokens must be registered in `src/lib/utils.ts`.** `cn()` is an
   `extendTailwindMerge` instance that knows this theme's colours, type sizes and
   radii. A token that is not in those lists will be mis-merged and silently
   dropped (this made the primary button's label invisible once already).

## 12. The mark

`<AnkaaMark />` in `src/components/brand/` is a real vector trace of
`public/images/ankaa-mark.png` (IoU 0.9917). It inherits `currentColor`.
**Do not hand-edit the path data.** Brand marks and `<WingArc>`/`<WingRule>` do
**not** mirror in RTL — a logo keeps its handedness in every language.
Directional *icons* do mirror: mark them `data-direction`.

Derived geometry, all tokens in `globals.css`:
`--arc-radius-ratio 1.527` · `--arc-rise 8.41%` · `--arc-sweep 38.2deg` ·
`--step-ratio 1.414`.
