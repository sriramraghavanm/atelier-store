/**
 * Every read of the catalogue, and the only place the storefront touches the
 * database.
 *
 * All of these are `use cache` scopes with an explicit `cacheLife`. That is not
 * optional: `cacheComponents` is on, and `/products/[slug]` sets
 * `ensureStatic = "navigation"`, which fails the build on an uncached database
 * call even inside `<Suspense>`, and on any cache life whose `expire` is under
 * five minutes. `hours` (stale 5m, revalidate 1h, expire 1d) clears those
 * thresholds and suits data that changes a few times a day.
 *
 * The directive is inline per function rather than at file level so it stays
 * next to the query it applies to.
 *
 * Tags are groundwork: nothing writes to the catalogue yet, but an admin path
 * would call `updateTag("catalog")` after a mutation. Note that `db:seed` runs
 * outside Next and cannot invalidate anything — restart the dev server after
 * seeding or you may be served the previous rows for up to an hour.
 */

import { and, asc, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { category, product, productImage } from "@/db/schema";
import {
  categoryHref,
  productHref,
  stockStateFor,
  type Collection,
  type Product,
} from "@/lib/catalog";

/**
 * Relational shape every product query asks for. A function rather than a
 * constant so each call gets a fresh, mutable config object — drizzle infers
 * the result type from this literal, and a `readonly` `orderBy` doesn't fit.
 */
const withCategoryAndImages = () => ({
  category: true as const,
  images: { orderBy: [asc(productImage.position)] },
});

type ProductRow = typeof product.$inferSelect & {
  category: typeof category.$inferSelect | null;
  images: (typeof productImage.$inferSelect)[];
};

/**
 * Turns a row into the shape the components render. `href` and the category
 * link are derived rather than stored — the old sample data carried them as
 * literal strings, which is what a second source of truth looks like.
 */
function toProduct(row: ProductRow): Product {
  const stock = stockStateFor(row.stockQuantity, row.lowStockThreshold);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    detail: row.detail,
    priceCents: row.priceCents,
    image: row.imageUrl,
    alt: row.imageAlt,
    href: productHref(row.slug),
    category: row.category
      ? { name: row.category.name, href: categoryHref(row.category.slug) }
      : null,
    stock,
    ...(stock === "low_stock" ? { stockCount: row.stockQuantity } : {}),
    sku: row.sku,
    description: row.description,
    composition: row.composition,
    care: row.care,
    gallery: row.images.map((image) => ({ src: image.url, alt: image.alt })),
  };
}

/** The homepage grid. */
export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "products");

  const rows = await db.query.product.findMany({
    with: withCategoryAndImages(),
    orderBy: [asc(product.position), asc(product.name)],
  });

  return rows.map(toProduct);
}

/**
 * The homepage collection cards. A card cannot render without imagery, so a
 * featured category missing an image URL is left out rather than handed to
 * `next/image` as an empty string.
 */
export async function getFeaturedCollections(): Promise<Collection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "categories");

  const rows = await db
    .select()
    .from(category)
    .where(and(eq(category.featured, true), isNotNull(category.imageUrl)))
    .orderBy(asc(category.position), asc(category.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    caption: row.caption,
    // Non-null by the `where` above; the assertion keeps the view type
    // honest about what a card needs.
    image: row.imageUrl!,
    alt: row.imageAlt ?? row.name,
    href: categoryHref(row.slug),
  }));
}

/** Backs `generateStaticParams` on `/products/[slug]`. */
export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "products");

  const rows = await db
    .select({ slug: product.slug })
    .from(product)
    .orderBy(asc(product.position), asc(product.name));

  return rows.map((row) => row.slug);
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);

  const row = await db.query.product.findFirst({
    where: eq(product.slug, slug),
    with: withCategoryAndImages(),
  });

  return row ? toProduct(row) : null;
}

/**
 * Same category first, then anything else, to fill the row — the ordering the
 * static data used. Products with no category group with each other, which is
 * the closest thing to "related" available for them.
 */
export async function getRelatedProducts(
  slug: string,
  count = 4,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", "products");

  const current = await db.query.product.findFirst({
    where: eq(product.slug, slug),
    columns: { categoryId: true },
  });

  const sameCategoryFirst = current?.categoryId
    ? desc(sql`${product.categoryId} = ${current.categoryId}`)
    : desc(sql`${product.categoryId} is null`);

  const rows = await db.query.product.findMany({
    where: ne(product.slug, slug),
    with: withCategoryAndImages(),
    orderBy: [sameCategoryFirst, asc(product.position), asc(product.name)],
    limit: count,
  });

  return rows.map(toProduct);
}
