import { Router, type IRouter, type Request, type Response } from "express";
import { ingestFeeds } from "../lib/newsIngestion";
import { autoTranslateListing } from "../lib/translation";
import { moderateListing } from "../lib/moderation";
import { getAllSettings, getSetting, setSetting } from "../lib/settings";
import { db, listingsTable, newsArticlesTable } from "@workspace/db";
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
router.get("/settings/public", async (req: Request, res: Response) => {
  const [cities, maxImages] = await Promise.all([
    getSetting<Array<{ ar: string; en: string }>>("listings.cities", []),
    getSetting<number>("listings.max_images", 5),
  ]);
  res.json({ data: { cities, maxImages } });
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
      .select({ id: listingsTable.id })
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

    res.json({ data: { ok: true } });
  },
);

router.post(
  "/admin/listings/:id/reject",
  async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;

    const [listing] = await db
      .select({ id: listingsTable.id })
      .from(listingsTable)
      .where(eq(listingsTable.id, String(req.params.id)))
      .limit(1);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const { reason } = req.body as { reason?: string };

    await db
      .update(listingsTable)
      .set({
        status: "REJECTED",
        moderationReason: reason ?? null,
        publishedAt: sql`NULL`,
      })
      .where(eq(listingsTable.id, String(req.params.id)));

    res.json({ data: { ok: true } });
  },
);

// ─── Platform settings ────────────────────────────────────────────────────────

router.get("/admin/settings", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const settings = await getAllSettings();
  res.json({ data: settings });
});

// Key may contain dots (e.g. "news.enabled") — dots are allowed in route params
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

  // Optimistic locking: if caller provided expectedUpdatedAt, verify it matches
  if (expectedUpdatedAt !== undefined) {
    const allSettings = await getAllSettings();
    const current = allSettings[key];
    if (current && current.updatedAt !== expectedUpdatedAt) {
      res.status(409).json({
        error: "conflict",
        serverValue: current.value,
        serverUpdatedAt: current.updatedAt,
      });
      return;
    }
  }

  const result = await setSetting(key, value);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  const allSettings = await getAllSettings();
  const saved = allSettings[key];

  res.json({ data: { ok: true, updatedAt: saved?.updatedAt ?? null } });
});

// ─── News management ──────────────────────────────────────────────────────────

router.post("/admin/news/ingest", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  ingestFeeds()
    .then(({ inserted, skipped }) =>
      req.log.info({ inserted, skipped }, "Manual news ingestion complete"),
    )
    .catch((err) => req.log.error({ err }, "Manual news ingestion failed"));

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
