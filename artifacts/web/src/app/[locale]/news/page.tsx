import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsListClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "الأخبار — News",
  description:
    "مختارات من أهم الأخبار المحلية، ملخصة بالذكاء الاصطناعي. A curated feed of the most important Syria news, summarized by AI.",
};

export default function NewsPage() {
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
      <NewsListClient />
    </Suspense>
  );
}
