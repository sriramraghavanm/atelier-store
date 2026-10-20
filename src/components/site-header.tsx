import Link from "next/link";

import { Container, TextLink } from "@/components/ui";
import { primaryNav } from "@/data/catalog";

/**
 * Sticky header: fixed heights from the token scale, a single hairline rule at
 * the bottom, and uppercase micro-type throughout.
 *
 * The mobile menu is a native `<details>` disclosure, so the whole header stays
 * a server component — no client bundle for what is only a show/hide.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-line">
      <Container className="h-header lg:h-header-lg grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: disclosure on small screens, full nav from lg */}
        <div className="flex items-center">
          <details className="lg:hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="label cursor-pointer list-none select-none">
              Menu
            </summary>
            <nav
              aria-label="Primary"
              className="absolute left-0 right-0 top-full bg-canvas border-b border-line"
            >
              <Container as="ul" className="py-2">
                {primaryNav.map((item) => (
                  <li
                    key={item.href}
                    className="border-b border-line last:border-0"
                  >
                    <TextLink
                      href={item.href}
                      quiet
                      className="label-sm block py-4"
                    >
                      {item.label}
                    </TextLink>
                  </li>
                ))}
              </Container>
            </nav>
          </details>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <TextLink href={item.href} quiet className="label">
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Centre: wordmark. Letterspacing here is a deliberate exception to the
            0.2px rule — this is a logotype, not interface type. */}
        <Link
          href="/"
          className="text-base lg:text-lg font-medium uppercase tracking-[0.25em] whitespace-nowrap"
        >
          Atelier
        </Link>

        {/* Right: utilities */}
        <div className="flex items-center justify-end gap-4 lg:gap-6">
          <TextLink href="/search" quiet className="label hidden md:inline">
            Search
          </TextLink>
          <TextLink href="/account" quiet className="label hidden md:inline">
            Account
          </TextLink>
          <TextLink href="/bag" quiet className="label whitespace-nowrap">
            Bag (0)
          </TextLink>
        </div>
      </Container>
    </header>
  );
}
