import { Router, type IRouter, type Request, type Response } from "express";
import { db, messagesTable, listingsTable } from "@workspace/db";
import { and, or, eq, asc, sql } from "drizzle-orm";
import { getSetting } from "../lib/settings";
import { appEvents, EVENT_NEW_MESSAGE, emitNewMessage } from "../lib/events";

const router: IRouter = Router();

// ─── POST /messages — send a message ─────────────────────────────────────────
router.post("/messages", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const enabled = await getSetting<boolean>("messaging.enabled", true);
  if (!enabled) {
    res
      .status(403)
      .json({ error: "Messaging is currently disabled by the administrator." });
    return;
  }

  const { listingId, toUserId, body } = req.body as {
    listingId?: string;
    toUserId?: string;
    body?: string;
  };

  if (!listingId || !toUserId || !body?.trim()) {
    res
      .status(400)
      .json({ error: "listingId, toUserId, and body are required" });
    return;
  }

  if (req.user.id === toUserId) {
    res.status(400).json({ error: "Cannot send a message to yourself" });
    return;
  }

  const [listing] = await db
    .select({ id: listingsTable.id, userId: listingsTable.userId })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  // Only the listing owner and interested buyers can participate
  const participants = new Set([listing.userId, req.user.id]);
  if (!participants.has(toUserId)) {
    res.status(403).json({ error: "You can only message the listing owner" });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      listingId,
      fromUserId: req.user.id,
      toUserId,
      body: body.trim(),
    })
    .returning();

  // Notify recipient via SSE
  emitNewMessage(toUserId);

  res.status(201).json({ data: message });
});

// ─── GET /messages/events — SSE stream for real-time new-message events ───────
// Clients keep this connection open; the server pushes a "ping" every 30 s to
// keep the connection alive and a "message" event when a new message arrives.
router.get("/messages/events", (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event: string, data: string) => {
    res.write(`event: ${event}\ndata: ${data}\n\n`);
  };

  send("connected", JSON.stringify({ ok: true }));

  // Periodic heartbeat so the connection is not dropped by proxies
  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 30_000);

  const onMessage = (recipientId: string) => {
    if (recipientId === userId) {
      send("new_message", JSON.stringify({ ts: Date.now() }));
    }
  };

  appEvents.on(EVENT_NEW_MESSAGE, onMessage);

  req.on("close", () => {
    clearInterval(heartbeat);
    appEvents.off(EVENT_NEW_MESSAGE, onMessage);
  });
});

// ─── GET /messages/inbox — my conversations (latest msg per thread) ───────────
router.get("/messages/inbox", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userId = req.user.id;

  const rows = await db.execute(sql`
    SELECT DISTINCT ON (
      m.listing_id,
      LEAST(m.from_user_id, m.to_user_id),
      GREATEST(m.from_user_id, m.to_user_id)
    )
      m.id,
      m.listing_id,
      m.from_user_id,
      m.to_user_id,
      m.body,
      m.read_at,
      m.created_at,
      l.title_ar,
      l.title_en,
      l.slug        AS listing_slug,
      l.primary_image_url,
      (
        SELECT COUNT(*)::int
        FROM messages unread
        WHERE unread.to_user_id = ${userId}
          AND unread.listing_id = m.listing_id
          AND (
            unread.from_user_id = m.from_user_id
            OR unread.from_user_id = m.to_user_id
          )
          AND unread.read_at IS NULL
      ) AS unread_count,
      CASE WHEN m.from_user_id = ${userId} THEN m.to_user_id ELSE m.from_user_id END
        AS partner_id
    FROM messages m
    JOIN listings l ON l.id = m.listing_id
    WHERE m.from_user_id = ${userId} OR m.to_user_id = ${userId}
    ORDER BY
      m.listing_id,
      LEAST(m.from_user_id, m.to_user_id),
      GREATEST(m.from_user_id, m.to_user_id),
      m.created_at DESC
  `);

  res.json({ data: rows.rows });
});

// ─── GET /messages/listing/:listingId — full thread ───────────────────────────
router.get(
  "/messages/listing/:listingId",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const listingId = String(req.params.listingId);
    const userId = req.user.id;
    const partnerId =
      typeof req.query.withUserId === "string" ? req.query.withUserId : null;

    const condition = partnerId
      ? and(
          eq(messagesTable.listingId, listingId),
          or(
            and(
              eq(messagesTable.fromUserId, userId),
              eq(messagesTable.toUserId, partnerId),
            ),
            and(
              eq(messagesTable.fromUserId, partnerId),
              eq(messagesTable.toUserId, userId),
            ),
          ),
        )
      : and(
          eq(messagesTable.listingId, listingId),
          or(
            eq(messagesTable.fromUserId, userId),
            eq(messagesTable.toUserId, userId),
          ),
        );

    const rows = await db
      .select()
      .from(messagesTable)
      .where(condition)
      .orderBy(asc(messagesTable.createdAt));

    // Mark incoming messages as read (fire-and-forget)
    db.update(messagesTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messagesTable.listingId, listingId),
          eq(messagesTable.toUserId, userId),
          sql`${messagesTable.readAt} IS NULL`,
        ),
      )
      .catch(() => {});

    res.json({ data: rows });
  },
);

// ─── PATCH /messages/:id/read ─────────────────────────────────────────────────
router.patch("/messages/:id/read", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const [msg] = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.id, String(req.params.id)))
    .limit(1);

  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  if (msg.toUserId !== req.user.id) {
    res
      .status(403)
      .json({ error: "Cannot mark another user's message as read" });
    return;
  }

  await db
    .update(messagesTable)
    .set({ readAt: new Date() })
    .where(eq(messagesTable.id, String(req.params.id)));

  res.json({ data: { ok: true } });
});

export default router;
