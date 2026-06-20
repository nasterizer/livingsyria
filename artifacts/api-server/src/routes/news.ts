import { Router, type IRouter, type Request, type Response } from "express";
import { db, newsArticlesTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ListNewsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news/sources", async (_req: Request, res: Response) => {
  const rows = await db
    .selectDistinct({ sourceName: newsArticlesTable.sourceName })
    .from(newsArticlesTable)
    .where(eq(newsArticlesTable.status, "PUBLISHED"))
    .orderBy(newsArticlesTable.sourceName);

  res.json({ data: rows.map((r) => r.sourceName) });
});

router.get("/news", async (req: Request, res: Response) => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { tag, search, source, page = 1, limit = 12 } = parsed.data;

  const conditions = [eq(newsArticlesTable.status, "PUBLISHED")];
  if (tag) {
    conditions.push(sql`${newsArticlesTable.tags} ? ${tag}`);
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(newsArticlesTable.titleAr, pattern),
        ilike(newsArticlesTable.titleEn, pattern),
      )!,
    );
  }
  if (source) {
    conditions.push(eq(newsArticlesTable.sourceName, source));
  }
  const where = and(...conditions);

  const offset = (page - 1) * limit;
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(newsArticlesTable)
      .where(where)
      .orderBy(desc(newsArticlesTable.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsArticlesTable)
      .where(where),
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

router.get("/news/:slug", async (req: Request, res: Response) => {
  const [row] = await db
    .select()
    .from(newsArticlesTable)
    .where(eq(newsArticlesTable.slug, String(req.params.slug)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  db.update(newsArticlesTable)
    .set({ viewCount: sql`${newsArticlesTable.viewCount} + 1` })
    .where(eq(newsArticlesTable.id, row.id))
    .catch(() => {});
  res.json({ data: row });
});

export default router;
