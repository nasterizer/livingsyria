import { ai } from "./gemini";
import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { getSetting } from "./settings";

async function translateText(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Translate the following Arabic text to English. Return ONLY the translation, no explanation or preamble:\n\n${text}`,
          },
        ],
      },
    ],
    config: { temperature: 0.2 },
  });
  return response.text?.trim() ?? "";
}

export async function autoTranslateListing(listingId: string): Promise<void> {
  const enabled = await getSetting<boolean>("translation.enabled", true);
  if (!enabled) {
    logger.info({ listingId }, "Auto-translation disabled — skipping");
    return;
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) {
    logger.warn({ listingId }, "Listing not found for translation");
    return;
  }

  const updates: Partial<typeof listingsTable.$inferInsert> = {};

  try {
    if (!row.titleEn && row.titleAr) {
      updates.titleEn = await translateText(row.titleAr);
    }
    if (!row.descriptionEn && row.descriptionAr) {
      updates.descriptionEn = await translateText(row.descriptionAr);
    }
  } catch (err) {
    logger.warn({ err, listingId }, "Translation AI call failed");
    return;
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(listingsTable)
      .set(updates)
      .where(eq(listingsTable.id, listingId));
    logger.info(
      { listingId, fields: Object.keys(updates) },
      "Translation complete",
    );
  }
}
