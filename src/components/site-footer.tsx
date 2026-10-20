import { cacheLife } from "next/cache";

import { Container, Divider, Label, Stack, TextLink } from "@/components/ui";
import { footerNav } from "@/data/catalog";

/**
 * Cached because of the copyright year: with `cacheComponents` enabled, reading
 * the clock during render is an unstable value and fails the prerender. A daily
 * cache lets the year be prerendered and still turn over on time.
 */
export async function SiteFooter() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="border-t border-line">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {footerNav.map((group) => (
            <Stack gap="3" key={group.title}>
              <Label as="h2">{group.title}</Label>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <TextLink href={link.href} quiet className="text-sm">
                      {link.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </Stack>
          ))}

          <Stack gap="3" className="col-span-2 md:col-span-1">
            <Label as="h2">Newsletter</Label>
            <p className="text-sm text-ink-muted">
              Collection previews and private sale access.
            </p>
            <TextLink href="/newsletter" className="text-sm">
              Subscribe
            </TextLink>
          </Stack>
        </div>

        <Divider className="my-10" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-2xs text-ink-muted">
            © {new Date().getFullYear()} Atelier. Sample data for development.
          </p>
          <p className="label text-ink-muted">United States / English</p>
        </div>
      </Container>
    </footer>
  );
}
