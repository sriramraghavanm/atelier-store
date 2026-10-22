/**
 * The shapes the storefront renders, and the pure helpers that go with them.
 *
 * Deliberately free of any database import: `ProductCard` pulls `formatPrice`
 * from here, and a module that reached for `@/db` would drag the database
 * client into every component that touches it. The queries that build these
 * shapes live in `catalog-queries.ts`.
 */

/**
 * Derived from the quantity on the row rather than stored, so state and count
 * can never disagree. `low_stock` is the only state that carries a number.
 */
export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  /** Doubles as the `/products/[slug]` param. */
  slug: string;
  name: string;
  /** Short material detail shown under the name. */
  detail: string;
  priceCents: number;
  /** Primary image — the one used by cards and listings. */
  image: string;
  alt: string;
  href: string;
  /** Null when the product's category has been removed. */
  category: { name: string; href: string } | null;
  stock: StockState;
  /** Units remaining. Only meaningful when `stock` is `low_stock`. */
  stockCount?: number;
  sku: string;
  description: string;
  composition: string[];
  care: string;
  /** Detail page gallery, in position order. */
  gallery: { src: string; alt: string }[];
};

/** A featured category, as the homepage collection cards render it. */
export type Collection = {
  id: string;
  name: string;
  caption: string | null;
  image: string;
  alt: string;
  href: string;
};

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export const stockLabel: Record<StockState, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function stockStateFor(quantity: number, threshold: number): StockState {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= threshold) return "low_stock";
  return "in_stock";
}

export const productHref = (slug: string) => `/products/${slug}`;
export const categoryHref = (slug: string) => `/collections/${slug}`;
