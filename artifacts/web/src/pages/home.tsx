import { useI18n, formatCurrency, formatDate } from "@/lib/i18n";
import { useListNews, useListListings, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t, locale, dir } = useI18n();

  const { data: newsData, isLoading: isLoadingNews } = useListNews({ limit: 4 });
  const { data: listingsData, isLoading: isLoadingListings } = useListListings({ limit: 6 });
  const { data: categoriesData } = useListCategories();

  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <Helmet>
        <title>LivingSyria - {t("home.hero.title")}</title>
        <meta name="description" content={t("home.hero.subtitle")} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-damascus.png" 
            alt="Damascus architectural scene" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 text-primary rounded-full mb-6">
            <span className="px-4 py-1 text-sm font-semibold uppercase tracking-wider">
              {locale === "ar" ? "الإصدار التجريبي" : "Beta Version"}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-foreground max-w-4xl mx-auto leading-tight mb-6">
            {t("home.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-10">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
              <Link href="/news">{t("nav.news")}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-2 border-primary/20 hover:border-primary/40 bg-background hover:bg-secondary">
              <Link href="/listings">{t("nav.listings")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* News Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground relative inline-block">
              {t("home.latest_news")}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h2>
            <Link href="/news" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 group">
              {locale === "ar" ? "عرض الكل" : "View All"}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingNews ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))
            ) : newsData?.data.map((article) => {
              const title = locale === "ar" ? article.titleAr : (article.titleEn || article.titleAr);
              const summary = locale === "ar" ? article.aiSummaryAr : (article.aiSummaryEn || article.aiSummaryAr);
              
              return (
                <Link key={article.id} href={`/news/${article.slug}`} className="group block h-full">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/30 bg-card">
                    {article.coverImageUrl && (
                      <div className="h-48 w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img 
                          src={article.coverImageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-secondary/50 text-xs font-normal">
                          {article.sourceName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(article.publishedAt, locale)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors font-serif leading-snug">
                        {title}
                      </h3>
                      {summary && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground relative inline-block">
              {t("home.recent_listings")}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-accent rounded-full"></span>
            </h2>
            <Link href="/listings" className="text-accent hover:text-accent/80 font-medium flex items-center gap-2 group">
              {locale === "ar" ? "تصفح السوق" : "Browse Market"}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingListings ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4 mt-4" />
                  </div>
                </div>
              ))
            ) : listingsData?.data.map((listing) => {
              const title = locale === "ar" ? listing.titleAr : (listing.titleEn || listing.titleAr);
              const price = listing.isFree 
                ? t("listings.free") 
                : listing.priceCents 
                  ? formatCurrency(listing.priceCents, listing.currency, locale) 
                  : (locale === "ar" ? "تواصل لمعرفة السعر" : "Contact for price");

              return (
                <Link key={listing.id} href={`/listings/${listing.slug}`} className="group block">
                  <Card className="h-full flex overflow-hidden hover:shadow-md transition-all border-border/50 bg-card">
                    {listing.primaryImageUrl ? (
                      <div className="w-1/3 h-full min-h-[120px] bg-secondary flex-shrink-0 relative overflow-hidden">
                        <img 
                          src={`/api${listing.primaryImageUrl}`} 
                          alt={title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-1/3 h-full min-h-[120px] bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground opacity-50">No image</span>
                      </div>
                    )}
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-accent transition-colors">
                          {title}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <span className="truncate">{listing.city}</span>
                          {listing.district && <span className="truncate text-muted-foreground/60">• {listing.district}</span>}
                        </div>
                      </div>
                      <div className="font-semibold text-accent font-serif mt-2">
                        {price}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
