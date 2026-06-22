import type { Pool } from "pg";
import type { Store, Options, IncrementResponse } from "express-rate-limit";

/**
 * Module-level init promise — shared across all store instances so that
 * only one CREATE TABLE runs even when multiple limiters start concurrently.
 */
let tableReady: Promise<void> | null = null;

function ensureTable(pool: Pool): Promise<void> {
  if (!tableReady) {
    tableReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS api_rate_limit (
           key        TEXT        PRIMARY KEY,
           count      INTEGER     NOT NULL DEFAULT 0,
           reset_time TIMESTAMPTZ NOT NULL
         )`,
      )
      .then(() => undefined)
      .catch((err: unknown) => {
        // Reset so next call retries — unless it's a concurrent-create race
        // (error code 23505 means another connection already succeeded).
        const code = (err as { code?: string })?.code;
        if (code !== "23505") {
          tableReady = null;
          throw err;
        }
        // Table was created by a concurrent connection — we're fine.
      });
  }
  return tableReady;
}

/**
 * PostgreSQL-backed rate-limit store for express-rate-limit.
 * Counters survive server restarts because they live in the database.
 * Uses the existing pg Pool — no new infrastructure required.
 */
export class PostgresRateLimitStore implements Store {
  private readonly pool: Pool;
  private windowMs: number;

  constructor(pool: Pool, windowMs: number) {
    this.pool = pool;
    this.windowMs = windowMs;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs ?? this.windowMs;
    ensureTable(this.pool).catch((err: unknown) =>
      console.error("[rateLimitStore] failed to create table:", err),
    );
  }

  async increment(key: string): Promise<IncrementResponse> {
    await ensureTable(this.pool);
    const result = await this.pool.query<{ count: number; reset_time: Date }>(
      `INSERT INTO api_rate_limit (key, count, reset_time)
       VALUES ($1, 1, NOW() + ($2 * interval '1 millisecond'))
       ON CONFLICT (key) DO UPDATE SET
         count = CASE
           WHEN api_rate_limit.reset_time > NOW() THEN api_rate_limit.count + 1
           ELSE 1
         END,
         reset_time = CASE
           WHEN api_rate_limit.reset_time > NOW() THEN api_rate_limit.reset_time
           ELSE NOW() + ($2 * interval '1 millisecond')
         END
       RETURNING count, reset_time`,
      [key, this.windowMs],
    );
    const row = result.rows[0]!;
    return { totalHits: row.count, resetTime: row.reset_time };
  }

  async decrement(key: string): Promise<void> {
    await this.pool.query(
      `UPDATE api_rate_limit SET count = GREATEST(0, count - 1) WHERE key = $1`,
      [key],
    );
  }

  async resetKey(key: string): Promise<void> {
    await this.pool.query(`DELETE FROM api_rate_limit WHERE key = $1`, [key]);
  }

  async resetAll(): Promise<void> {
    await this.pool.query(`TRUNCATE api_rate_limit`);
  }
}
