import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  listingsTable,
  listingImagesTable,
  categoriesTable,
} from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  CreateListingBody,
  ListListingsQueryParams,
} from "@workspace/api-zod";
import { makeSlug } from "../lib/slug";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const MAX_LISTING_IMAGES = 5;
const objectStorageService = new ObjectStorageService();

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
    db.select({ count: sql<number>`count(*)::int` }).from(listingsTable).where(where),
  ]);

  const total = totals[0]?.count ?? 0;
  res.json({
    data: rows,
    meta: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

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

  // increment view count (fire-and-forget)
  db.update(listingsTable)
    .set({ viewCount: sql`${listingsTable.viewCount} + 1` })
    .where(eq(listingsTable.id, row.id))
    .catch(() => {});

  res.json({ data: { ...row, images, category } });
});

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
  if (body.imageObjectPaths && body.imageObjectPaths.length > MAX_LISTING_IMAGES) {
    res.status(400).json({ error: `At most ${MAX_LISTING_IMAGES} images allowed` });
    return;
  }
  const slug = makeSlug(body.titleAr);

  const normalizedPaths: string[] = [];
  for (const rawPath of body.imageObjectPaths ?? []) {
    try {
      const normalized = await objectStorageService.trySetObjectEntityAclPolicy(
        rawPath,
        { owner: req.user.id, visibility: "public" },
      );
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
      status: "ACTIVE",
      publishedAt: new Date(),
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

  res.status(201).json({ data: created });
});

export default router;
