import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const platformSettingsTable = pgTable("platform_settings", {
  key: varchar("key").primaryKey(),
  value: jsonb("value").notNull(),
  label: varchar("label").notNull(),
  description: text("description"),
  group: varchar("group", { length: 64 }).notNull().default("general"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type PlatformSetting = typeof platformSettingsTable.$inferSelect;
