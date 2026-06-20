import { cookies } from "next/headers";
import type { AuthUser } from "@workspace/api-client-react";

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(`${getApiBase()}/api/me`, {
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
