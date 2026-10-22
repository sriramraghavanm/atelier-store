/**
 * Seeds the catalogue with the sample data the storefront used to import from
 * `src/data/catalog.ts`. Re-runnable: categories and products are upserted on
 * their slug, and each product's gallery is replaced wholesale.
 *
 * Not atomic. The Neon HTTP driver has no transactions, so these writes run
 * sequentially and a failure part-way leaves a partial catalogue — re-running
 * fixes it.
 *
 * Run with `npm run db:seed`. Needs a real pooled `DATABASE_URL`.
 */

import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { unsplash } from "@/data/site";

import { category, product, productImage } from "./schema";

// drizzle-kit's config does the same: this runs outside Next, which would
// otherwise load these for us. It has to happen before `@/db` is imported,
// since that module reads `DATABASE_URL` as it initialises — hence the dynamic
// import in `main` below.
config({ path: ".env" });
config({ path: ".env.local", override: true });

/**
 * Gallery frames are different regions of the same source photograph — the full
 * frame, then crops anchored to the top and bottom. Placeholder stand-ins for
 * the several angles a real shoot would supply, but distinct enough not to read
 * as a repeated image, and distinct enough to satisfy the unique constraint on
 * `(product_id, position)`.
 */
const shot = (id: string, alt: string) => [
  { url: unsplash(id, 1200, 1500), alt },
  { url: unsplash(id, 1200, 1200, "top"), alt: `${alt} — upper detail` },
  { url: unsplash(id, 1200, 1200, "bottom"), alt: `${alt} — lower detail` },
];

/**
 * The three featured rows are the collection cards the homepage shows, in the
 * order it showed them. The rest are product categories only — `outerwear` is
 * both, which is why these were one inconsistent pair of lists before.
 */
const categories = [
  {
    slug: "outerwear",
    name: "Outerwear",
    caption: "Wool, shearling and leather",
    imageUrl: unsplash("photo-1485968579580-b6d095142e6e", 900, 1350),
    imageAlt: "Woman in a long dark checked coat on a city street",
    featured: true,
    position: 1,
  },
  {
    slug: "tailoring",
    name: "Tailoring",
    caption: "Suiting, made to order",
    imageUrl: unsplash("photo-1610652492500-ded49ceeb378", 900, 1350),
    imageAlt: "Man adjusting the lapel of a dark tailored suit jacket",
    featured: true,
    position: 2,
  },
  {
    slug: "evening",
    name: "Evening",
    caption: "Occasion dressing",
    imageUrl: unsplash("photo-1515372039744-b8f02a3ae446", 900, 1350),
    imageAlt: "Woman in a white off-the-shoulder dress on a staircase",
    featured: true,
    position: 3,
  },
  {
    slug: "knitwear",
    name: "Knitwear",
    caption: null,
    imageUrl: null,
    imageAlt: null,
    featured: false,
    position: 4,
  },
  {
    slug: "bags",
    name: "Bags",
    caption: null,
    imageUrl: null,
    imageAlt: null,
    featured: false,
    position: 5,
  },
  {
    slug: "ready-to-wear",
    name: "Ready-to-Wear",
    caption: null,
    imageUrl: null,
    imageAlt: null,
    featured: false,
    position: 6,
  },
  {
    slug: "accessories",
    name: "Accessories",
    caption: null,
    imageUrl: null,
    imageAlt: null,
    featured: false,
    position: 7,
  },
];

/**
 * `stockQuantity` is chosen to reproduce the labels the sample data hard-coded:
 * `0` reads as sold out, anything at or under the threshold of 5 as low stock
 * with that count, everything else as in stock.
 */
const products = [
  {
    slug: "fringed-knit-cape",
    name: "Fringed Knit Cape",
    detail: "Undyed merino",
    priceCents: 148000,
    photo: "photo-1434389677669-e08b4cac3105",
    imageAlt: "Cream fringed knit cape on a wooden hanger",
    categorySlug: "knitwear",
    stockQuantity: 12,
    sku: "AT-KN-0114",
    description:
      "A loose cape in undyed merino, knitted in a single piece so the shoulder carries no seam. The fringe is hand-knotted and will settle with wear.",
    composition: ["100% merino wool", "Hand-knotted fringe", "Made in Italy"],
    care: "Dry clean only. Store folded.",
  },
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    detail: "Polished calfskin",
    priceCents: 325000,
    photo: "photo-1551028719-00167b16eac5",
    imageAlt: "Black leather biker jacket laid flat on white fabric",
    categorySlug: "outerwear",
    stockQuantity: 2,
    sku: "AT-OW-0231",
    description:
      "Cut close through the body in polished calfskin, with an asymmetric zip and a collar that sits flat when open. The lining is cupro, so it moves over knitwear.",
    composition: ["100% calfskin leather", "Cupro lining", "Made in Italy"],
    care: "Specialist leather clean. Keep away from direct heat.",
  },
  {
    slug: "top-handle-bag",
    name: "Structured Top-Handle Bag",
    detail: "Saffiano leather",
    priceCents: 268000,
    photo: "photo-1584917865442-de89df76afd3",
    imageAlt: "Red structured leather handbag with a top handle and clasp",
    categorySlug: "bags",
    stockQuantity: 12,
    sku: "AT-BG-0067",
    description:
      "A structured day bag in cross-hatched saffiano, finished with a turn-lock clasp and a detachable strap. Holds a 13-inch laptop flat.",
    composition: [
      "Saffiano calfskin",
      "Palladium-finish hardware",
      "Detachable shoulder strap",
    ],
    care: "Wipe with a soft dry cloth. Store in the dust bag provided.",
  },
  {
    slug: "satin-bomber",
    name: "Satin Bomber Jacket",
    detail: "Technical satin",
    priceCents: 96000,
    photo: "photo-1591047139829-d91aecb6caea",
    imageAlt: "Blush pink bomber jacket held up on a hanger",
    categorySlug: "outerwear",
    stockQuantity: 0,
    sku: "AT-OW-0188",
    description:
      "A short bomber in technical satin with a matte face and a faint sheen in movement. Ribbed cuffs and hem, two concealed side pockets.",
    composition: ["Technical satin", "Ribbed trims", "Made in Portugal"],
    care: "Machine wash cold, line dry. Do not tumble dry.",
  },
  {
    slug: "tapered-trousers",
    name: "Tapered Trousers",
    detail: "Washed twill",
    priceCents: 62000,
    photo: "photo-1594633312681-425c7b97ccd1",
    imageAlt: "Blush tapered trousers with elasticated cuffs",
    categorySlug: "ready-to-wear",
    stockQuantity: 12,
    sku: "AT-RW-0342",
    description:
      "A high-waisted trouser in washed cotton twill, tapered to a gathered cuff. Side pockets are set into the seam so the line stays clean.",
    composition: [
      "98% cotton, 2% elastane",
      "Garment washed",
      "Made in Portugal",
    ],
    care: "Machine wash cold with like colours. Warm iron.",
  },
  {
    slug: "chambray-shirt",
    name: "Chambray Shirt",
    detail: "Garment-dyed cotton",
    priceCents: 38000,
    photo: "photo-1596755094514-f87e34085b2c",
    imageAlt: "Blue chambray shirt on a hanger against a grey wall",
    categorySlug: "ready-to-wear",
    stockQuantity: 12,
    sku: "AT-RW-0119",
    description:
      "A relaxed shirt in garment-dyed chambray that softens with each wash. Mother-of-pearl buttons and a single patch pocket.",
    composition: ["100% cotton chambray", "Mother-of-pearl buttons"],
    care: "Machine wash cold. Cool iron while slightly damp.",
  },
  {
    slug: "cotton-sweatshirt",
    name: "Cotton Sweatshirt",
    detail: "Brushed loopback",
    priceCents: 44000,
    photo: "photo-1620799140408-edc6dcb6d633",
    imageAlt: "Folded white cotton sweatshirt on a pale surface",
    categorySlug: "ready-to-wear",
    stockQuantity: 3,
    sku: "AT-RW-0205",
    description:
      "Heavyweight loopback cotton, brushed on the inside, cut straight with a dropped shoulder. Pre-shrunk, so it keeps its length.",
    composition: ["100% organic cotton, 420gsm", "Brushed loopback interior"],
    care: "Machine wash cold, inside out. Line dry.",
  },
  {
    slug: "field-watch",
    name: "Field Watch",
    detail: "Leather strap, 38mm",
    priceCents: 89000,
    photo: "photo-1524592094714-0f0654e20314",
    imageAlt: "Hand holding a minimal wristwatch with a white dial",
    categorySlug: "accessories",
    stockQuantity: 12,
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
  },
];

async function main() {
  // Imported here, not at the top, so dotenv has already run: `@/db` reads
  // DATABASE_URL while it initialises.
  const { db } = await import("@/db");

  const categoryIds = new Map<string, string>();

  for (const row of categories) {
    const [saved] = await db
      .insert(category)
      .values(row)
      .onConflictDoUpdate({
        target: category.slug,
        set: {
          name: row.name,
          caption: row.caption,
          imageUrl: row.imageUrl,
          imageAlt: row.imageAlt,
          featured: row.featured,
          position: row.position,
        },
      })
      .returning({ id: category.id });

    categoryIds.set(row.slug, saved.id);
  }

  console.log(`Seeded ${categoryIds.size} categories.`);

  let imageCount = 0;

  for (const [i, row] of products.entries()) {
    const { photo, categorySlug, ...rest } = row;
    const values = {
      ...rest,
      imageUrl: unsplash(photo, 800, 1000),
      categoryId: categoryIds.get(categorySlug) ?? null,
      position: i + 1,
    };

    const [saved] = await db
      .insert(product)
      .values(values)
      .onConflictDoUpdate({
        target: product.slug,
        set: {
          name: values.name,
          detail: values.detail,
          description: values.description,
          priceCents: values.priceCents,
          imageUrl: values.imageUrl,
          imageAlt: values.imageAlt,
          categoryId: values.categoryId,
          stockQuantity: values.stockQuantity,
          sku: values.sku,
          composition: values.composition,
          care: values.care,
          position: values.position,
        },
      })
      .returning({ id: product.id });

    // Replaced wholesale rather than upserted: the gallery is an ordered list,
    // and a shoot that loses a frame should lose the row too.
    await db.delete(productImage).where(eq(productImage.productId, saved.id));
    const frames = shot(photo, row.imageAlt);
    await db.insert(productImage).values(
      frames.map((frame, position) => ({
        productId: saved.id,
        url: frame.url,
        alt: frame.alt,
        position,
      })),
    );
    imageCount += frames.length;
  }

  console.log(`Seeded ${products.length} products, ${imageCount} images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
