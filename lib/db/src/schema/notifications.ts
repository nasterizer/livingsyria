import { pgTable, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notificationsTable = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    type: varchar("type").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    listingId: varchar("listing_id"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_notifications_user_id").on(table.userId),
    index("idx_notifications_created_at").on(table.createdAt),
  ],
);

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;
