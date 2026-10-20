import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Disclosure } from "@/components/disclosure";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StockIndicator } from "@/components/stock-indicator";
import {
  Button,
  Container,
  Divider,
  Grid,
  Label,
  Section,
  Stack,
  TextLink,
} from "@/components/ui";
import {
  formatPrice,
  getProduct,
  getRelatedProducts,
  products,
} from "@/data/catalog";

/**
 * Partial Prefetching would otherwise flush a prerendered shell for an unlisted
 * slug before the render reaches `notFound()`, so the first request for a
 * missing product answered 200 and only later requests 404'd. Requiring the
 * complete route to be static makes that first request wait, so a bad slug is a
 * 404 every time.
 */
export const ensureStatic = "navigation";

/**
 * Every sample product is prerendered. `dynamicParams` is not supported under
 * `cacheComponents`, so an unknown slug is rendered on request and 404s via
 * `notFound()` below.
 */
export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found — Atelier" };

  return {
    title: `${product.name} — Atelier`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const soldOut = product.stock === "out_of_stock";

  return (
    <>
      <SiteHeader />

      <main>
        <Container as="nav" aria-label="Breadcrumb" className="py-4">
          <ol className="label flex flex-wrap items-center gap-2 text-ink-muted">
            <li>
              <TextLink href="/" quiet>
                Home
              </TextLink>
            </li>
            <li aria-hidden>/</li>
            <li>
              <TextLink href={product.category.href} quiet>
                {product.category.name}
              </TextLink>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </Container>

        {/* Imagery runs edge to edge; the detail column sits beside it and
            sticks under the header while the gallery scrolls past. */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start">
          <ProductGallery images={product.gallery} name={product.name} />

          <div className="lg:sticky lg:top-header-lg lg:self-start">
            <Container className="py-8 lg:px-12 lg:py-16 xl:px-20">
              <Stack gap="5" className="lg:max-w-md">
                <Stack gap="3">
                  <TextLink
                    href={product.category.href}
                    quiet
                    className="label text-ink-muted"
                  >
                    {product.category.name}
                  </TextLink>
                  <h1 className="text-xl font-medium">{product.name}</h1>
                  <p className="text-base">{formatPrice(product.priceCents)}</p>
                  <StockIndicator
                    stock={product.stock}
                    stockCount={product.stockCount}
                  />
                </Stack>

                <p className="text-sm text-ink-muted">{product.description}</p>

                <Stack gap="3" className="pt-2">
                  {soldOut ? (
                    <>
                      <Button variant="solid" disabled>
                        Sold out
                      </Button>
                      <Button variant="outline">
                        Notify me when available
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="solid">Add to bag</Button>
                      <Button variant="outline">Add to wishlist</Button>
                    </>
                  )}
                </Stack>

                <div className="pt-2">
                  <Disclosure title="Composition & care" defaultOpen>
                    <ul className="flex flex-col gap-1">
                      {product.composition.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="pt-3">{product.care}</p>
                  </Disclosure>
                  <Disclosure title="Delivery & returns">
                    <p>
                      Complimentary delivery with signature required. Returns
                      collected from your address within thirty days.
                    </p>
                  </Disclosure>
                  <Disclosure title="Product code">
                    <p>{product.sku}</p>
                  </Disclosure>
                </div>
              </Stack>
            </Container>
          </div>
        </div>

        <Section size="lg">
          <Container>
            <Stack gap="6">
              <div className="flex items-end justify-between gap-4">
                <Label as="h2" size="sm">
                  You may also like
                </Label>
                <TextLink href={product.category.href} className="label">
                  More {product.category.name}
                </TextLink>
              </div>
              <Divider />
              <Grid variant="products">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </Grid>
            </Stack>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
