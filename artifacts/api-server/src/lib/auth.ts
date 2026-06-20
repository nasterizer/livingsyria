import { type Request } from "express";

export interface AuthUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

/** Split a Better Auth single `name` field into firstName / lastName. */
export function splitName(name: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!name) return { firstName: null, lastName: null };
  const idx = name.indexOf(" ");
  if (idx === -1) return { firstName: name, lastName: null };
  return { firstName: name.slice(0, idx), lastName: name.slice(idx + 1) };
}

/** Reads the session token from the Authorization header or the session cookie. */
export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Better Auth cookie name
  return req.cookies?.["better-auth.session_token"];
}
