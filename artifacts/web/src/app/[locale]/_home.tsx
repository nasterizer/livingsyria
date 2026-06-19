"use client";

import Link from "next/link";
import { useI18n, formatRelative, formatCurrency } from "@/lib/i18n";
import {
  useListNews,
  useListListings,
  useListCategories,
} from "@workspace/api-client-react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Tag,
  Car,
  ShoppingBag,
  Briefcase,
  Wrench,
  Laptop,
  Baby,
  Sofa,
  Home,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  real_estate: { icon: Home, color: "bg-emerald-500" },
  cars: { icon: Car, color: "bg-blue-500" },
  electronics: { icon: Laptop, color: "bg-purple-500" },
  furniture: { icon: Sofa, color: "bg-amber-500" },
  jobs: { icon: Briefcase, color: "bg-rose-500" },
  services: { icon: Wrench, color: "bg-indigo-500" },
  children: { icon: Baby, color: "bg-teal-500" },
  fashion: { icon: ShoppingBag, color: "bg-orange-500" },
};

const FALLBACK_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-xs text-emerald-100/70 leading-tight max-w-[6rem]">{label}</span>
    </div>
  );
}

function EmptyTile({ message }: { message: string }) {
  return (
    <div className="py-16 text-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 text-muted-foreground">
      {message}
    </div>
  );
}

export function HomeClient() {
  const { t, locale, dir, path } = useI18n();
  const isRtl = dir === "rtl";
  const ChevronEnd = isRtl ? ChevronLeft : ChevronRight;

  const { data: newsData, isLoading: isLoadingNews } = useListNews({ limit: 6 });
  const { data: listingsData, isLoading: isLoadingListings } = useListListings({ limit: 8 });
  const { data: categoriesData } = useListCategories();

  const listingsCountLabel = listingsData?.data?.length
    ? `${listingsData.data.length}+`
    : "12,400+";

  return (
    <>
      {/* HERO */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div
            className="rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 min-h-[400px]"
            style={{
              backgroundColor: "hsl(160 84% 9%)",
              boxShadow: "0 25px 50px -12px hsl(160 84% 9% / 0.25)",
            }}
          >
            <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 start-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-50">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium">{t("home.hero.eyebrow")}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                {t("home.hero.title_lead")}
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(to left, hsl(38 92% 65%), hsl(38 92% 50%))",
                  }}
                >
                  {t("home.hero.title_accent")}
                </span>
              </h1>

              <p className="text-emerald-100 text-lg md:text-xl max-w-lg leading-relaxed">
                {t("home.hero.subtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full h-12 px-7 bazaar-accent-gradient hover:opacity-90 text-foreground border-0 shadow-lg shadow-amber-500/30 font-bold"
                >
                  <Link href={path("/listings")}>
                    {t("home.hero.cta_primary")}
                    <ChevronEnd className="h-5 w-5 ms-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 hover:text-white"
                >
                  <Link href={path("/news")}>{t("home.hero.cta_secondary")}</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <HeroStat value={listingsCountLabel} label={t("home.hero.stat_listings")} />
                <HeroStat value="320+" label={t("home.hero.stat_cities")} />
                <HeroStat value="AI" label={t("home.hero.stat_ai")} />
              </div>
            </div>

            <div className="relative z-10 w-full md:w-5/12 h-64 md:h-[350px]">
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/images/hero-vibrant.png"
                  alt="Syria"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, hsl(160 84% 9% / 0.6), transparent)",
                  }}
                />
              </div>
              <div
                className="absolute -start-4 bottom-12 bg-card rounded-2xl p-3 shadow-xl transform -rotate-6 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("home.hero.float_sold")}</div>
                    <div className="font-bold text-foreground">{t("home.hero.float_where")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <section className="mb-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("home.categories")}</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
              {categoriesData.data.map((cat, i) => {
                const name = locale === "ar" ? cat.nameAr : cat.nameEn || cat.nameAr;
                const meta =
                  CATEGORY_ICONS[cat.slug] ||
                  CATEGORY_ICONS[cat.slug.toLowerCase()] || {
                    icon: Tag,
                    color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                  };
                const Icon = meta.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`${path("/listings")}?category=${cat.slug}`}
                    className="snap-start shrink-0 w-32 h-40 rounded-3xl relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div
                      className={`absolute inset-0 ${meta.color} opacity-90 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-white">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="font-bold text-lg text-center line-clamp-2 leading-tight">
                        {name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      <section className="mb-14">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                {t("home.latest_news")}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{t("home.latest_news.subtitle")}</p>
            </div>
            <Button
              asChild
              variant="link"
              className="text-primary font-bold hover:text-primary/80 hidden sm:inline-flex"
            >
              <Link href={path("/news")}>
                {t("common.view_all")}
                <ChevronEnd className="w-4 h-4 ms-1" />
              </Link>
            </Button>
          </div>

          {isLoadingNews ? (
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[300px] sm:w-[380px] space-y-3">
                  <Skeleton className="h-48 w-full rounded-[1.5rem]" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : !newsData?.data || newsData.data.length === 0 ? (
            <EmptyTile message={t("home.empty_news")} />
          ) : (
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4 snap-x">
              {newsData.data.slice(0, 6).map((article) => {
                const articleTitle =
                  locale === "ar" ? article.titleAr : article.titleEn || article.titleAr;
                const summary =
                  locale === "ar"
                    ? article.aiSummaryAr
                    : article.aiSummaryEn || article.aiSummaryAr;
                return (
                  <Link
                    key={article.id}
                    href={path(`/news/${article.slug}`)}
                    className="snap-start shrink-0 w-[300px] sm:w-[380px] bg-card rounded-[2rem] p-2 shadow-sm border border-border/60 group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4">
                      <SmartImage
                        src={article.coverImageUrl}
                        alt={articleTitle}
                        seed={article.slug}
                        imgClassName="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 end-3">
                        <Badge className="bg-card/90 text-foreground hover:bg-card border-0 font-bold backdrop-blur-sm">
                          {article.sourceName}
                        </Badge>
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {article.sourceName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelative(article.publishedAt, locale)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {articleTitle}
                      </h3>
                      {summary && (
                        <div
                          className="rounded-xl p-3 flex gap-3 items-start"
                          style={{
                            backgroundColor: "hsl(38 92% 95%)",
                            border: "1px solid hsl(38 92% 88%)",
                          }}
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black text-amber-700">AI</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-snug line-clamp-3">
                            {summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* LISTINGS */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">{t("home.recent_listings")}</h2>
            <Button
              asChild
              variant="link"
              className="text-primary font-bold hover:text-primary/80 hidden sm:inline-flex"
            >
              <Link href={path("/listings")}>
                {t("common.view_all")}
                <ChevronEnd className="w-4 h-4 ms-1" />
              </Link>
            </Button>
          </div>

          {isLoadingListings ? (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="masonry-item">
                  <Skeleton className="w-full rounded-3xl" style={{ height: 220 + ((i * 47) % 140) }} />
                </div>
              ))}
            </div>
          ) : !listingsData?.data || listingsData.data.length === 0 ? (
            <EmptyTile message={t("home.empty_listings")} />
          ) : (
            <div className="masonry-grid">
              {listingsData.data.slice(0, 8).map((listing, idx) => {
                const listingTitle =
                  locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
                const price = listing.isFree
                  ? t("listings.free")
                  : listing.priceCents
                  ? formatCurrency(listing.priceCents, listing.currency, locale)
                  : t("listings.contact_for_price");
                return (
                  <div key={listing.id} className="masonry-item">
                    <Link href={path(`/listings/${listing.slug}`)} className="block">
                      <div className="bg-card rounded-3xl p-2 shadow-sm border border-border/60 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                        <button
                          type="button"
                          onClick={(e) => e.preventDefault()}
                          aria-label={t("listings.save")}
                          className="absolute top-4 start-4 z-10 w-10 h-10 bg-card/80 backdrop-blur-md rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-card shadow-sm transition-all"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <div className="relative rounded-2xl overflow-hidden" style={{ height: 200 + ((idx * 47) % 120) }}>
                          <SmartImage
                            src={imageUrl(listing.primaryImageUrl)}
                            alt={listingTitle}
                            seed={listing.slug}
                            imgClassName="group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-3 pt-3">
                          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                            {listingTitle}
                          </h3>
                          <div className="font-serif font-bold text-accent mb-1">{price}</div>
                          <div className="text-xs text-muted-foreground">{listing.city}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
