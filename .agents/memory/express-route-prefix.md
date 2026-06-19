---
name: Express /api route prefix
description: All Express routes are mounted under /api — curl tests and internal calls must use this prefix.
---

In `artifacts/api-server/src/app.ts`:
```ts
app.use("/api", authMiddleware, router);
```

This means every route handler in `routes/*.ts` is accessible at `/api/<route>`, not `/<route>`.

**Implications:**
- Client-side `fetch("/api/listings")` → Express receives the request at `/api/listings` → matches `/listings` in the listings router ✓
- `curl http://localhost:8080/settings/public` → 404 (missing prefix)
- `curl http://localhost:8080/api/settings/public` → correct ✓
- The authMiddleware applies to ALL /api routes before routing. Routes that must be public (like /api/settings/public) still go through authMiddleware but the handler simply doesn't call `requireAdmin()`.

**How to apply:** When adding new routes, always think in terms of the path _without_ the `/api` prefix in the router file, but _with_ `/api` when testing via curl or constructing full URLs.
