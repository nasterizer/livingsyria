import { cookies } from "next/headers";
import type { AuthUser } from "@workspace/api-client-react";

function getApiBase(): string {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}`;
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(`${getApiBase()}/api/auth/user`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { user: AuthUser | null };
    return json.user ?? null;
  } catch {
    return null;
  }
}
