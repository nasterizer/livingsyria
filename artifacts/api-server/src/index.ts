import app from "./app";
import { logger } from "./lib/logger";
import { ensureDefaults, getSetting } from "./lib/settings";
import { startJobWorkers, scheduleNewsIngestion } from "./lib/jobQueue";

// ─── Startup environment validation ──────────────────────────────────────────
const REQUIRED_ENV: string[] = ["DATABASE_URL", "PORT"];
const PRODUCTION_ENV: string[] = ["BETTER_AUTH_SECRET"];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
    `Set them before starting the server.`,
  );
}

if (process.env.NODE_ENV === "production") {
  const missingProd = PRODUCTION_ENV.filter((k) => !process.env[k]);
  if (missingProd.length > 0) {
    throw new Error(
      `Missing production-required environment variable(s): ${missingProd.join(", ")}.`,
    );
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Seed platform settings defaults, start pg-boss workers, then register the
  // news ingestion cron schedule derived from the DB setting.
  ensureDefaults()
    .then(async () => {
      await startJobWorkers();
      const intervalMinutes = await getSetting<number>(
        "news.cron_interval_minutes",
        60,
      );
      await scheduleNewsIngestion(intervalMinutes);
    })
    .catch((e) =>
      logger.error({ err: e }, "Failed to initialise job queue or settings"),
    );
});
