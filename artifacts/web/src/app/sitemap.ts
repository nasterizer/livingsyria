import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { getAppUrl } from "@/lib/seo";

type ListingSlug = { slug: string; updatedAt?: string; createdAt?: string };
type NewsSlug = { slug: string; publishedAt?: string };

const LOCALES = ["ar", "en"] as const;

const STATIC_PAGES = [
  "",
  "/listings",
  "/news",
] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for both locales
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${appUrl}/${locale}${page}`,
        changeFrequency: page === "" ? "daily" : "hourly",
        priority: page === "" ? 1.0 : 0.8,
      });
    }
  }

  // Active listings
  try {
    const res = await apiFetch<{ data: ListingSlug[] }>(
      "/api/listings?limit=500&status=active",
      { next: { revalidate: 3600 } },
    );
    for (const listing of res.data ?? []) {
      const lastMod = listing.updatedAt ?? listing.createdAt;
      for (const locale of LOCALES) {
        entries.push({
          url: `${appUrl}/${locale}/listings/${listing.slug}`,
          lastModified: lastMod ? new Date(lastMod) : undefined,
          changeFrequency: "weekly",
          priority: locale === "ar" ? 0.9 : 0.7,
        });
      }
    }
  } catch {
    // Non-fatal: proceed without listing URLs
  }

  // Published news articles
  try {
    const res = await apiFetch<{ data: NewsSlug[] }>(
      "/api/news?limit=200&status=published",
      { next: { revalidate: 3600 } },
    );
    for (const article of res.data ?? []) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${appUrl}/${locale}/news/${article.slug}`,
          lastModified: article.publishedAt
            ? new Date(article.publishedAt)
            : undefined,
          changeFrequency: "monthly",
          priority: locale === "ar" ? 0.8 : 0.6,
        });
      }
    }
  } catch {
    // Non-fatal: proceed without news URLs
  }

  return entries;
}
