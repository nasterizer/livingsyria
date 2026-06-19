import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsListClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { NewsPage } from "@workspace/api-client-react";

export const metadata: Metadata = {
  title: "الأخبار — News",
  description:
    "مختارات من أهم الأخبار المحلية، ملخصة بالذكاء الاصطناعي. A curated feed of the most important Syria news, summarized by AI.",
};

interface Props {
  searchParams: { page?: string; tag?: string };
}

export default async function NewsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const tag = searchParams.tag || undefined;

  const qs = new URLSearchParams({ page: String(page), limit: "12" });
  if (tag) qs.set("tag", tag);

  const initialData = await apiFetch<NewsPage>(`/api/news?${qs}`).catch(() => null);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <NewsListClient initialData={initialData} />
    </Suspense>
  );
}
