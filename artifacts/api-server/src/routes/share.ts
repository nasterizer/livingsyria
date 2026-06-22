import { Router, type IRouter, type Request, type Response } from "express";
import { db, listingsTable, newsArticlesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { getAI } from "../lib/gemini";

const router: IRouter = Router();

// ─── GET /share/blurb ─────────────────────────────────────────────────────────
// Returns a punchy 2-line bilingual (AR + EN) share blurb for a listing or article.
// For articles: uses existing AI summary fields already in the DB.
// For listings: generates on-demand via Gemini (cached by sessionStorage client-side).
router.get("/share/blurb", async (req: Request, res: Response) => {
  const type = String(req.query.type ?? "listing");
  const id = String(req.query.id ?? "");

  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  if (type === "article") {
    const [article] = await db
      .select({
        titleAr: newsArticlesTable.titleAr,
        titleEn: newsArticlesTable.titleEn,
        aiSummaryAr: newsArticlesTable.aiSummaryAr,
        aiSummaryEn: newsArticlesTable.aiSummaryEn,
        summaryAr: newsArticlesTable.summaryAr,
        summaryEn: newsArticlesTable.summaryEn,
      })
      .from(newsArticlesTable)
      .where(or(eq(newsArticlesTable.id, id), eq(newsArticlesTable.slug, id)))
      .limit(1);

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    const blurbAr = truncate(article.aiSummaryAr ?? article.summaryAr ?? article.titleAr, 120);
    const blurbEn = truncate(article.aiSummaryEn ?? article.summaryEn ?? article.titleEn ?? article.titleAr, 120);

    res.json({ data: { blurbAr, blurbEn } });
    return;
  }

  if (type === "listing") {
    const [listing] = await db
      .select({
        titleAr: listingsTable.titleAr,
        titleEn: listingsTable.titleEn,
        descriptionAr: listingsTable.descriptionAr,
        descriptionEn: listingsTable.descriptionEn,
        priceCents: listingsTable.priceCents,
        currency: listingsTable.currency,
        isFree: listingsTable.isFree,
        city: listingsTable.city,
      })
      .from(listingsTable)
      .where(eq(listingsTable.id, id))
      .limit(1);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    try {
      const ai = getAI();
      const priceStr = listing.isFree
        ? "مجاناً / Free"
        : listing.priceCents
        ? `${(listing.priceCents / 100).toFixed(0)} ${listing.currency ?? "USD"}`
        : "";

      const prompt = `You are writing a social media share teaser for a classified listing on LivingSyria, a Syrian classifieds platform.

Listing details:
- Arabic title: ${listing.titleAr}
- English title: ${listing.titleEn ?? "(none)"}
- Description (AR): ${(listing.descriptionAr ?? "").substring(0, 200)}
- Description (EN): ${(listing.descriptionEn ?? "").substring(0, 200)}
- Price: ${priceStr}
- City: ${listing.city}

Write exactly 2 lines:
Line 1: A punchy Arabic teaser (max 100 chars). Start with an emoji relevant to the listing. RTL text.
Line 2: A punchy English teaser (max 100 chars). Start with an emoji. Same content as line 1.

Rules:
- Be specific and compelling, not generic
- Mention the city and price if relevant
- No hashtags, no URLs
- Return ONLY the 2 lines, nothing else

Example format:
🏠 شقة واسعة في دمشق بسعر مناسب — لا تفوّت الفرصة!
🏠 Spacious Damascus apartment at a great price — don't miss out!`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const lines = text.trim().split("\n").filter((l) => l.trim());
      const blurbAr = truncate(lines[0] ?? listing.titleAr, 140);
      const blurbEn = truncate(lines[1] ?? listing.titleEn ?? listing.titleAr, 140);

      res.json({ data: { blurbAr, blurbEn } });
    } catch (err) {
      req.log?.warn({ err }, "Gemini share blurb generation failed — falling back to title");
      res.json({
        data: {
          blurbAr: listing.titleAr,
          blurbEn: listing.titleEn ?? listing.titleAr,
        },
      });
    }
    return;
  }

  res.status(400).json({ error: "type must be 'listing' or 'article'" });
});

function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return "";
  return str.length <= maxLen ? str : str.substring(0, maxLen - 1) + "…";
}

export default router;
