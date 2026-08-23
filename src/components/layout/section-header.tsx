import * as React from "react";

import { cn } from "@/lib/utils";

import { Label } from "./typography";

/* -----------------------------------------------------------------------------
 * <SectionHeader> — kicker, heading, optional lead, optional trailing slot.
 *
 * Internal rhythm is fixed and comes from SOVA 14.3, not from taste:
 *
 *     kicker  -> 20px -> heading -> 24px -> lead  -> 48px -> content
 *
 * The kicker is the 13px / weight-600 label plus a 28px gold hairline
 * (.kicker-rule). That combination replaces the tracked-out uppercase eyebrow
 * every Latin reference site uses, which Arabic cannot have: the script is
 * unicase, and tracking severs the letter joins. The old site shipped +.05em
 * on this exact element — REMOVED here, and that is the single most visible
 * typographic fix in the rebuild.
 *
 * `align="split"` gives the asymmetric 7/4 head that SOVA 14.1 calls for
 * (heading inline-start, lead inline-end, one empty column between). Symmetry
 * is what makes a page look like a template; the splits stay asymmetric.
 * -------------------------------------------------------------------------- */

export interface SectionHeaderProps extends React.ComponentProps<"header"> {
  /** The 13px label above the heading. Omit for a bare heading. */
  kicker?: React.ReactNode;
  /**
   * Draw the 28px gold hairline before the kicker (`.kicker-rule`). Default
   * true — that rule is the section-label mark and most sections want it.
   *
   * SET IT FALSE WHENEVER THE HEADING CONTAINS AN <Accent>. The hairline is
   * `--accent-hair` (gold-500) and the accent phrase is `--accent-gold`; both
   * in one section breaks the one-gold-element budget (AGENTS §8, SOVA §13.4).
   * A bare kicker still reads as a label — it keeps `--kicker`, which is
   * brand-600 green on light and gold-300 on dark, and weight carries the
   * hierarchy the way Arabic requires (no tracked-out caps to fall back on).
   *
   * JETT wave 1 hand-rolled Story's header purely to escape the forced rule;
   * this prop is that escape hatch, and Story now uses it.
   */
  rule?: boolean;
  /** The heading itself. Pass a string, or JSX containing an <Accent>. */
  heading: React.ReactNode;
  /**
   * `id` for the heading element — NOT for the <header>. Needed when the
   * enclosing <Section> names itself with `aria-labelledby`.
   */
  headingId?: string;
  /** Supporting paragraph. Keep it to two lines. */
  lead?: React.ReactNode;
  /** Heading size token. Defaults to h2 — a section is not the page title. */
  size?: "display-2" | "h1" | "h2" | "h3";
  /** Heading element. Defaults to h2. Set this for document outline, not size. */
  as?: "h1" | "h2" | "h3";
  /**
   * stacked — kicker/heading/lead in one column (the default).
   * split    — 7/4 asymmetric: heading start, lead end. Desktop only; stacks
   *            below lg.
   * centred  — use once per page at most. Centred Arabic headings lose the
   *            strong start-edge that the rest of the page is built on.
   */
  align?: "stacked" | "split" | "centred";
  /** Trailing content (a CTA, a count). Sits opposite the heading on `split`. */
  action?: React.ReactNode;
}

const SIZE = {
  "display-2": "text-display-2",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
} as const;

export function SectionHeader({
  kicker,
  rule = true,
  heading,
  headingId,
  lead,
  size = "h2",
  as: Heading = "h2",
  align = "stacked",
  action,
  className,
  ...props
}: SectionHeaderProps) {
  const headingBlock = (
    <div>
      {kicker ? (
        <Label
          rule={rule}
          className={cn("text-kicker mb-5", rule ? "flex" : "block")}
        >
          {kicker}
        </Label>
      ) : null}
      <Heading
        id={headingId}
        className={cn("font-display text-fg text-balance", SIZE[size])}
      >
        {heading}
      </Heading>
    </div>
  );

  const leadBlock = lead ? (
    <p className={cn("text-lead text-fg-muted text-pretty", align === "split" ? "" : "mt-6 max-w-[62ch]")}>
      {lead}
    </p>
  ) : null;

  if (align === "split") {
    return (
      <header
        data-slot="section-header"
        className={cn("grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6", className)}
        {...props}
      >
        <div className="lg:col-span-7">{headingBlock}</div>
        <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
          {leadBlock}
          {action ? <div className="mt-6">{action}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header
      data-slot="section-header"
      className={cn(align === "centred" && "mx-auto max-w-[52rem] text-center", className)}
      {...props}
    >
      {align === "centred" && kicker ? (
        // The hairline must not float in the middle of a centred block —
        // it reads as a stray mark. Centred kickers drop the rule regardless
        // of the `rule` prop.
        <Label className="text-kicker mb-5 block">{kicker}</Label>
      ) : null}
      {align === "centred" ? (
        <Heading
          id={headingId}
          className={cn("font-display text-fg text-balance", SIZE[size])}
        >
          {heading}
        </Heading>
      ) : (
        headingBlock
      )}
      {leadBlock}
      {action ? <div className="mt-8">{action}</div> : null}
    </header>
  );
}
