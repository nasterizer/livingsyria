import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  listingsTable,
  listingImagesTable,
  listingDraftsTable,
  categoriesTable,
  savedListingsTable,
} from "@workspace/db";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import {
  CreateListingBody,
  ListListingsQueryParams,
} from "@workspace/api-zod";
import { makeSlug } from "../lib/slug";
import { ObjectStorageService } from "../lib/objectStorage";
import { moderateListing } from "../lib/moderation";
import { autoTranslateListing } from "../lib/translation";
import { getSetting } from "../lib/settings";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// ─── GET /listings ────────────────────────────────────────────────────────────
router.get("/listings", async (req: Request, res: Response) => {
  const parsed = ListListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { category, city, q, page = 1, limit = 20 } = parsed.data;

  const conditions = [eq(listingsTable.status, "ACTIVE")];
  if (category) {
    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, category))
      .limit(1);
    if (cat) conditions.push(eq(listingsTable.categoryId, cat.id));
  }
  if (city) conditions.push(ilike(listingsTable.city, `%${city}%`));
  if (q) {
    const search = `%${q}%`;
    const searchCond = or(
      ilike(listingsTable.titleAr, search),
      ilike(listingsTable.titleEn, search),
      ilike(listingsTable.descriptionAr, search),
    );
    if (searchCond) conditions.push(searchCond);
  }
  const where = and(...conditions);

  const offset = (page - 1) * limit;
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(listingsTable)
      .where(where)
      .orderBy(desc(listingsTable.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listingsTable)
      .where(where),
  ]);

  const total = totals[0]?.count ?? 0;
  res.json({
    data: rows,
    meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// ─── GET /listings/me ─────────────────────────────────────────────────────────
router.get("/listings/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.userId, req.user.id))
    .orderBy(desc(listingsTable.createdAt));
  res.json({ data: rows });
});

// ─── GET /listings/me/saved ───────────────────────────────────────────────────
// Must come before /:slug to avoid "me" being treated as a slug
router.get("/listings/me/saved", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const saves = await db
    .select({ listingId: savedListingsTable.listingId })
    .from(savedListingsTable)
    .where(eq(savedListingsTable.userId, req.user.id))
    .orderBy(desc(savedListingsTable.createdAt));

  if (saves.length === 0) {
    res.json({ data: [] });
    return;
  }

  const ids = saves.map((s) => s.listingId);
  const listings = await db
    .select()
    .from(listingsTable)
    .where(inArray(listingsTable.id, ids));

  // Preserve saved-recency order
  const byId = new Map(listings.map((l) => [l.id, l]));
  const ordered = ids.flatMap((id) => {
    const l = byId.get(id);
    return l ? [l] : [];
  });

  res.json({ data: ordered });
});

// ─── GET /listings/me/saved-ids ───────────────────────────────────────────────
router.get("/listings/me/saved-ids", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const saves = await db
    .select({ listingId: savedListingsTable.listingId })
    .from(savedListingsTable)
    .where(eq(savedListingsTable.userId, req.user.id));

  res.json({ data: saves.map((s) => s.listingId) });
});

// ─── GET /listings/drafts/me ──────────────────────────────────────────────────
// Must come before /:slug to avoid "drafts" being treated as a slug
router.get("/listings/drafts/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const [draft] = await db
    .select()
    .from(listingDraftsTable)
    .where(eq(listingDraftsTable.userId, req.user.id))
    .limit(1);
  res.json({ data: draft ?? null });
});

// ─── PUT /listings/drafts/me ──────────────────────────────────────────────────
router.put("/listings/drafts/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const { formData, imageObjectPaths } = req.body as {
    formData?: Record<string, unknown>;
    imageObjectPaths?: string[];
  };
  const [draft] = await db
    .insert(listingDraftsTable)
    .values({
      userId: req.user.id,
      formData: formData ?? {},
      imageObjectPaths: imageObjectPaths ?? [],
    })
    .onConflictDoUpdate({
      target: listingDraftsTable.userId,
      set: {
        formData: formData ?? {},
        imageObjectPaths: imageObjectPaths ?? [],
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json({ data: draft });
});

// ─── DELETE /listings/drafts/me ───────────────────────────────────────────────
router.delete("/listings/drafts/me", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  await db
    .delete(listingDraftsTable)
    .where(eq(listingDraftsTable.userId, req.user.id));
  res.json({ data: { ok: true } });
});

// ─── GET /listings/:slug ──────────────────────────────────────────────────────
router.get("/listings/:slug", async (req: Request, res: Response) => {
  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.slug, String(req.params.slug)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const [images, [category]] = await Promise.all([
    db
      .select()
      .from(listingImagesTable)
      .where(eq(listingImagesTable.listingId, row.id)),
    db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, row.categoryId))
      .limit(1),
  ]);

  db.update(listingsTable)
    .set({ viewCount: sql`${listingsTable.viewCount} + 1` })
    .where(eq(listingsTable.id, row.id))
    .catch(() => {});

  res.json({ data: { ...row, images, category } });
});

// ─── POST /listings ───────────────────────────────────────────────────────────
router.post("/listings", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;

  const maxImages = await getSetting<number>("listings.max_images", 5);
  if (body.imageObjectPaths && body.imageObjectPaths.length > maxImages) {
    res.status(400).json({ error: `At most ${maxImages} images allowed` });
    return;
  }

  const slug = makeSlug(body.titleAr);
  const normalizedPaths: string[] = [];
  for (const rawPath of body.imageObjectPaths ?? []) {
    try {
      const normalized = await objectStorageService.trySetObjectEntityAclPolicy(rawPath);
      normalizedPaths.push(normalized);
    } catch (err) {
      req.log.warn({ err, rawPath }, "Failed to set ACL on listing image");
    }
  }
  const primaryImageUrl = normalizedPaths[0] ?? null;

  const [created] = await db
    .insert(listingsTable)
    .values({
      slug,
      userId: req.user.id,
      categoryId: body.categoryId,
      titleAr: body.titleAr,
      titleEn: body.titleEn ?? null,
      descriptionAr: body.descriptionAr,
      descriptionEn: body.descriptionEn ?? null,
      priceCents: body.priceCents ?? null,
      currency: body.currency ?? "USD",
      isFree: body.isFree ?? false,
      isNegotiable: body.isNegotiable ?? false,
      country: body.country ?? "SY",
      city: body.city,
      district: body.district ?? null,
      primaryImageUrl,
      status: "PENDING_REVIEW",
      publishedAt: null,
    })
    .returning();

  if (normalizedPaths.length > 0) {
    await db.insert(listingImagesTable).values(
      normalizedPaths.map((path, idx) => ({
        listingId: created.id,
        objectPath: path,
        sortOrder: idx,
        isPrimary: idx === 0,
      })),
    );
  }

  moderateListing(created.id, created.titleAr, created.descriptionAr).catch(
    (err) => req.log.error({ err, listingId: created.id }, "Moderation failed"),
  );

  if (!created.titleEn || !created.descriptionEn) {
    autoTranslateListing(created.id).catch((err) =>
      req.log.error({ err, listingId: created.id }, "Auto-translation failed"),
    );
  }

  res.status(201).json({ data: created });
});

// ─── POST /listings/:id/save ──────────────────────────────────────────────────
router.post("/listings/:id/save", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const listingId = String(req.params.id);

  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  await db
    .insert(savedListingsTable)
    .values({ userId: req.user.id, listingId })
    .onConflictDoNothing();

  res.status(201).json({ data: { saved: true } });
});

// ─── DELETE /listings/:id/save ────────────────────────────────────────────────
router.delete("/listings/:id/save", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  await db
    .delete(savedListingsTable)
    .where(
      and(
        eq(savedListingsTable.userId, req.user.id),
        eq(savedListingsTable.listingId, String(req.params.id)),
      ),
    );
  res.json({ data: { saved: false } });
});

// ─── PATCH /listings/:id — edit own listing ───────────────────────────────────
router.patch("/listings/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, String(req.params.id)))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listing.userId !== req.user.id) {
    res.status(403).json({ error: "You can only edit your own listings" });
    return;
  }

  const body = req.body as {
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    priceCents?: number | null;
    currency?: string;
    isFree?: boolean;
    isNegotiable?: boolean;
    city?: string;
    district?: string | null;
    categoryId?: string;
    imageObjectPaths?: string[];
  };

  // Build update payload — only include provided fields
  const updates: Partial<typeof listingsTable.$inferInsert> = {
    status: "PENDING_REVIEW",
    publishedAt: sql`NULL` as unknown as Date,
  };
  if (body.titleAr !== undefined) updates.titleAr = body.titleAr;
  if (body.titleEn !== undefined) updates.titleEn = body.titleEn;
  if (body.descriptionAr !== undefined)
    updates.descriptionAr = body.descriptionAr;
  if (body.descriptionEn !== undefined)
    updates.descriptionEn = body.descriptionEn;
  if (body.priceCents !== undefined) updates.priceCents = body.priceCents;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.isFree !== undefined) updates.isFree = body.isFree;
  if (body.isNegotiable !== undefined) updates.isNegotiable = body.isNegotiable;
  if (body.city !== undefined) updates.city = body.city;
  if (body.district !== undefined) updates.district = body.district;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;

  // Handle image replacement if imageObjectPaths is explicitly provided
  if (Array.isArray(body.imageObjectPaths)) {
    const maxImages = await getSetting<number>("listings.max_images", 5);
    if (body.imageObjectPaths.length > maxImages) {
      res.status(400).json({ error: `At most ${maxImages} images allowed` });
      return;
    }

    const normalizedPaths: string[] = [];
    for (const rawPath of body.imageObjectPaths) {
      try {
        const normalized =
          await objectStorageService.trySetObjectEntityAclPolicy(rawPath);
        normalizedPaths.push(normalized);
      } catch (err) {
        req.log.warn({ err, rawPath }, "Failed to set ACL on listing image during edit");
      }
    }

    // Replace images
    await db
      .delete(listingImagesTable)
      .where(eq(listingImagesTable.listingId, listing.id));

    if (normalizedPaths.length > 0) {
      await db.insert(listingImagesTable).values(
        normalizedPaths.map((path, idx) => ({
          listingId: listing.id,
          objectPath: path,
          sortOrder: idx,
          isPrimary: idx === 0,
        })),
      );
      updates.primaryImageUrl = normalizedPaths[0];
    } else {
      updates.primaryImageUrl = null;
    }
  }

  const [updated] = await db
    .update(listingsTable)
    .set(updates)
    .where(eq(listingsTable.id, listing.id))
    .returning();

  // Re-run moderation and translation on the updated content
  moderateListing(
    listing.id,
    updated.titleAr,
    updated.descriptionAr,
  ).catch((err) =>
    req.log.error({ err, listingId: listing.id }, "Re-moderation after edit failed"),
  );

  if (!updated.titleEn || !updated.descriptionEn) {
    autoTranslateListing(listing.id).catch((err) =>
      req.log.error(
        { err, listingId: listing.id },
        "Re-translation after edit failed",
      ),
    );
  }

  res.json({ data: updated });
});

export default router;
