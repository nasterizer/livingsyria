import { Router, type IRouter, type Request, type Response } from "express";
import { autoTranslateListing } from "../lib/translation";
import { moderateListing } from "../lib/moderation";
import { getAllSettings, getSetting, setSetting } from "../lib/settings";
import { boss, JOB_NEWS_INGEST, scheduleNewsIngestion } from "../lib/jobQueue";
import { db, listingsTable, newsArticlesTable, notificationsTable, settingsAuditLogTable, savedListingsTable, baUserTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── Admin auth helpers ───────────────────────────────────────────────────────

function getAdminUserIds(): Set<string> {
  const ids = new Set<string>();
  const extra = process.env.ADMIN_USER_IDS;
  if (extra) {
    for (const id of extra.split(",")) {
      const trimmed = id.trim();
      if (trimmed) ids.add(trimmed);
    }
  }
  return ids;
}

function isAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  return getAdminUserIds().has(userId);
}

function requireAdmin(req: Request, res: Response): boolean {
  if (!req.isAuthenticated() || !isAdmin(req.user.id)) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

// ─── GET /settings/public — no auth required ─────────────────────────────────
router.get("/settings/public", async (_req: Request, res: Response) => {
  const [cities, maxImages, messagingEnabled] = await Promise.all([
    getSetting<Array<{ ar: string; en: string }>>("listings.cities", []),
    getSetting<number>("listings.max_images", 5),
    getSetting<boolean>("messaging.enabled", true),
  ]);
  res.json({ data: { cities, maxImages, messagingEnabled } });
});

// ─── GET /admin/me ────────────────────────────────────────────────────────────
router.get("/admin/me", (req: Request, res: Response) => {
  const admin = req.isAuthenticated() ? isAdmin(req.user.id) : false;
  res.json({ data: { isAdmin: admin } });
});

// ─── Admin listings ───────────────────────────────────────────────────────────

router.get("/admin/listings", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const {
    status,
    page = "1",
    limit = "20",
  } = req.query as { status?: string; page?: string; limit?: string };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = status ? [eq(listingsTable.status, status)] : [];
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(listingsTable)
      .where(where)
      .orderBy(desc(listingsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listingsTable)
      .where(where),
  ]);

  const total = totals[0]?.count ?? 0;
  res.json({
    data: rows,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

router.post(
  "/admin/listings/:id/approve",
  async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;

    const [listing] = await db
      .select({ id: listingsTable.id, userId: listingsTable.userId, titleAr: listingsTable.titleAr, titleEn: listingsTable.titleEn })
      .from(listingsTable)
      .where(eq(listingsTable.id, String(req.params.id)))
      .limit(1);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    await db
      .update(listingsTable)
      .set({ status: "ACTIVE", publishedAt: new Date() })
      .where(eq(listingsTable.id, String(req.params.id)));

    // Create notification for listing owner (fire-and-forget)
    const notifEnabled = await getSetting<boolean>("notifications.enabled", true);
    if (notifEnabled) {
      db.insert(notificationsTable)
        .values({
          userId: listing.userId,
          type: "listing_approved",
          titleAr: `تمت الموافقة على إعلانك: ${listing.titleAr}`,
          titleEn: `Your listing was approved: ${listing.titleEn ?? listing.titleAr}`,
          listingId: listing.id,
        })
        .catch(() => {});
    }

    res.json({ data: { ok: true } });
  },
);

router.post(
  "/admin/listings/:id/reject",
  async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;

    const [listing] = await db
      .select({ id: listingsTable.id, userId: listingsTable.userId, titleAr: listingsTable.titleAr, titleEn: listingsTable.titleEn })
      .from(listingsTable)
      .where(eq(listingsTable.id, String(req.params.id)))
      .limit(1);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const { reason } = req.body as { reason?: string };

    if (!reason?.trim()) {
      res.status(400).json({ error: "A rejection reason is required" });
      return;
    }

    await db
      .update(listingsTable)
      .set({
        status: "REJECTED",
        moderationReason: reason.trim(),
        publishedAt: sql`NULL`,
      })
      .where(eq(listingsTable.id, String(req.params.id)));

    // Notify listing owner and saved-listing followers (fire-and-forget)
    const notifEnabled = await getSetting<boolean>("notifications.enabled", true);
    if (notifEnabled) {
      // Notify owner
      db.insert(notificationsTable)
        .values({
          userId: listing.userId,
          type: "listing_rejected",
          titleAr: `تم رفض إعلانك: ${listing.titleAr}. السبب: ${reason.trim()}`,
          titleEn: `Your listing was rejected: ${listing.titleEn ?? listing.titleAr}. Reason: ${reason.trim()}`,
          listingId: listing.id,
        })
        .catch(() => {});

      // Notify users who saved this listing
      db.select({ userId: savedListingsTable.userId })
        .from(savedListingsTable)
        .where(eq(savedListingsTable.listingId, listing.id))
        .then((savers) => {
          if (savers.length === 0) return;
          return db.insert(notificationsTable).values(
            savers.map((s) => ({
              userId: s.userId,
              type: "saved_listing_removed",
              titleAr: `تم إزالة إعلان محفوظ: ${listing.titleAr}`,
              titleEn: `A saved listing was removed: ${listing.titleEn ?? listing.titleAr}`,
              listingId: listing.id,
            })),
          );
        })
        .catch(() => {});
    }

    res.json({ data: { ok: true } });
  },
);

// ─── Platform settings ────────────────────────────────────────────────────────

router.get("/admin/settings", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const settings = await getAllSettings();
  res.json({ data: settings });
});

router.put("/admin/settings/:key", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const key = String(req.params.key);
  const { value, expectedUpdatedAt } = req.body as {
    value: unknown;
    expectedUpdatedAt?: string;
  };

  if (value === undefined) {
    res.status(400).json({ error: "value is required in request body" });
    return;
  }

  // Always read old value for audit log + optimistic locking check
  const allSettingsBefore = await getAllSettings();
  const currentSetting = allSettingsBefore[key];
  const oldValue = currentSetting?.value ?? null;

  // Optimistic locking: verify the client's known updatedAt still matches
  if (expectedUpdatedAt !== undefined) {
    if (currentSetting && currentSetting.updatedAt !== expectedUpdatedAt) {
      res.status(409).json({
        error: "conflict",
        serverValue: currentSetting.value,
        serverUpdatedAt: currentSetting.updatedAt,
      });
      return;
    }
  }

  const result = await setSetting(key, value, req.user?.id);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  // Write audit log (fire-and-forget — do not block response)
  db.insert(settingsAuditLogTable)
    .values({
      settingKey: key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      oldValue: oldValue as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      newValue: value as any,
      changedBy: req.user?.id ?? null,
    })
    .catch((err: unknown) =>
      req.log.warn({ err, key }, "Failed to write settings audit log"),
    );

  // When cron interval changes, re-register immediately
  if (key === "news.cron_interval_minutes") {
    const mins = typeof value === "number" ? value : parseFloat(String(value));
    if (!isNaN(mins)) {
      scheduleNewsIngestion(mins).catch((err) =>
        req.log.warn({ err }, "Failed to update news ingestion schedule"),
      );
    }
  }

  const allSettingsAfter = await getAllSettings();
  const saved = allSettingsAfter[key];

  res.json({ data: { ok: true, updatedAt: saved?.updatedAt ?? null } });
});

// ─── GET /admin/settings/:key/audit ──────────────────────────────────────────
router.get("/admin/settings/:key/audit", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const key = String(req.params.key);
  const rows = await db
    .select({
      id: settingsAuditLogTable.id,
      settingKey: settingsAuditLogTable.settingKey,
      oldValue: settingsAuditLogTable.oldValue,
      newValue: settingsAuditLogTable.newValue,
      changedBy: settingsAuditLogTable.changedBy,
      changedAt: settingsAuditLogTable.changedAt,
      changedByName: baUserTable.name,
    })
    .from(settingsAuditLogTable)
    .leftJoin(baUserTable, eq(settingsAuditLogTable.changedBy, baUserTable.id))
    .where(eq(settingsAuditLogTable.settingKey, key))
    .orderBy(desc(settingsAuditLogTable.changedAt))
    .limit(50);

  res.json({ data: rows });
});

// ─── News management ──────────────────────────────────────────────────────────

router.post("/admin/news/ingest", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  await boss.send(JOB_NEWS_INGEST, {});
  res.json({ data: { started: true } });
});

router.get("/admin/news", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const [total, recent] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsArticlesTable),
    db
      .select({
        id: newsArticlesTable.id,
        titleAr: newsArticlesTable.titleAr,
        sourceName: newsArticlesTable.sourceName,
        status: newsArticlesTable.status,
        publishedAt: newsArticlesTable.publishedAt,
      })
      .from(newsArticlesTable)
      .orderBy(desc(newsArticlesTable.publishedAt))
      .limit(20),
  ]);

  res.json({ data: { total: total[0]?.count ?? 0, recent } });
});

// ─── GET /admin/jobs — pg-boss job history ────────────────────────────────────
router.get("/admin/jobs", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const [jobs, schedule] = await Promise.all([
    db.execute(sql`
      SELECT
        id,
        name,
        state,
        createdon  AS "createdOn",
        startedon  AS "startedOn",
        completedon AS "completedOn",
        output
      FROM pgboss.job
      WHERE name = ${JOB_NEWS_INGEST}
      ORDER BY createdon DESC
      LIMIT 20
    `),
    db.execute(sql`
      SELECT
        name,
        cron,
        timezone,
        created_on AS "createdOn",
        updated_on AS "updatedOn"
      FROM pgboss.schedule
      WHERE name = ${JOB_NEWS_INGEST}
      LIMIT 1
    `),
  ]);

  res.json({
    data: {
      jobs: jobs.rows,
      schedule: schedule.rows[0] ?? null,
    },
  });
});

// ─── Manual moderation & translation triggers ─────────────────────────────────

router.post("/admin/translate", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { listingId } = req.body as { listingId?: string };
  if (!listingId || typeof listingId !== "string") {
    res.status(400).json({ error: "listingId is required" });
    return;
  }

  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  autoTranslateListing(listingId).catch((err) =>
    req.log.error({ err, listingId }, "Manual translation failed"),
  );

  res.json({ data: { started: true, listingId } });
});

router.post("/admin/moderate", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { listingId } = req.body as { listingId?: string };
  if (!listingId || typeof listingId !== "string") {
    res.status(400).json({ error: "listingId is required" });
    return;
  }

  const [listing] = await db
    .select({
      id: listingsTable.id,
      titleAr: listingsTable.titleAr,
      descriptionAr: listingsTable.descriptionAr,
    })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  moderateListing(listingId, listing.titleAr, listing.descriptionAr).catch(
    (err) => req.log.error({ err, listingId }, "Manual moderation failed"),
  );

  res.json({ data: { started: true, listingId } });
});

export default router;
