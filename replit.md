# LivingSyria

Bilingual (Arabic-first RTL / English LTR) Syria platform — news, classifieds, and community features for Syrians at home and abroad.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/web run dev` — run the Next.js web app
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: Next.js 14 App Router (Arabic-first, locale in URL `/ar/…` / `/en/…`)
- Mobile: Expo (React Native)
- API: Express 5 (ESM, esbuild bundle)
- DB: PostgreSQL + Drizzle ORM
- AI: Gemini 2.5 Flash via `@workspace/integrations-gemini-ai`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Styling: Tailwind CSS v4, IBM Plex Sans Arabic, emerald + saffron palette
- Rate limiting: `express-rate-limit` (100 req/min general, 20 req/min write routes)

## Where things live

- `artifacts/api-server/src/app.ts` — Express app setup, middleware, rate limiters
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/lib/newsIngestion.ts` — RSS fetch + Gemini summarisation
- `artifacts/web/src/` — Next.js pages, components, i18n
- `lib/db/` — Drizzle schema (source of truth for all DB tables)
- `lib/api-zod/` — Zod schemas and API contracts

## Architecture decisions

- Arabic is the primary language; English is secondary. All DB columns and UI fields are Arabic-first.
- No next-intl — custom `I18nProvider` with inline translations in `src/lib/i18n.tsx`.
- Google Fonts loaded via CSS `@import` in `globals.css` (not `<link>` — causes hook errors).
- React Query v5 `initialData` props cast `as any` to work around `queryKey` requirement.
- Rate-limit counters are in-process (reset on restart); Redis-backed persistence is a known gap.

## Product

- **News**: Bilingual Arabic/English news aggregated from RSS feeds, AI-summarised by Gemini.
- **Classifieds**: Post, browse, and search listings with photo upload, city picker, and SYP/USD toggle.
- **Auth**: User accounts with session-based auth.
- **Admin**: Moderation panel for listings and platform configuration.

## User preferences

- **Admin-configurable everything**: No platform behaviour should be hardcoded. Any value that could need changing — feed URLs, rate limits, AI prompts, feature flags, category lists, moderation thresholds, cron schedules, content limits, and so on — must be stored in the database and editable from the admin panel. Hardcoded values are acceptable only as the *initial seed / default* inserted at migration time; the live value always comes from the database at runtime.
- Design language: Vibrant Bazaar — emerald (`#059669`) + saffron (`#D97706`), warm and welcoming.

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes before testing.
- The web `.next` cache can serve stale vendor chunks after major dependency changes — delete it and restart the workflow if you see unexplained import errors.
- ESM throughout the API server (`"type": "module"`) — no `require()`, use dynamic `import()` where needed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
