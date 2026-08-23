import * as React from "react";

import { cn } from "@/lib/utils";

import { Container, type ContainerProps } from "./container";

/* -----------------------------------------------------------------------------
 * <Section> — the ground.
 *
 * This is the backbone of the whole design system. It does two jobs and
 * nothing else:
 *
 *   1. Declares the GROUND.  `theme="dark"` emits `data-theme="dark"`, and
 *      globals.css swaps --bg --fg --fg-muted --fg-subtle --line --accent-gold
 *      plus the entire shadcn semantic layer beneath it. Every descendant —
 *      body copy, hairlines, buttons, inputs, the gold accent phrase — becomes
 *      correct for that ground with no further props and no per-section CSS.
 *
 *          <Section theme="dark">   is the entire API.
 *
 *      The gold accent is the point: it MUST be a different value on each
 *      ground (gold-700 on light is 5.54:1, gold-300 on dark is 9.96:1; swap
 *      them and both fail). Because it flips at the token layer, JETT can
 *      write <Accent> once and never think about it again.
 *
 *   2. Owns the VERTICAL RHYTHM (SOVA 14.3). The old site padded every
 *      section 132px and that flatness is most of why it reads generic.
 *
 *      RULE: a light->dark or dark->light flip gets `space="lg"`.
 *            Two same-theme siblings get the default.
 *            The first section after the hero gets `space="hero"`.
 *
 * `surface` picks the level within the ground, so a run of three light
 * sections still has rhythm (0 -> 1 -> 2) without a hard flip. SOVA 13.5 has
 * the full per-section table.
 * -------------------------------------------------------------------------- */

const SPACE = {
  none: "py-0",
  sm: "py-[var(--section-y-sm)]", //  64 ->  88  tight pairs
  default: "py-[var(--section-y)]", //  88 -> 128  the default
  lg: "py-[var(--section-y-lg)]", // 112 -> 160  around a theme flip
  hero: "py-[var(--section-y-hero)]", // 120 -> 200  first section after the hero
} as const;

export interface SectionProps extends Omit<React.ComponentProps<"section">, "children"> {
  /** The ground. Drives every colour token beneath this element. */
  theme?: "light" | "dark";
  /**
   * Level within the ground.
   *   light: 0 #fbfaf6 (page)  1 #f6f4ee (band)  2 #ece8dc (inset)
   *   dark:  1 #002724 (brand) 2 #00201d (projects) 3 #001613 (footer floor)
   */
  surface?: 0 | 1 | 2 | 3;
  /** Vertical rhythm. See the RULE above — this is not a free choice. */
  space?: keyof typeof SPACE;
  /**
   * Wrap children in a <Container>. Pass `false` for full-bleed sections that
   * manage their own inner containers (hero, projects rail, gallery).
   */
  container?: false | ContainerProps["width"];
  children?: React.ReactNode;
  as?: React.ElementType;
}

export function Section({
  theme = "light",
  surface,
  space = "default",
  container = "default",
  as: Comp = "section",
  className,
  children,
  ...props
}: SectionProps) {
  const resolvedSurface = surface ?? (theme === "dark" ? 1 : 0);

  return (
    <Comp
      data-slot="section"
      data-theme={theme}
      data-surface={resolvedSurface}
      className={cn("relative isolate", SPACE[space], className)}
      {...props}
    >
      {container === false ? children : <Container width={container}>{children}</Container>}
    </Comp>
  );
}

/* -----------------------------------------------------------------------------
 * <Ground> — the same token swap without the section semantics or padding.
 * For a dark card sitting inside a light section, a dark header over a light
 * hero, a modal panel. Use sparingly: nesting grounds is how a page starts to
 * look busy.
 * -------------------------------------------------------------------------- */
export function Ground({
  theme = "light",
  surface,
  className,
  ...props
}: React.ComponentProps<"div"> & { theme?: "light" | "dark"; surface?: 0 | 1 | 2 | 3 }) {
  return (
    <div
      data-slot="ground"
      data-theme={theme}
      data-surface={surface ?? (theme === "dark" ? 1 : 0)}
      className={className}
      {...props}
    />
  );
}
