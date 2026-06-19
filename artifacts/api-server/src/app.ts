import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check — registered before rate limiters so it is always exempt
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ─── Rate limiters ────────────────────────────────────────────────────────────

const RATE_LIMIT_BODY = { error: "Too many requests, please slow down." };

/** General limiter: 100 requests / minute / IP for all API routes */
const generalLimiter = rateLimit({
  windowMs: 60 * 1_000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_BODY,
});

/** Tight limiter: 20 requests / minute / IP for expensive write routes */
const writeLimiter = rateLimit({
  windowMs: 60 * 1_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_BODY,
});

// Tight limiter applied first so it fires before the general one on write paths
app.post("/api/listings", writeLimiter);
app.post("/api/storage/uploads/request-url", writeLimiter);

// General limiter covers all /api routes
app.use("/api", generalLimiter);

// ─── Main API router ──────────────────────────────────────────────────────────
app.use("/api", authMiddleware, router);

export default app;
