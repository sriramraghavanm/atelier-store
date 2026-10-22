import Image from "next/image";
import type { Metadata } from "next";

import { CollectionCard } from "@/components/collection-card";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Button,
  ButtonLink,
  Container,
  Display,
  Grid,
  Label,
  Section,
  Stack,
  TextLink,
} from "@/components/ui";
import { campaign, editorial, services } from "@/data/site";
import {
  getFeaturedCollections,
  getFeaturedProducts,
} from "@/lib/catalog-queries";

export const metadata: Metadata = {
  title: "Atelier — Autumn / Winter 2026",
  description:
    "Outerwear, tailoring and knitwear. Complimentary delivery and thirty-day returns.",
};

export default async function HomePage() {
  // Both reads are `use cache` scopes, so the whole page still prerenders into
  // the static shell rather than becoming a request-time render.
  const [collections, featured] = await Promise.all([
    getFeaturedCollections(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------------------------------------------------------- Hero
            Full-bleed and viewport-tall: the imagery carries the scale, and the
            type over it stays small. A scrim keeps the copy legible whatever
            the photograph does. */}
        <section className="relative h-[82svh] min-h-125 lg:h-[94svh]">
          <Image
            src={campaign.image}
            alt={campaign.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent"
          />
          <Container className="absolute inset-x-0 bottom-0 pb-10 lg:pb-16">
            <Stack gap="5" className="max-w-2xl text-canvas">
              <Label>{campaign.season}</Label>
              <Display as="h1" size="lg">
                {campaign.headline}
              </Display>
              <p className="text-base max-w-md">{campaign.standfirst}</p>
              <div>
                <ButtonLink href={campaign.cta.href} variant="invert">
                  {campaign.cta.label}
                </ButtonLink>
              </div>
            </Stack>
          </Container>
        </section>

        {/* --------------------------------------------------- Collections */}
        <Section size="lg">
          <Container>
            <Stack gap="6">
              <div className="flex items-end justify-between gap-4">
                <Label as="h2" size="sm">
                  Collections
                </Label>
                <TextLink href="/collections" className="label">
                  View all
                </TextLink>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </Stack>
          </Container>
        </Section>

        {/* ------------------------------------------------------ Featured
            2-up on phones, 4-up from desktop, via the `grid-products`
            primitive. The first four images are eager so the fold is sharp. */}
        <Section>
          <Container>
            <Stack gap="6">
              <div className="flex items-end justify-between gap-4">
                <Label as="h2" size="sm">
                  New this week
                </Label>
                <TextLink href="/collections/new-in" className="label">
                  View all
                </TextLink>
              </div>
              <Grid variant="products">
                {featured.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 2}
                  />
                ))}
              </Grid>
            </Stack>
          </Container>
        </Section>

        {/* ------------------------------------------------------ Editorial
            Half image, half text. Stacks to a single column on phones, with
            the image first so the section still opens on a picture. */}
        <Section size="lg" className="bg-surface">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16">
              <div className="relative aspect-portrait lg:aspect-product">
                <Image
                  src={editorial.image}
                  alt={editorial.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <Stack gap="5" className="lg:max-w-md">
                <Label>{editorial.eyebrow}</Label>
                <Display as="h2" size="sm">
                  {editorial.title}
                </Display>
                <p className="text-base text-ink-muted">{editorial.body}</p>
                <div>
                  <ButtonLink href={editorial.cta.href} variant="outline">
                    {editorial.cta.label}
                  </ButtonLink>
                </div>
              </Stack>
            </div>
          </Container>
        </Section>

        {/* ------------------------------------------------------- Services
            Hairline-separated, the way a retail assurance row reads in print. */}
        <Section>
          <Container>
            <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-line">
              {services.map((service) => (
                <li
                  key={service.title}
                  className="border-b border-line md:border-b-0 md:border-r md:last:border-r-0 py-8 md:px-6 md:first:pl-0 md:last:pr-0"
                >
                  <Stack gap="2">
                    <Label as="h3" size="sm">
                      {service.title}
                    </Label>
                    <p className="text-sm text-ink-muted">{service.body}</p>
                  </Stack>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        {/* ----------------------------------------------------- Newsletter */}
        <Section size="lg" className="bg-ink text-canvas">
          <Container width="measure">
            <Stack gap="5" align="center">
              <Label>Stay in touch</Label>
              <Display as="h2" size="sm">
                Collection previews, first
              </Display>
              <p className="text-sm">
                Occasional letters on new arrivals and private sale access.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2"
                action="/newsletter"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="field bg-canvas text-ink flex-1"
                />
                {/* `invert` because a solid (black) button would disappear
                    into this section. Full width on phones, auto from sm. */}
                <Button type="submit" variant="invert" className="sm:btn-auto">
                  Sign up
                </Button>
              </form>
            </Stack>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
