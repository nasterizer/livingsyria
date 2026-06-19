import { pgTable, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const messagesTable = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    listingId: varchar("listing_id").notNull(),
    fromUserId: varchar("from_user_id").notNull(),
    toUserId: varchar("to_user_id").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_messages_listing_id").on(table.listingId),
    index("idx_messages_from_user_id").on(table.fromUserId),
    index("idx_messages_to_user_id").on(table.toUserId),
  ],
);

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
