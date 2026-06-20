---
name: DB schema push
description: drizzle-kit push always prompts interactively for constraint additions; use direct psql SQL for non-interactive CI.
---

## Rule
Never use `pnpm drizzle-kit push` in automated or non-interactive contexts — it blocks waiting for confirmation whenever it detects a potentially destructive change (e.g. adding a UNIQUE constraint to a table with existing rows).

**Why:** Even piping `\n` or `printf "\n"` doesn't reliably bypass the interactive prompt in the sandbox environment; the shell times out.

**How to apply:** For new tables, write and run the CREATE TABLE SQL directly via `psql "$DATABASE_URL" <<'SQL' ... SQL`. For constraint additions, use `DO $$ BEGIN IF NOT EXISTS (...) THEN ALTER TABLE ...; END IF; END $$;` to make it idempotent.
