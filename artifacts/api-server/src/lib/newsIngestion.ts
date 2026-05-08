import Parser from "rss-parser";
import { ai } from "@workspace/integrations-gemini-ai";
import { db, newsArticlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { makeSlug } from "./slug";
import { logger } from "./logger";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "LivingSyriaBot/0.1 (+https://livingsyria.com)" },
});

export interface FeedSource {
  name: string;
  url: string;
  language: "ar" | "en";
}

export const FEEDS: FeedSource[] = [
  { name: "BBC Arabic", url: "https://feeds.bbci.co.uk/arabic/rss.xml", language: "ar" },
  { name: "Al Jazeera", url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9", language: "ar" },
  { name: "SANA", url: "https://sana.sy/feed/", language: "ar" },
];

interface AiNewsResult {
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  tags: string[];
}

async function summarizeWithGemini(
  sourceTitle: string,
  sourceContent: string,
  language: "ar" | "en",
): Promise<AiNewsResult | null> {
  try {
    const prompt = `You are a bilingual news editor for LivingSyria, a Syria-focused platform.
Given the following news article (originally in ${language === "ar" ? "Arabic" : "English"}), produce a concise neutral summary in BOTH Arabic and English.

ARTICLE TITLE: ${sourceTitle}
ARTICLE CONTENT: ${sourceContent.slice(0, 3500)}

Respond with strict JSON only, no markdown, no commentary:
{
  "titleAr": "polished Arabic title (max 90 chars)",
  "titleEn": "polished English title (max 90 chars)",
  "summaryAr": "2-3 sentence Arabic summary",
  "summaryEn": "2-3 sentence English summary",
  "tags": ["1-4 short topical tags in english lowercase, e.g. economy, damascus, reconstruction"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text) as AiNewsResult;
    if (!parsed.titleAr || !parsed.summaryAr) return null;
    return parsed;
  } catch (err) {
    logger.warn({ err }, "Gemini summarization failed");
    return null;
  }
}

export async function ingestFeeds(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const feed of FEEDS) {
    let parsed;
    try {
      parsed = await parser.parseURL(feed.url);
    } catch (err) {
      logger.warn({ err, feed: feed.name }, "Failed to fetch feed");
      continue;
    }

    const items = (parsed.items ?? []).slice(0, 5);
    for (const item of items) {
      const sourceUrl = item.link;
      if (!sourceUrl) {
        skipped++;
        continue;
      }
      // dedupe by sourceUrl
      const existing = await db
        .select({ id: newsArticlesTable.id })
        .from(newsArticlesTable)
        .where(eq(newsArticlesTable.sourceUrl, sourceUrl))
        .limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      const sourceTitle = item.title ?? "Untitled";
      const sourceContent =
        (item.contentSnippet as string) ||
        (item.content as string) ||
        sourceTitle;

      const ai_result = await summarizeWithGemini(sourceTitle, sourceContent, feed.language);
      // fallback: store raw if AI failed
      const titleAr = ai_result?.titleAr ?? (feed.language === "ar" ? sourceTitle : sourceTitle);
      const titleEn = ai_result?.titleEn ?? (feed.language === "en" ? sourceTitle : null);
      const summaryAr = ai_result?.summaryAr ?? (feed.language === "ar" ? sourceContent.slice(0, 280) : null);
      const summaryEn = ai_result?.summaryEn ?? (feed.language === "en" ? sourceContent.slice(0, 280) : null);

      const coverImageUrl =
        (item.enclosure as { url?: string } | undefined)?.url ??
        ((item as Record<string, unknown>)["media:content"] as { $?: { url?: string } } | undefined)?.$?.url ??
        null;

      try {
        await db.insert(newsArticlesTable).values({
          slug: makeSlug(titleAr),
          sourceName: feed.name,
          sourceUrl,
          titleAr,
          titleEn,
          summaryAr,
          summaryEn,
          aiSummaryAr: ai_result?.summaryAr ?? null,
          aiSummaryEn: ai_result?.summaryEn ?? null,
          coverImageUrl,
          tags: ai_result?.tags ?? [],
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          status: "PUBLISHED",
        });
        inserted++;
      } catch (err) {
        logger.warn({ err, sourceUrl }, "Failed to insert article");
        skipped++;
      }
    }
  }

  logger.info({ inserted, skipped }, "News ingestion complete");
  return { inserted, skipped };
}
