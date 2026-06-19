import app from "./app";
import { logger } from "./lib/logger";
import { ingestFeeds } from "./lib/newsIngestion";
import { ensureDefaults, getSetting } from "./lib/settings";

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

  // Seed platform settings defaults, then start the news ingestion scheduler.
  // Each iteration re-reads the interval from the DB so changes take effect
  // on the next scheduled run without requiring a server restart.
  ensureDefaults()
    .then(() => scheduleNewsIngestion())
    .catch((e) =>
      logger.error({ err: e }, "Failed to initialise platform settings"),
    );
});

async function scheduleNewsIngestion(): Promise<void> {
  // Run once immediately (with a small startup delay)
  await new Promise((r) => setTimeout(r, 5_000));

  await ingestFeeds().catch((e) =>
    logger.error({ err: e }, "Initial news ingestion failed"),
  );

  // Then reschedule indefinitely, re-reading the interval from DB each cycle
  async function loop(): Promise<void> {
    const intervalMinutes = await getSetting<number>(
      "news.cron_interval_minutes",
      60,
    );
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1_000;

    await new Promise((r) => setTimeout(r, intervalMs));

    await ingestFeeds().catch((e) =>
      logger.error({ err: e }, "Scheduled news ingestion failed"),
    );

    void loop();
  }

  void loop();
}
