import { PgBoss } from "pg-boss";
import { ingestFeeds } from "./newsIngestion";
import { logger } from "./logger";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for pg-boss job queue");
}

// Singleton pg-boss instance shared across the process.
// pg-boss uses PostgreSQL advisory locking so only one replica runs each job.
export const boss = new PgBoss({ connectionString: DATABASE_URL });

boss.on("error", (err: Error) => logger.error({ err }, "pg-boss error"));

export const JOB_NEWS_INGEST = "news-ingest";

let _started = false;

/**
 * Register all job workers and start the pg-boss queue.
 * Idempotent — safe to call multiple times (only starts once).
 */
export async function startJobWorkers(): Promise<void> {
  if (_started) return;
  _started = true;

  await boss.start();

  // pg-boss v12 requires the queue to exist before work() or schedule()
  await boss.createQueue(JOB_NEWS_INGEST, {
    retryLimit: 3,
    retryDelay: 120,
    retryBackoff: false,
  });

  await boss.work(JOB_NEWS_INGEST, async (jobs) => {
    const jobId = Array.isArray(jobs) ? jobs[0]?.id : (jobs as { id?: string }).id;
    logger.info({ jobId }, "pg-boss: starting news ingestion");
    await ingestFeeds();
    logger.info({ jobId }, "pg-boss: news ingestion complete");
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
  if (!_started) {
    logger.warn("scheduleNewsIngestion called before startJobWorkers; skipping");
    return;
  }
  const cron = minutesToCron(intervalMinutes);
  await boss.schedule(JOB_NEWS_INGEST, cron, {});
  logger.info({ intervalMinutes, cron }, "News ingestion schedule updated");
}

/**
 * Convert an interval in minutes to a standard cron expression.
 *   1–59  minutes → "*\/N * * * *"
 *   ≥ 60  minutes → "0 *\/H * * *" (rounded to nearest hour)
 */
function minutesToCron(intervalMinutes: number): string {
  const mins = Math.max(1, Math.round(intervalMinutes));
  if (mins < 60) return `*/${mins} * * * *`;
  const hours = Math.max(1, Math.round(mins / 60));
  return `0 */${hours} * * *`;
}
