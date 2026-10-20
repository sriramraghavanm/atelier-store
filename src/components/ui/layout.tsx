import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- Container */

type ContainerWidth = "bleed" | "measure" | "prose";

const containerWidth: Record<ContainerWidth, string> = {
  bleed: "", // full-bleed: the default for imagery-led layouts
  measure: "measure",
  prose: "measure-prose",
};

export function Container({
  as: Tag = "div",
  width = "bleed",
  gutter = true,
  className,
  children,
}: {
  as?: ElementType;
  width?: ContainerWidth;
  /** Side padding. Turn off for edge-to-edge media. */
  gutter?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={cn(gutter && "gutter", containerWidth[width], className)}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Section */

export function Section({
  as: Tag = "section",
  size = "md",
  className,
  children,
}: {
  as?: ElementType;
  size?: "md" | "lg" | "none";
  className?: string;
  children?: ReactNode;
}) {
  const rhythm =
    size === "lg" ? "section-y-lg" : size === "md" ? "section-y" : "";
  return <Tag className={cn(rhythm, className)}>{children}</Tag>;
}

/* --------------------------------------------------------------------- Grid */

type GridVariant = "products" | "base";

const gridVariant: Record<GridVariant, string> = {
  products: "grid-products",
  base: "grid-base",
};

export function Grid({
  variant = "products",
  className,
  children,
}: {
  variant?: GridVariant;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cn(gridVariant[variant], className)}>{children}</div>;
}

/* -------------------------------------------------------------------- Stack */

const stackGap = {
  "1": "gap-1", // 4px
  "2": "gap-2", // 8px
  "3": "gap-3", // 12px
  "4": "gap-4", // 16px
  "5": "gap-5", // 20px
  "6": "gap-6", // 24px
} as const;

export function Stack({
  gap = "4",
  align,
  className,
  children,
}: {
  gap?: keyof typeof stackGap;
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        stackGap[gap],
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Divider */

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("rule", className)} />;
}

/* -------------------------------------------------------------------- Frame */

const frameRatio = {
  product: "aspect-product", // 4:5 — primary product imagery
  square: "aspect-square", // 1:1 — secondary, thumbnails
  editorial: "aspect-editorial", // 2:1 — wide editorial bands
  portrait: "aspect-portrait", // 2:3 — tall campaign imagery
} as const;

/**
 * Fixed-ratio media frame. Children are cover-fitted by the `frame` utility,
 * so a grid of tiles stays optically identical and nothing shifts on load.
 */
export function Frame({
  ratio = "product",
  className,
  children,
}: {
  ratio?: keyof typeof frameRatio;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("frame", frameRatio[ratio], className)}>{children}</div>
  );
}
