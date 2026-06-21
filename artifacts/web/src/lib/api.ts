export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    next: { revalidate: 30, ...init?.next },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.statusText}: ${path}`);
  }
  return res.json() as Promise<T>;
}
