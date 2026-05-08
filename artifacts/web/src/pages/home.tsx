import { useI18n, formatCurrency, formatRelative } from "@/lib/i18n";
import {
  useListNews,
  useListListings,
  useListCategories,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl, gradientFor, monogramFor } from "@/lib/image";

export default function Home() {
  const { t, locale, dir } = useI18n();
  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const { data: newsData, isLoading: isLoadingNews } = useListNews({ limit: 6 });
  const { data: listingsData, isLoading: isLoadingListings } = useListListings({ limit: 8 });
  const { data: categoriesData } = useListCategories();

  return (
    <>
      <Helmet>
        <title>LivingSyria — {t("home.hero.title")}</title>
        <meta name="description" content={t("home.hero.subtitle")} />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(15 70% 50% / 0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, hsl(190 50% 40% / 0.12), transparent 60%), hsl(40 40% 96%)",
          }}
        />
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />

        <div className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-foreground">
                {t("home.hero.eyebrow")}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-[1.1] text-foreground mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-7 shadow-md hover:shadow-lg transition-shadow">
                <Link href="/listings">
                  {t("home.hero.cta_primary")}
                  <ArrowIcon className="h-4 w-4 ms-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-7 bg-card/60 backdrop-blur"
              >
                <Link href="/news">{t("home.hero.cta_secondary")}</Link>
              </Button>
            </div>
          </div>

          {/* Categories rail */}
          {categoriesData?.data && categoriesData.data.length > 0 && (
            <div className="mt-14">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t("home.categories")}</h2>
                  <p className="text-sm text-muted-foreground">{t("home.categories.subtitle")}</p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
                {categoriesData.data.map((cat) => {
                  const name = locale === "ar" ? cat.nameAr : cat.nameEn || cat.nameAr;
                  const palette = gradientFor(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      href={`/listings?category=${cat.slug}`}
                      className="group shrink-0"
                    >
                      <div
                        className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center text-center px-3 border border-border/60 shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${palette.bg}, ${palette.mid}33)`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-base mb-2"
                          style={{ background: palette.fg, color: "white" }}
                        >
                          {monogramFor(name)}
                        </div>
                        <div className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                          {name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 space-y-20">
        {/* NEWS */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                <TrendingUp className="h-3.5 w-3.5" />
                {t("nav.news")}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {t("home.latest_news")}
              </h2>
            </div>
            <Link
              href="/news"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              {t("common.view_all")}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingNews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : !newsData?.data || newsData.data.length === 0 ? (
            <EmptyTile message={t("home.empty_news")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.data.slice(0, 6).map((article, idx) => {
                const title = locale === "ar" ? article.titleAr : article.titleEn || article.titleAr;
                const summary =
                  locale === "ar" ? article.aiSummaryAr : article.aiSummaryEn || article.aiSummaryAr;
                const featured = idx === 0;
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className={`group block ${featured ? "md:col-span-2 lg:row-span-2" : ""}`}
                  >
                    <article className="h-full bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className={`relative w-full overflow-hidden ${featured ? "aspect-[16/10] lg:aspect-[16/12]" : "aspect-[16/10]"}`}>
                        <SmartImage
                          src={article.coverImageUrl}
                          alt={title}
                          seed={article.slug}
                          imgClassName="group-hover:scale-105"
                        />
                        <div className="absolute top-3 start-3">
                          <Badge className="bg-card/95 backdrop-blur text-foreground border border-border/60 shadow-sm">
                            {article.sourceName}
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-5 ${featured ? "md:p-7" : ""}`}>
                        {summary && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                            <Sparkles className="h-3 w-3" />
                            {t("news.ai_summary.short")}
                          </div>
                        )}
                        <h3
                          className={`font-serif font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-3 ${
                            featured ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2"
                          }`}
                        >
                          {title}
                        </h3>
                        {summary && (
                          <p className={`text-muted-foreground leading-relaxed ${featured ? "line-clamp-4" : "line-clamp-2"}`}>
                            {summary}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-4">
                          {formatRelative(article.publishedAt, locale)}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* LISTINGS */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                {t("nav.listings")}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {t("home.recent_listings")}
              </h2>
            </div>
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all"
            >
              {t("common.view_all")}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingListings ? (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="masonry-item">
                  <Skeleton
                    className="w-full rounded-2xl"
                    style={{ height: 180 + ((i * 47) % 140) }}
                  />
                </div>
              ))}
            </div>
          ) : !listingsData?.data || listingsData.data.length === 0 ? (
            <EmptyTile message={t("home.empty_listings")} />
          ) : (
            <div className="masonry-grid">
              {listingsData.data.slice(0, 8).map((listing, idx) => {
                const title = locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
                const price = listing.isFree
                  ? t("listings.free")
                  : listing.priceCents
                  ? formatCurrency(listing.priceCents, listing.currency, locale)
                  : t("listings.contact_for_price");
                // Vary heights for the masonry feel
                const heights = [200, 280, 240, 320, 220, 260, 300, 240];
                return (
                  <div key={listing.id} className="masonry-item">
                    <Link href={`/listings/${listing.slug}`} className="group block">
                      <div className="relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                        <div
                          className="relative w-full overflow-hidden"
                          style={{ height: heights[idx % heights.length] }}
                        >
                          <SmartImage
                            src={imageUrl(listing.primaryImageUrl)}
                            alt={title}
                            seed={listing.slug}
                            imgClassName="group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-accent transition-colors">
                            {title}
                          </h3>
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-serif font-bold text-accent text-base">{price}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{listing.city}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Button asChild variant="outline" className="w-full rounded-full h-12">
              <Link href="/listings">
                {t("common.view_all")}
                <ArrowIcon className="h-4 w-4 ms-2" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function EmptyTile({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card/50 py-16 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
