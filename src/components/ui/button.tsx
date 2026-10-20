import NextLink from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "solid" | "outline" | "quiet" | "invert";

const buttonVariant: Record<ButtonVariant, string> = {
  solid: "btn-solid", // primary: add to bag, checkout
  outline: "btn-outline", // secondary: wishlist, size guide
  quiet: "btn-quiet", // tertiary, inside dense UI
  invert: "btn-invert", // over imagery or on a bg-ink section
};

type SharedProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  /** Full-width by default, as on mobile commerce UI. */
  block?: boolean;
  className?: string;
  children?: ReactNode;
};

function buttonClasses({
  variant = "solid",
  size = "md",
  block = true,
  className,
}: SharedProps) {
  return cn(
    "btn",
    buttonVariant[variant],
    size === "sm" && "btn-sm",
    !block && "btn-auto",
    className,
  );
}

export function Button({
  variant,
  size,
  block,
  className,
  children,
  type = "button",
  ...rest
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * A button-shaped link. Use this whenever the action navigates — a call to
 * action in a hero or banner — so it stays a real anchor.
 */
export function ButtonLink({
  variant,
  size,
  block = false,
  className,
  children,
  ...rest
}: SharedProps & ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      className={buttonClasses({ variant, size, block, className })}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
