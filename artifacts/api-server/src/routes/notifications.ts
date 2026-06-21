import { Router, type IRouter, type Request, type Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── GET /notifications — current user's notifications ────────────────────────
router.get("/notifications", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userId = req.user.id;

  const [rows, unreadResult] = await Promise.all([
    db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(30),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, userId),
          isNull(notificationsTable.readAt),
        ),
      ),
  ]);

  res.json({
    data: rows,
    meta: { unreadCount: unreadResult[0]?.count ?? 0 },
  });
});

// ─── PATCH /notifications/read-all — mark all as read ────────────────────────
router.patch(
  "/notifications/read-all",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.userId, req.user.id),
          isNull(notificationsTable.readAt),
        ),
      );

    res.json({ data: { ok: true } });
  },
);

// ─── PATCH /notifications/:id/read — mark one as read ────────────────────────
router.patch(
  "/notifications/:id/read",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const [notif] = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, String(req.params.id)))
      .limit(1);

    if (!notif) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    if (notif.userId !== req.user.id) {
      res
        .status(403)
        .json({ error: "Cannot mark another user's notification as read" });
      return;
    }

    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(eq(notificationsTable.id, String(req.params.id)));

    res.json({ data: { ok: true } });
  },
);

export default router;
