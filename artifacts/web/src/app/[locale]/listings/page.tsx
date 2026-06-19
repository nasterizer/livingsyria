import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { ListingsPage, ListCategories200 } from "@workspace/api-client-react";

export const metadata: Metadata = {
  title: "السوق — Marketplace",
  description:
    "اكتشف ما يعرضه جيرانك — من الأثاث إلى السيارات والخدمات. Discover what your neighbors are offering across Syria.",
};

interface Props {
  searchParams: { page?: string; category?: string; q?: string };
}

export default async function ListingsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const category = searchParams.category || undefined;
  const q = searchParams.q || undefined;

  const listingsQs = new URLSearchParams({ page: String(page), limit: "12" });
  if (category) listingsQs.set("category", category);
  if (q) listingsQs.set("q", q);

  const [listingsResult, categoriesResult] = await Promise.allSettled([
    apiFetch<ListingsPage>(`/api/listings?${listingsQs}`),
    apiFetch<ListCategories200>("/api/categories"),
  ]);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10">
          <div className="masonry-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <Skeleton className="w-full rounded-2xl h-56" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ListingsClient
        initialData={listingsResult.status === "fulfilled" ? listingsResult.value : null}
        initialCategories={
          categoriesResult.status === "fulfilled" ? categoriesResult.value : null
        }
      />
    </Suspense>
  );
}
