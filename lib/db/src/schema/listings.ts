import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const listingsTable = pgTable(
  "listings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar("slug").notNull().unique(),
    userId: varchar("user_id").notNull(),
    categoryId: varchar("category_id").notNull(),
    titleAr: varchar("title_ar").notNull(),
    titleEn: varchar("title_en"),
    descriptionAr: text("description_ar").notNull(),
    descriptionEn: text("description_en"),
    priceCents: integer("price_cents"),
    currency: varchar("currency", { length: 8 }).default("USD").notNull(),
    isFree: boolean("is_free").default(false).notNull(),
    isNegotiable: boolean("is_negotiable").default(false).notNull(),
    country: varchar("country", { length: 8 }).default("SY").notNull(),
    city: varchar("city").notNull(),
    district: varchar("district"),
    status: varchar("status").default("ACTIVE").notNull(),
    listingType: varchar("listing_type").default("FREE").notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    primaryImageUrl: varchar("primary_image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_listings_status_published").on(table.status, table.publishedAt),
    index("idx_listings_category").on(table.categoryId),
    index("idx_listings_user").on(table.userId),
  ],
);

export const listingImagesTable = pgTable("listing_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull(),
  objectPath: varchar("object_path").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Listing = typeof listingsTable.$inferSelect;
export type InsertListing = typeof listingsTable.$inferInsert;
export type ListingImage = typeof listingImagesTable.$inferSelect;
export type InsertListingImage = typeof listingImagesTable.$inferInsert;
