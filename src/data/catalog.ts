/**
 * Sample storefront data for the homepage and product detail pages.
 *
 * Placeholder content only — there is no products table yet. When the real
 * catalogue lands in `src/db/schema`, these shapes are what the queries should
 * return, so the components can stay unchanged.
 *
 * Imagery is hotlinked from the Unsplash CDN with sizing parameters. Prices are
 * in minor units (cents) to avoid float rounding.
 */

/**
 * `low_stock` carries a count so the page can say how few are left; the other
 * states never do.
 */
export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  name: string;
  /** Short material detail shown under the name. */
  detail: string;
  priceCents: number;
  /** Primary image — the one used by cards and listings. */
  image: string;
  alt: string;
  href: string;
  category: { name: string; href: string };
  stock: StockState;
  /** Units remaining. Only meaningful when `stock` is `low_stock`. */
  stockCount?: number;
  sku: string;
  description: string;
  composition: string[];
  care: string;
  /** Detail page gallery. The first entry is the primary image. */
  gallery: { src: string; alt: string }[];
};

export type Collection = {
  id: string;
  name: string;
  caption: string;
  image: string;
  alt: string;
  href: string;
};

const unsplash = (id: string, w: number, h: number, crop?: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}&h=${h}` +
  (crop ? `&crop=${crop}` : "");

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

/* ---------------------------------------------------------------- Campaign */

export const campaign = {
  season: "Autumn / Winter 2026",
  headline: "A quieter silhouette",
  standfirst:
    "Outerwear cut close to the body, in wool, leather and heavy knit. Photographed in Milan.",
  cta: { label: "Shop the collection", href: "/collections/autumn-winter" },
  image: unsplash("photo-1539109136881-3be0616acf4b", 2000, 1250),
  alt: "Model in a pale blue coat and scarf standing in a city piazza",
};

/* ------------------------------------------------------------- Collections */

export const collections: Collection[] = [
  {
    id: "outerwear",
    name: "Outerwear",
    caption: "Wool, shearling and leather",
    image: unsplash("photo-1485968579580-b6d095142e6e", 900, 1350),
    alt: "Woman in a long dark checked coat on a city street",
    href: "/collections/outerwear",
  },
  {
    id: "tailoring",
    name: "Tailoring",
    caption: "Suiting, made to order",
    image: unsplash("photo-1610652492500-ded49ceeb378", 900, 1350),
    alt: "Man adjusting the lapel of a dark tailored suit jacket",
    href: "/collections/tailoring",
  },
  {
    id: "evening",
    name: "Evening",
    caption: "Occasion dressing",
    image: unsplash("photo-1515372039744-b8f02a3ae446", 900, 1350),
    alt: "Woman in a white off-the-shoulder dress on a staircase",
    href: "/collections/evening",
  },
];

/* ---------------------------------------------------------------- Products */

const CATEGORIES = {
  outerwear: { name: "Outerwear", href: "/collections/outerwear" },
  knitwear: { name: "Knitwear", href: "/collections/knitwear" },
  bags: { name: "Bags", href: "/collections/bags" },
  rtw: { name: "Ready-to-Wear", href: "/collections/ready-to-wear" },
  accessories: { name: "Accessories", href: "/collections/accessories" },
} as const;

/**
 * Gallery frames are different regions of the same source photograph — the full
 * frame, then crops anchored to the top and bottom. Placeholder stand-ins for
 * the several angles a real shoot would supply, but distinct enough not to read
 * as a repeated image.
 */
const shot = (id: string, alt: string) => [
  { src: unsplash(id, 1200, 1500), alt },
  { src: unsplash(id, 1200, 1200, "top"), alt: `${alt} — upper detail` },
  { src: unsplash(id, 1200, 1200, "bottom"), alt: `${alt} — lower detail` },
];

export const products: Product[] = [
  {
    id: "fringed-knit-cape",
    name: "Fringed Knit Cape",
    detail: "Undyed merino",
    priceCents: 148000,
    image: unsplash("photo-1434389677669-e08b4cac3105", 800, 1000),
    alt: "Cream fringed knit cape on a wooden hanger",
    href: "/products/fringed-knit-cape",
    category: CATEGORIES.knitwear,
    stock: "in_stock",
    sku: "AT-KN-0114",
    description:
      "A loose cape in undyed merino, knitted in a single piece so the shoulder carries no seam. The fringe is hand-knotted and will settle with wear.",
    composition: ["100% merino wool", "Hand-knotted fringe", "Made in Italy"],
    care: "Dry clean only. Store folded.",
    gallery: shot(
      "photo-1434389677669-e08b4cac3105",
      "Cream fringed knit cape on a wooden hanger",
    ),
  },
  {
    id: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    detail: "Polished calfskin",
    priceCents: 325000,
    image: unsplash("photo-1551028719-00167b16eac5", 800, 1000),
    alt: "Black leather biker jacket laid flat on white fabric",
    href: "/products/leather-biker-jacket",
    category: CATEGORIES.outerwear,
    stock: "low_stock",
    stockCount: 2,
    sku: "AT-OW-0231",
    description:
      "Cut close through the body in polished calfskin, with an asymmetric zip and a collar that sits flat when open. The lining is cupro, so it moves over knitwear.",
    composition: ["100% calfskin leather", "Cupro lining", "Made in Italy"],
    care: "Specialist leather clean. Keep away from direct heat.",
    gallery: shot(
      "photo-1551028719-00167b16eac5",
      "Black leather biker jacket laid flat on white fabric",
    ),
  },
  {
    id: "top-handle-bag",
    name: "Structured Top-Handle Bag",
    detail: "Saffiano leather",
    priceCents: 268000,
    image: unsplash("photo-1584917865442-de89df76afd3", 800, 1000),
    alt: "Red structured leather handbag with a top handle and clasp",
    href: "/products/top-handle-bag",
    category: CATEGORIES.bags,
    stock: "in_stock",
    sku: "AT-BG-0067",
    description:
      "A structured day bag in cross-hatched saffiano, finished with a turn-lock clasp and a detachable strap. Holds a 13-inch laptop flat.",
    composition: [
      "Saffiano calfskin",
      "Palladium-finish hardware",
      "Detachable shoulder strap",
    ],
    care: "Wipe with a soft dry cloth. Store in the dust bag provided.",
    gallery: shot(
      "photo-1584917865442-de89df76afd3",
      "Red structured leather handbag with a top handle and clasp",
    ),
  },
  {
    id: "satin-bomber",
    name: "Satin Bomber Jacket",
    detail: "Technical satin",
    priceCents: 96000,
    image: unsplash("photo-1591047139829-d91aecb6caea", 800, 1000),
    alt: "Blush pink bomber jacket held up on a hanger",
    href: "/products/satin-bomber",
    category: CATEGORIES.outerwear,
    stock: "out_of_stock",
    sku: "AT-OW-0188",
    description:
      "A short bomber in technical satin with a matte face and a faint sheen in movement. Ribbed cuffs and hem, two concealed side pockets.",
    composition: ["Technical satin", "Ribbed trims", "Made in Portugal"],
    care: "Machine wash cold, line dry. Do not tumble dry.",
    gallery: shot(
      "photo-1591047139829-d91aecb6caea",
      "Blush pink bomber jacket held up on a hanger",
    ),
  },
  {
    id: "tapered-trousers",
    name: "Tapered Trousers",
    detail: "Washed twill",
    priceCents: 62000,
    image: unsplash("photo-1594633312681-425c7b97ccd1", 800, 1000),
    alt: "Blush tapered trousers with elasticated cuffs",
    href: "/products/tapered-trousers",
    category: CATEGORIES.rtw,
    stock: "in_stock",
    sku: "AT-RW-0342",
    description:
      "A high-waisted trouser in washed cotton twill, tapered to a gathered cuff. Side pockets are set into the seam so the line stays clean.",
    composition: [
      "98% cotton, 2% elastane",
      "Garment washed",
      "Made in Portugal",
    ],
    care: "Machine wash cold with like colours. Warm iron.",
    gallery: shot(
      "photo-1594633312681-425c7b97ccd1",
      "Blush tapered trousers with elasticated cuffs",
    ),
  },
  {
    id: "chambray-shirt",
    name: "Chambray Shirt",
    detail: "Garment-dyed cotton",
    priceCents: 38000,
    image: unsplash("photo-1596755094514-f87e34085b2c", 800, 1000),
    alt: "Blue chambray shirt on a hanger against a grey wall",
    href: "/products/chambray-shirt",
    category: CATEGORIES.rtw,
    stock: "in_stock",
    sku: "AT-RW-0119",
    description:
      "A relaxed shirt in garment-dyed chambray that softens with each wash. Mother-of-pearl buttons and a single patch pocket.",
    composition: ["100% cotton chambray", "Mother-of-pearl buttons"],
    care: "Machine wash cold. Cool iron while slightly damp.",
    gallery: shot(
      "photo-1596755094514-f87e34085b2c",
      "Blue chambray shirt on a hanger against a grey wall",
    ),
  },
  {
    id: "cotton-sweatshirt",
    name: "Cotton Sweatshirt",
    detail: "Brushed loopback",
    priceCents: 44000,
    image: unsplash("photo-1620799140408-edc6dcb6d633", 800, 1000),
    alt: "Folded white cotton sweatshirt on a pale surface",
    href: "/products/cotton-sweatshirt",
    category: CATEGORIES.rtw,
    stock: "low_stock",
    stockCount: 3,
    sku: "AT-RW-0205",
    description:
      "Heavyweight loopback cotton, brushed on the inside, cut straight with a dropped shoulder. Pre-shrunk, so it keeps its length.",
    composition: ["100% organic cotton, 420gsm", "Brushed loopback interior"],
    care: "Machine wash cold, inside out. Line dry.",
    gallery: shot(
      "photo-1620799140408-edc6dcb6d633",
      "Folded white cotton sweatshirt on a pale surface",
    ),
  },
  {
    id: "field-watch",
    name: "Field Watch",
    detail: "Leather strap, 38mm",
    priceCents: 89000,
    image: unsplash("photo-1524592094714-0f0654e20314", 800, 1000),
    alt: "Hand holding a minimal wristwatch with a white dial",
    href: "/products/field-watch",
    category: CATEGORIES.accessories,
    stock: "in_stock",
    sku: "AT-AC-0023",
    description:
      "A 38mm field watch with a brushed steel case, matte dial and sapphire crystal. Swiss quartz movement on an interchangeable leather strap.",
    composition: [
      "Brushed stainless steel, 38mm",
      "Sapphire crystal",
      "Swiss quartz movement",
      "5 ATM water resistant",
    ],
    care: "Keep the strap dry. Service every three years.",
    gallery: shot(
      "photo-1524592094714-0f0654e20314",
      "Hand holding a minimal wristwatch with a white dial",
    ),
  },
];

/** The homepage grid shows the whole sample catalogue. */
export const featured: Product[] = products;

export const stockLabel: Record<StockState, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.id === slug);
}

/** Same category first, then anything else, to fill the row. */
export function getRelatedProducts(slug: string, count = 4): Product[] {
  const current = getProduct(slug);
  const others = products.filter((product) => product.id !== slug);
  if (!current) return others.slice(0, count);
  const sameCategory = others.filter(
    (product) => product.category.name === current.category.name,
  );
  const rest = others.filter(
    (product) => product.category.name !== current.category.name,
  );
  return [...sameCategory, ...rest].slice(0, count);
}

/* --------------------------------------------------------------- Editorial */

export const editorial = {
  eyebrow: "The Atelier Journal",
  title: "On the cutting floor",
  body: "Three of our pattern cutters on proportion, the weight of a hem, and why a coat should feel heavier than it looks.",
  cta: { label: "Read the story", href: "/journal/on-the-cutting-floor" },
  image: unsplash("photo-1533659828870-95ee305cee3e", 1200, 1500),
  alt: "Woman in a long pleated skirt turning on a city street",
};

/* ---------------------------------------------------------------- Services */

export const services = [
  {
    title: "Complimentary delivery",
    body: "On every order, with signature required on arrival.",
  },
  {
    title: "Thirty-day returns",
    body: "Collected from your address at no cost.",
  },
  {
    title: "Boutique appointments",
    body: "One-to-one styling in any of our fourteen stores.",
  },
];

/* --------------------------------------------------------------- Navigation */

export const primaryNav = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Journal", href: "/journal" },
];

export const footerNav = [
  {
    title: "Client Services",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Order Tracking", href: "/orders" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Stores", href: "/stores" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Sale", href: "/terms" },
      { label: "Cookie Settings", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];
