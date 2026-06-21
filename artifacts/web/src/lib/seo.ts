/**
 * Returns the canonical origin for the app (no trailing slash).
 * Priority: NEXT_PUBLIC_APP_URL → REPLIT_DEV_DOMAIN → hardcoded fallback.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "https://livingsyria.com";
}
