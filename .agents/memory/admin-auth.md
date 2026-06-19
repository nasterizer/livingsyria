---
name: Admin auth pattern
description: How admin access is checked in LivingSyria — server-side only, no API round-trip.
---

The admin page server component checks `REPL_OWNER_ID` and `ADMIN_USER_IDS` env vars directly:

```ts
const user = await getServerUser();
if (!user) redirect(...);

const ownerId = process.env.REPL_OWNER_ID;
const extra = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
const isAdmin = (!!ownerId && user.id === ownerId) || extra.includes(user.id);
if (!isAdmin) redirect(`/${locale}`);
```

The API routes in admin.ts use the same `isAdmin()` helper function that reads the same env vars.

**Why:** Calling `/api/admin/me` from a server component doesn't forward the session cookie automatically (no credentials context), so the check must be done server-side using env vars directly.

**How to apply:** Any new admin-only Next.js server component must replicate this check before rendering. Never rely on the API's admin check from server components.
