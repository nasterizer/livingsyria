import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeClient } from "./_home";

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

export default function HomePage() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
