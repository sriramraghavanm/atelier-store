import NextLink from "next/link";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------- TextLink */

/**
 * Underline is the only link affordance in this system — links are never
 * coloured. `quiet` defers the underline to hover, for navigation where a
 * persistent rule would read as noise.
 */
export function TextLink({
  quiet = false,
  className,
  children,
  ...rest
}: {
  quiet?: boolean;
  children?: ReactNode;
} & ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      className={cn(quiet ? "link-quiet" : "link", className)}
      {...rest}
    >
      {children}
    </NextLink>
  );
}

/* -------------------------------------------------------------------- Label */

/** Uppercase micro-label: eyebrows, nav, field labels, meta. */
export function Label({
  as: Tag = "span",
  size = "xs",
  className,
  children,
}: {
  as?: ElementType;
  /** `xs` = 10px, `sm` = 12px. */
  size?: "xs" | "sm";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={cn(size === "sm" ? "label-sm" : "label", className)}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Display */

const displaySize = {
  sm: "text-display-sm",
  md: "text-display",
  lg: "text-display-lg",
} as const;

/**
 * Editorial display type. Deliberately discontinuous from the UI scale —
 * reserve it for campaign and category headings, never for UI chrome.
 */
export function Display({
  as: Tag = "h2",
  size = "md",
  className,
  children,
}: {
  as?: ElementType;
  size?: keyof typeof displaySize;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={cn(displaySize[size], "text-balance", className)}>
      {children}
    </Tag>
  );
}
