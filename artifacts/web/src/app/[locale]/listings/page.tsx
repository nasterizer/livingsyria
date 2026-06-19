import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "السوق — Marketplace",
  description:
    "اكتشف ما يعرضه جيرانك — من الأثاث إلى السيارات والخدمات. Discover what your neighbors are offering across Syria.",
};

export default function ListingsPage() {
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
      <ListingsClient />
    </Suspense>
  );
}
