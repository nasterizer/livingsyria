import { PgBoss } from "pg-boss";
import { ingestFeeds } from "./newsIngestion";
import { logger } from "./logger";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for pg-boss job queue");
}

// Singleton pg-boss instance shared across the process.
// pg-boss uses PostgreSQL advisory locking so only one replica runs each job.
export const boss = new PgBoss(DATABASE_URL);

boss.on("error", (err: Error) => logger.error({ err }, "pg-boss error"));

export const JOB_NEWS_INGEST = "news-ingest";

/**
 * Register all job workers and start the pg-boss queue.
 * Must be called once after the server starts listening.
 */
export async function startJobWorkers(): Promise<void> {
  await boss.start();

  // pg-boss v12 requires the queue to exist before work() or schedule() can reference it.
  await boss.createQueue(JOB_NEWS_INGEST);

  await boss.work(JOB_NEWS_INGEST, async () => {
    await ingestFeeds().catch((err) =>
      logger.error({ err }, "pg-boss: news ingestion failed"),
    );
  });

  logger.info("pg-boss job workers started");
}

/**
 * Set (or update) the recurring news ingestion schedule.
 * boss.schedule() is idempotent — safe to call on every startup and
 * whenever the admin changes the cron_interval_minutes setting.
 */
export async function scheduleNewsIngestion(
  intervalMinutes: number,
): Promise<void> {
  const cron = minutesToCron(intervalMinutes);
  await boss.schedule(JOB_NEWS_INGEST, cron, {});
  logger.info({ intervalMinutes, cron }, "News ingestion schedule updated");
}

/**
 * Convert an interval expressed in minutes into a standard cron expression.
 *   1–59  minutes → "*\/N * * * *"
 *   ≥ 60  minutes → "0 *\/H * * *"  (rounded to nearest hour)
 */
function minutesToCron(intervalMinutes: number): string {
  const mins = Math.max(1, Math.round(intervalMinutes));
  if (mins < 60) return `*/${mins} * * * *`;
  const hours = Math.max(1, Math.round(mins / 60));
  return `0 */${hours} * * *`;
}
