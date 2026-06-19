import { pgTable, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const listingDraftsTable = pgTable("listing_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  formData: jsonb("form_data").notNull().default({}),
  imageObjectPaths: jsonb("image_object_paths").notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ListingDraft = typeof listingDraftsTable.$inferSelect;
