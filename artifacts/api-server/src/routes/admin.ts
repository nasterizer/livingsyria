import { Router, type IRouter, type Request, type Response } from "express";
import { ingestFeeds } from "../lib/newsIngestion";

const router: IRouter = Router();

function getAdminUserIds(): Set<string> {
  const ids = new Set<string>();
  const ownerId = process.env.REPL_OWNER_ID;
  if (ownerId) ids.add(ownerId);
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

router.post("/admin/news/ingest", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!isAdmin(req.user.id)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  ingestFeeds().catch((err) => {
    req.log.error({ err }, "News ingestion failed");
  });
  res.json({ data: { started: true, count: 0 } });
});

export default router;
