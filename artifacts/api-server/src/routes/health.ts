import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

/**
 * GET /healthz — deep health check.
 * Returns 200 OK when all subsystems are reachable, 503 when degraded.
 * Exempt from rate limiting (registered before limiters in app.ts).
 */
router.get("/healthz", async (_req: Request, res: Response) => {
  const checks: Record<string, "ok" | "error"> = {};

  // PostgreSQL connectivity
  try {
    await pool.query("SELECT 1");
    checks.db = "ok";
  } catch {
    checks.db = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    checks,
  });
});

export default router;
