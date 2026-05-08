import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const newsArticlesTable = pgTable(
  "news_articles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar("slug").notNull().unique(),
    sourceName: varchar("source_name").notNull(),
    sourceUrl: varchar("source_url").notNull().unique(),
    titleAr: varchar("title_ar").notNull(),
    titleEn: varchar("title_en"),
    summaryAr: text("summary_ar"),
    summaryEn: text("summary_en"),
    bodyAr: text("body_ar"),
    bodyEn: text("body_en"),
    aiSummaryAr: text("ai_summary_ar"),
    aiSummaryEn: text("ai_summary_en"),
    coverImageUrl: varchar("cover_image_url"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    status: varchar("status").default("PUBLISHED").notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_news_status_pub").on(table.status, table.publishedAt)],
);

export type NewsArticle = typeof newsArticlesTable.$inferSelect;
export type InsertNewsArticle = typeof newsArticlesTable.$inferInsert;
