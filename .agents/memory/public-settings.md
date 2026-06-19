---
name: Public settings endpoint
description: Unauthenticated endpoint that returns DB-driven config values for client use.
---

`GET /api/settings/public` is declared in `artifacts/api-server/src/routes/admin.ts` (before the admin auth middleware applies to individual admin routes). It returns:

```json
{ "data": { "cities": [{"ar": "دمشق", "en": "Damascus"}, ...], "maxImages": 5 } }
```

Used by:
- `artifacts/web/src/app/[locale]/listings/new/_form.tsx` — on mount to load city combobox and photo limit from DB
- `artifacts/web/src/app/[locale]/listings/[slug]/edit/_edit-form.tsx` — same

**Why:** All configurable values must live in DB (standing requirement). The form falls back to hardcoded Syrian cities list if the fetch fails.

**How to apply:** Any new form that shows city selection or photo limits must fetch from this endpoint, not use constants.
