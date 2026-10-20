import type { ReactNode } from "react";

/**
 * Hairline-separated accordion built on `<details>`, so it needs no client
 * JavaScript. The `+` rotates into a `×` when open.
 */
export function Disclosure({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-line [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="label-sm flex cursor-pointer list-none items-center justify-between py-4">
        {title}
        <span
          aria-hidden
          className="text-base leading-none transition-transform duration-200 ease-brand group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-5 text-sm text-ink-muted">{children}</div>
    </details>
  );
}
