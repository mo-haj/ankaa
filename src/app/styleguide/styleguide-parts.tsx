import * as React from "react";

import { cn } from "@/lib/utils";
import { assess, composite, fmt, toHex, type Requirement } from "@/lib/contrast";

/* -----------------------------------------------------------------------------
 * Small presentational pieces for /styleguide. Kept out of page.tsx so the page
 * itself reads as an outline of the system rather than a wall of markup.
 * -------------------------------------------------------------------------- */

/** A numbered block heading. */
export function Block({
  n,
  title,
  note,
  children,
  className,
}: {
  n: string;
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  /* ⛔ `min-w-0` — VIPER V-4, and it is the line that actually closed it.
     These blocks are items of `page.tsx`'s `grid gap-24`, and a grid item's
     `min-width` is `auto`: it refuses to shrink below the min-content width
     of ANYTHING inside it. One wide demo — the space ladder's un-shrinkable
     360px row — therefore set the width of every block on the page and
     widened the document to a flat `scrollWidth` 388 at every viewport
     ≤388, taking the fixed header with it (68px of sideways scroll at 320).

     MEASURED: wrapping the ladder in `overflow-x-auto` changed nothing on
     its own — `scrollWidth` stayed at exactly 388 — because the overflow
     was being carried by this element, three levels up. Adding `min-w-0`
     here alone drops it to 320. Both are kept: this stops a wide child from
     widening the page, and the wrapper gives the ladder somewhere to go. */
  return (
    <section className={cn("border-line min-w-0 border-t pt-10", className)}>
      <header className="mb-10 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="text-label text-fg-subtle mb-2 font-semibold tabular-nums">
            {n}
          </div>
          <h2 className="font-display text-h2 text-fg font-semibold">{title}</h2>
        </div>
        {note ? (
          <p className="text-body-sm text-fg-muted max-w-[52ch] text-pretty lg:col-span-4 lg:col-start-9">
            {note}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** A labelled sub-group inside a block. */
export function Group({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 last:mb-0", className)}>
      {title ? (
        <h3 className="kicker-rule text-label text-kicker mb-5 flex items-center font-semibold">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}

/** One colour chip: swatch, name, value. */
export function Swatch({
  name,
  value,
  on,
  role,
}: {
  name: string;
  value: string;
  /** Ground it is drawn against, so translucent tokens show their real colour. */
  on?: string;
  role?: string;
}) {
  const effective = on ? toHex(composite(value, on)) : value;
  const translucent = on !== undefined && effective.toLowerCase() !== value.toLowerCase();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        className="border-line rounded-field h-16 w-full border"
        style={{ background: on ?? "transparent" }}
      >
        <div className="size-full" style={{ background: value }} />
      </div>
      <div className="min-w-0">
        <div className="text-label text-fg font-semibold">{name}</div>
        <div className="latin text-caption text-fg-subtle tabular-nums">
          {value}
          {translucent ? ` → ${effective}` : ""}
        </div>
        {role ? <div className="text-caption text-fg-subtle">{role}</div> : null}
      </div>
    </div>
  );
}

/** One measured pairing in the contrast audit. */
export function Ratio({
  fg,
  bg,
  label,
  bgLabel,
  req = "body",
}: {
  fg: string;
  bg: string;
  label: string;
  bgLabel: string;
  req?: Requirement;
}) {
  const v = assess(fg, bg, req);
  return (
    <tr className="border-line border-b last:border-0">
      <td className="py-3 pe-4 align-middle">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="border-line text-body-sm grid size-9 shrink-0 place-items-center rounded-full border font-semibold"
            style={{ background: bg, color: fg }}
          >
            ن
          </span>
          <span className="text-body-sm text-fg font-medium">{label}</span>
        </div>
      </td>
      <td className="text-body-sm text-fg-muted py-3 pe-4 align-middle">{bgLabel}</td>
      <td className="text-body-sm text-fg py-3 pe-4 text-end align-middle tabular-nums">
        {fmt(v.ratio)}:1
      </td>
      <td className="py-3 align-middle text-end">
        <span
          className={cn(
            "text-caption inline-flex h-6 items-center rounded-full px-2.5 font-semibold",
            v.passes ? "bg-veil-10 text-fg" : "bg-destructive/15 text-destructive",
          )}
        >
          {v.passes ? v.grade : "FAIL"}
        </span>
      </td>
    </tr>
  );
}

export function RatioTable({
  head,
  children,
}: {
  head: string;
  children: React.ReactNode;
}) {
  /* ⛔ `tabIndex`/`role`/`aria-label` on the SCROLLER, not on the table. SAGE-2.
     The table is `min-w-[34rem]` inside an `overflow-x-auto` box, so under
     ~544px it scrolls horizontally — and it contains no focusable element, so
     a keyboard-only visitor had no way to reach the scrollbar and could not
     read the last two columns at all. MEASURED: 6 scrollers, 0 focusable
     descendants each, axe `scrollable-region-focusable` (serious) ×6 at 430.
     `role="region"` + the caption text as its name is the W3C technique; the
     name is what stops it being an anonymous focus stop.

     `min-w-0` for the same reason as `<Block>` above: a scroll container that
     is also a flex/grid item still has `min-width: auto` and will refuse to
     shrink below its content, quietly handing the overflow to its parent
     instead of scrolling. The 34rem table made this box 384px wide at a 320px
     viewport before it was added. */
  return (
    <div
      className="min-w-0 overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label={head}
    >
      <table className="w-full min-w-[34rem] border-collapse">
        <caption className="text-label text-fg-subtle mb-3 text-start font-semibold">
          {head}
        </caption>
        <thead>
          <tr className="border-line border-b">
            <th className="text-caption text-fg-subtle py-2 pe-4 text-start font-semibold">
              اللون الأمامي
            </th>
            <th className="text-caption text-fg-subtle py-2 pe-4 text-start font-semibold">
              الأرضية
            </th>
            <th className="text-caption text-fg-subtle py-2 pe-4 text-end font-semibold">
              النسبة
            </th>
            <th className="text-caption text-fg-subtle py-2 text-end font-semibold">
              WCAG
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** A spec line beside a live sample. */
export function Spec({ children }: { children: React.ReactNode }) {
  return (
    <div className="latin text-caption text-fg-subtle tabular-nums">{children}</div>
  );
}
