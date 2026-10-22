/**
 * Catalogue tables: categories, products and the product gallery.
 *
 * Conventions follow `auth.ts` — singular lowercase table names, camelCase TS
 * properties with the snake_case column name passed explicitly (no `casing`
 * option is configured, so the string is load-bearing). Ids differ: Better Auth
 * generates its own, while these are `uuid().defaultRandom()` so the database
 * owns them. `slug` is a separate unique column rather than the primary key,
 * because slugs get edited and orders will need a stable reference.
 *
 * Prices are integer minor units (cents) to avoid float rounding.
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Serves both the product categories and the collection cards on the homepage —
 * `featured` picks out the latter. The two were separate, partly overlapping
 * lists in the old sample data, which was an artefact of placeholder content
 * rather than a design.
 */
export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Collection-card subtitle. Only the featured rows need one. */
  caption: text("caption"),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  featured: boolean("featured").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Stock lives here as a quantity and a threshold rather than a stored state, so
 * the two can never contradict each other. `stockStateFor` in
 * `src/lib/catalog.ts` derives the label.
 */
export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The `/products/[slug]` route param. */
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    /** Short material line shown under the name on cards. */
    detail: text("detail").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    /** The card and listing image, distinct from the gallery frames. */
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    // Nullable, and `set null` rather than cascade: removing a category must
    // not take its products with it.
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    sku: text("sku").notNull().unique(),
    /** Ordered free-text lines. Nothing queries inside them, so jsonb is enough. */
    composition: jsonb("composition").$type<string[]>().default([]).notNull(),
    care: text("care").notNull(),
    /** Ordering for the homepage grid, replacing the old array order. */
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("product_categoryId_idx").on(table.categoryId)],
);

/**
 * Gallery frames. Ordered, and each carries its own alt text, so this earns a
 * table of its own. `ProductGallery` keys on the URL, so the unique constraint
 * on `(productId, position)` keeps the ordering unambiguous.
 */
export const productImage = pgTable(
  "product_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    /** `0` is the primary frame. */
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    index("product_image_productId_idx").on(table.productId),
    unique("product_image_productId_position_key").on(
      table.productId,
      table.position,
    ),
  ],
);

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  images: many(productImage),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
}));
