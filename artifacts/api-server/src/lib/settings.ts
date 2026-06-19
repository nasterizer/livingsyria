import { db, platformSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

interface SettingDefault {
  key: string;
  value: unknown;
  label: string;
  description?: string;
  group: string;
}

export const SETTING_DEFAULTS: SettingDefault[] = [
  // ─── News ─────────────────────────────────────────────────────────────────
  {
    key: "news.enabled",
    value: true,
    label: "Enable news ingestion",
    description: "When disabled, scheduled ingestion is skipped entirely.",
    group: "news",
  },
  {
    key: "news.cron_interval_minutes",
    value: 60,
    label: "Ingestion interval (minutes)",
    description: "How often to fetch from RSS feeds. Restarts take effect immediately.",
    group: "news",
  },
  {
    key: "news.max_items_per_feed",
    value: 5,
    label: "Max articles per feed per run",
    description: "Maximum articles processed per RSS feed per ingestion run.",
    group: "news",
  },
  {
    key: "news.feeds",
    value: [
      {
        name: "BBC Arabic",
        url: "https://feeds.bbci.co.uk/arabic/rss.xml",
        language: "ar",
      },
      {
        name: "Al Jazeera",
        url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9",
        language: "ar",
      },
      { name: "SANA", url: "https://sana.sy/feed/", language: "ar" },
    ],
    label: "RSS feed sources",
    description:
      "Array of {name, url, language} objects. language must be \"ar\" or \"en\".",
    group: "news",
  },

  // ─── Moderation ────────────────────────────────────────────────────────────
  {
    key: "moderation.enabled",
    value: true,
    label: "Enable AI moderation",
    description:
      "When enabled, new listings are reviewed by AI before publishing.",
    group: "moderation",
  },
  {
    key: "moderation.auto_approve_threshold",
    value: 0.8,
    label: "Auto-approve threshold",
    description: "Safety score ≥ this value → listing auto-approved (0–1).",
    group: "moderation",
  },
  {
    key: "moderation.auto_reject_threshold",
    value: 0.3,
    label: "Auto-reject threshold",
    description: "Safety score ≤ this value → listing auto-rejected (0–1).",
    group: "moderation",
  },
  {
    key: "moderation.prompt",
    value:
      "You are a content moderator for a Syrian classifieds platform. Review this listing and decide if it is safe and appropriate. Flag any content that is: spam, illegal goods, weapons, adult content, hate speech, or political propaganda.\n\nListing title (Arabic): {titleAr}\nListing description (Arabic): {descriptionAr}\n\nRespond ONLY with valid JSON (no markdown fences):\n{\"safe\": boolean, \"score\": number, \"reason\": \"optional short string\"}\n\nscore = confidence the content is safe (1.0 = definitely safe, 0.0 = definitely unsafe).",
    label: "Moderation AI prompt",
    description:
      "Use {titleAr} and {descriptionAr} as placeholders for listing content.",
    group: "moderation",
  },

  // ─── Translation ───────────────────────────────────────────────────────────
  {
    key: "translation.enabled",
    value: true,
    label: "Enable auto-translation",
    description:
      "When enabled, listings without English text are auto-translated via AI.",
    group: "translation",
  },

  // ─── Listings ──────────────────────────────────────────────────────────────
  {
    key: "listings.max_images",
    value: 5,
    label: "Max images per listing",
    description: "Maximum number of images a user can upload per listing.",
    group: "listings",
  },
  {
    key: "listings.cities",
    value: [
      { ar: "دمشق", en: "Damascus" },
      { ar: "حلب", en: "Aleppo" },
      { ar: "حمص", en: "Homs" },
      { ar: "حماة", en: "Hama" },
      { ar: "اللاذقية", en: "Latakia" },
      { ar: "طرطوس", en: "Tartus" },
      { ar: "دير الزور", en: "Deir ez-Zor" },
      { ar: "الرقة", en: "Raqqa" },
      { ar: "درعا", en: "Daraa" },
      { ar: "السويداء", en: "As-Suwayda" },
      { ar: "إدلب", en: "Idlib" },
      { ar: "الحسكة", en: "Al-Hasakah" },
      { ar: "القنيطرة", en: "Quneitra" },
      { ar: "ريف دمشق", en: "Rural Damascus" },
    ],
    label: "Syrian cities",
    description:
      "Array of {ar, en} objects shown in the location picker on the listing form.",
    group: "listings",
  },
];

const KNOWN_KEYS = new Set(SETTING_DEFAULTS.map((d) => d.key));

/** Seed all defaults, skipping any keys that already exist in the DB. */
export async function ensureDefaults(): Promise<void> {
  try {
    await db
      .insert(platformSettingsTable)
      .values(
        SETTING_DEFAULTS.map((d) => ({
          key: d.key,
          value: d.value,
          label: d.label,
          description: d.description ?? null,
          group: d.group,
        })),
      )
      .onConflictDoNothing();
    logger.info("Platform settings defaults ensured");
  } catch (err) {
    logger.error({ err }, "Failed to seed platform settings defaults");
  }
}

/** Read a single setting from the DB, returning `fallback` if missing. */
export async function getSetting<T>(key: string, fallback: T): Promise<T>;
export async function getSetting(key: string): Promise<unknown>;
export async function getSetting<T>(
  key: string,
  fallback?: T,
): Promise<T | unknown> {
  try {
    const [row] = await db
      .select({ value: platformSettingsTable.value })
      .from(platformSettingsTable)
      .where(eq(platformSettingsTable.key, key))
      .limit(1);
    if (row === undefined) return fallback;
    return row.value as T;
  } catch {
    return fallback;
  }
}

/** Read all settings, returning a record keyed by setting key. */
export async function getAllSettings(): Promise<
  Record<
    string,
    { value: unknown; label: string; description: string | null; group: string }
  >
> {
  const rows = await db.select().from(platformSettingsTable);
  return Object.fromEntries(
    rows.map((r) => [
      r.key,
      {
        value: r.value,
        label: r.label,
        description: r.description,
        group: r.group,
      },
    ]),
  );
}

/** Update a single setting value. Key must be a known setting. */
export async function setSetting(
  key: string,
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!KNOWN_KEYS.has(key)) {
    return { ok: false, error: `Unknown setting key: ${key}` };
  }
  await db
    .update(platformSettingsTable)
    .set({ value, updatedAt: new Date() })
    .where(eq(platformSettingsTable.key, key));
  return { ok: true };
}
