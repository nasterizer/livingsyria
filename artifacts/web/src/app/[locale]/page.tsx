import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeClient } from "./_home";
import { apiFetch } from "@/lib/api";
import type { NewsPage, ListingsPage, ListCategories200 } from "@workspace/api-client-react";

export const metadata: Metadata = {
  title: "LivingSyria — ليفينغ سوريا",
  description:
    "اكتشف أحدث الأخبار، تصفّح الإعلانات المبوّبة، وكن جزءًا من المجتمع السوري المتصل. Discover the latest Syria news and classifieds.",
  openGraph: {
    title: "LivingSyria — ليفينغ سوريا",
    description: "Your daily platform for Syria news, classifieds, and community.",
    images: ["/images/hero-vibrant.png"],
  },
};

export default async function HomePage() {
  const [news, listings, categories] = await Promise.allSettled([
    apiFetch<NewsPage>("/api/news?limit=6"),
    apiFetch<ListingsPage>("/api/listings?limit=8"),
    apiFetch<ListCategories200>("/api/categories"),
  ]);

  return (
    <Suspense>
      <HomeClient
        initialNews={news.status === "fulfilled" ? news.value : undefined}
        initialListings={listings.status === "fulfilled" ? listings.value : undefined}
        initialCategories={categories.status === "fulfilled" ? categories.value : undefined}
      />
    </Suspense>
  );
}
