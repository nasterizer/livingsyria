import { ai } from "@workspace/integrations-gemini-ai";
import { db, listingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";

interface ModerationResult {
  safe: boolean;
  score: number;
  reason?: string;
}

export async function moderateListing(
  listingId: string,
  titleAr: string,
  descriptionAr: string,
): Promise<void> {
  const prompt = `You are a content moderator for a Syrian classifieds platform. Review this listing and decide if it is safe and appropriate. Flag any content that is: spam, illegal goods, weapons, adult content, hate speech, or political propaganda.

Listing title (Arabic): ${titleAr}
Listing description (Arabic): ${descriptionAr}

Respond ONLY with valid JSON (no markdown fences):
{"safe": boolean, "score": number, "reason": "optional short string"}

score = confidence the content is safe (1.0 = definitely safe, 0.0 = definitely unsafe).`;

  let result: ModerationResult;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.1 },
    });
    const raw = (response.text ?? "").replace(/```json|```/g, "").trim();
    result = JSON.parse(raw) as ModerationResult;
  } catch (err) {
    logger.warn({ err, listingId }, "Moderation AI call failed, leaving PENDING_REVIEW");
    return;
  }

  const moderationScore = typeof result.score === "number" ? result.score : 0.5;
  const moderationReason = result.reason ?? null;

  let newStatus: string;
  if (result.safe && moderationScore >= 0.8) {
    newStatus = "ACTIVE";
  } else if (!result.safe && moderationScore <= 0.3) {
    newStatus = "REJECTED";
  } else {
    newStatus = "PENDING_REVIEW";
  }

  await db
    .update(listingsTable)
    .set({
      moderationScore,
      moderationReason,
      status: newStatus,
      ...(newStatus === "ACTIVE"
        ? { publishedAt: new Date() }
        : { publishedAt: sql`NULL` }),
    })
    .where(eq(listingsTable.id, listingId));

  logger.info({ listingId, moderationScore, newStatus }, "Moderation complete");
}
