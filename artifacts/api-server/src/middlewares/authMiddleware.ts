import { fromNodeHeaders } from "better-auth/node";
import { type Request, type Response, type NextFunction } from "express";
import { pool } from "@workspace/db";
import { auth } from "../lib/betterAuth";
import { splitName, type AuthUser } from "../lib/auth";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  // ── 1. Cookie-based auth (web clients via Better Auth) ─────────────────────
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user?.id) {
      const { firstName, lastName } = splitName(session.user.name);
      req.user = {
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.emailVerified ?? false,
        firstName,
        lastName,
        profileImageUrl: session.user.image ?? null,
      };
    }
  } catch {
    // invalid or expired session — continue
  }

  // ── 2. Bearer token auth (mobile clients) ──────────────────────────────────
  // BA stores the raw session token in the `session` table. We look it up
  // directly, bypassing BA's signed-cookie mechanism that doesn't apply here.
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const result = await pool.query<{
            id: string;
            name: string;
            email: string;
            image: string | null;
            email_verified: boolean | null;
          }>(
            `SELECT u.id, u.name, u.email, u.image, u.email_verified
             FROM session s
             JOIN "user" u ON u.id = s.user_id
             WHERE s.token = $1 AND s.expires_at > NOW()
             LIMIT 1`,
            [token],
          );
          if (result.rows[0]) {
            const row = result.rows[0];
            const { firstName, lastName } = splitName(row.name);
            req.user = {
              id: row.id,
              email: row.email,
              emailVerified: row.email_verified ?? false,
              firstName,
              lastName,
              profileImageUrl: row.image ?? null,
            };
          }
        } catch {
          // DB error — continue as unauthenticated
        }
      }
    }
  }

  next();
}
