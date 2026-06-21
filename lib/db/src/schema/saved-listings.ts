import { pgTable, varchar, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

export const savedListingsTable = pgTable(
  "saved_listings",
  {
    userId: varchar("user_id").notNull(),
    listingId: varchar("listing_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    index("idx_saved_listings_user_id").on(table.userId),
    index("idx_saved_listings_listing_id").on(table.listingId),
  ],
);

export type SavedListing = typeof savedListingsTable.$inferSelect;
export type InsertSavedListing = typeof savedListingsTable.$inferInsert;
