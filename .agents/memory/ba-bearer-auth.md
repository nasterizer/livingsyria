---
name: BA bearer auth
description: Better Auth bearer plugin doesn't work for programmatic auth.api.getSession calls — use direct DB session lookup instead.
---

## Rule
Do NOT rely on the `bearer` plugin from `better-auth/plugins` for mobile bearer token authentication when calling `auth.api.getSession` programmatically from Express middleware.

**Why:** The bearer plugin's before-hook rewrites the Authorization header into a signed cookie and verifies an HMAC. When `auth.api.getSession` is called programmatically (not via an HTTP route through BA's own router), the plugin hooks appear not to fire reliably, so the session is never found. The plugin IS installed in betterAuth.ts for completeness but is not the operative mechanism.

**How to apply:** In `authMiddleware.ts`, after trying cookie-based auth (path 1), fall through to path 2: extract `Authorization: Bearer <token>` and query the `session` table directly:

```sql
SELECT u.id, u.name, u.email, u.image
FROM session s
JOIN "user" u ON u.id = s.user_id
WHERE s.token = $1 AND s.expires_at > NOW()
LIMIT 1
```

The raw session token returned by BA's `/api/auth/sign-in/email` response body (`token` field) is the value stored in `session.token`. No HMAC, no signing — raw string lookup.
