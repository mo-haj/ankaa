import * as React from "react";

import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * <Container> — the page's horizontal frame (SOVA 14.1).
 *
 *   width: min(100% - 2 * gutter, max)
 *
 * The gutter is a token, not a magic number, and it steps with the viewport:
 * 24px mobile -> 32px at md -> 48px at xl. Every width below shares that
 * gutter, so a `wide` figure and a `default` paragraph stay optically aligned
 * at their edges instead of drifting apart at large sizes.
 *
 * Widths:
 *   default  80rem     1280  the page container. Almost everything.
 *   wide     93.75rem  1500  gallery / media bleed only.
 *   prose    44rem      704  single-column reading (the president's message,
 *                            long FAQ answers). Arabic at 17px/1.9 gets
 *                            uncomfortable past ~75 characters per line.
 *   bleed    100%             edge-to-edge; still gives children the gutter var.
 * -------------------------------------------------------------------------- */

const WIDTHS = {
  default: "shell",
  wide: "shell-wide",
  prose: "shell-prose",
  bleed: "shell-bleed",
} as const;

export interface ContainerProps extends React.ComponentProps<"div"> {
  width?: keyof typeof WIDTHS;
  /** Render as a different element (`main`, `header`, `footer`, `nav`, ...). */
  as?: React.ElementType;
}

export function Container({
  width = "default",
  as: Comp = "div",
  className,
  ...props
}: ContainerProps) {
  return (
    <Comp
      data-slot="container"
      data-width={width}
      className={cn(WIDTHS[width], className)}
      {...props}
    />
  );
}
