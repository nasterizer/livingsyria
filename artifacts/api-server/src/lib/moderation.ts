import { ai } from "@workspace/integrations-gemini-ai";
import { db, listingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";
import { getSetting } from "./settings";

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
  // ─── Check if moderation is enabled ────────────────────────────────────────
  const enabled = await getSetting<boolean>("moderation.enabled", true);
  if (!enabled) {
    logger.info({ listingId }, "AI moderation disabled — leaving PENDING_REVIEW");
    return;
  }

  // ─── Read configurable thresholds and prompt ────────────────────────────────
  const autoApproveThreshold = await getSetting<number>(
    "moderation.auto_approve_threshold",
    0.8,
  );
  const autoRejectThreshold = await getSetting<number>(
    "moderation.auto_reject_threshold",
    0.3,
  );
  const promptTemplate = await getSetting<string>(
    "moderation.prompt",
    "You are a content moderator for a Syrian classifieds platform.\n\nListing title (Arabic): {titleAr}\nListing description (Arabic): {descriptionAr}\n\nRespond ONLY with valid JSON:\n{\"safe\": boolean, \"score\": number, \"reason\": \"optional short string\"}",
  );

  const prompt = promptTemplate
    .replace("{titleAr}", titleAr)
    .replace("{descriptionAr}", descriptionAr);

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

  const moderationScore =
    typeof result.score === "number" ? result.score : 0.5;
  const moderationReason = result.reason ?? null;

  let newStatus: string;
  if (result.safe && moderationScore >= autoApproveThreshold) {
    newStatus = "ACTIVE";
  } else if (!result.safe && moderationScore <= autoRejectThreshold) {
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
