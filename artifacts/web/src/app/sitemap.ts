import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import { getAppUrl } from "@/lib/seo";

type ListingSlug = { slug: string; updatedAt?: string; createdAt?: string };
type NewsSlug = { slug: string; publishedAt?: string };
type PageMeta = { page: number; limit: number; pages: number };

const LOCALES = ["ar", "en"] as const;
const PAGE_LIMIT = 50;
const STATIC_PAGES = ["", "/listings", "/news"] as const;

export const revalidate = 3600;

async function fetchAllListings(): Promise<ListingSlug[]> {
  const items: ListingSlug[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await apiFetch<{ data: ListingSlug[]; meta: PageMeta }>(
      `/api/listings?page=${page}&limit=${PAGE_LIMIT}`,
      { next: { revalidate: 3600 } },
    );
    items.push(...(res.data ?? []));
    totalPages = res.meta?.pages ?? 1;
    page++;
  } while (page <= totalPages);
  return items;
}

async function fetchAllNews(): Promise<NewsSlug[]> {
  const items: NewsSlug[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await apiFetch<{ data: NewsSlug[]; meta: PageMeta }>(
      `/api/news?page=${page}&limit=${PAGE_LIMIT}`,
      { next: { revalidate: 3600 } },
    );
    items.push(...(res.data ?? []));
    totalPages = res.meta?.pages ?? 1;
    page++;
  } while (page <= totalPages);
  return items;
}

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

  // Active listings (paginated)
  try {
    const listings = await fetchAllListings();
    for (const listing of listings) {
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
  } catch (err) {
    console.error("[sitemap] failed to fetch listings:", err);
  }

  // Published news articles (paginated)
  try {
    const articles = await fetchAllNews();
    for (const article of articles) {
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
  } catch (err) {
    console.error("[sitemap] failed to fetch news:", err);
  }

  return entries;
}
