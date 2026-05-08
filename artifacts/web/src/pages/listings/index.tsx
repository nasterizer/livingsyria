import { useI18n, formatDate, formatCurrency } from "@/lib/i18n";
import { useListListings, useListCategories } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";
import { useState } from "react";

export default function ListingsList() {
  const { t, locale } = useI18n();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const categorySlug = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const q = searchParams.get("q") || undefined;

  const [searchQuery, setSearchQuery] = useState(q || "");

  const { data: categories } = useListCategories();
  const { data, isLoading } = useListListings({ 
    page, 
    limit: 12, 
    category: categorySlug,
    city,
    q: q || undefined
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchString);
    if (searchQuery) params.set("q", searchQuery);
    else params.delete("q");
    params.set("page", "1");
    // We would use setLocation here but since we don't have it easily accessible,
    // we'll just use a Link approach or window.location for simplicity in this minimal implementation
    window.location.search = params.toString();
  };

  return (
    <>
      <Helmet>
        <title>{t("nav.listings")} - LivingSyria</title>
        <meta name="description" content="Browse local classifieds in Syria" />
      </Helmet>

      <div className="bg-card border-b border-border/40 py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-6">{t("nav.listings")}</h1>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t("common.search")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-background"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
              {t("common.search")}
            </Button>
          </form>

          {categories && categories.data && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Button 
                variant={!categorySlug ? "default" : "outline"} 
                size="sm" 
                asChild 
                className={!categorySlug ? "bg-accent hover:bg-accent/90" : ""}
              >
                <Link href={`/listings${city ? `?city=${city}` : ''}`}>
                  {locale === "ar" ? "الكل" : "All"}
                </Link>
              </Button>
              {categories.data.map(cat => (
                <Button 
                  key={cat.id}
                  variant={categorySlug === cat.slug ? "default" : "outline"} 
                  size="sm" 
                  asChild
                  className={categorySlug === cat.slug ? "bg-accent hover:bg-accent/90" : ""}
                >
                  <Link href={`/listings?category=${cat.slug}${city ? `&city=${city}` : ''}`}>
                    {locale === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))
          ) : data?.data.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-card rounded-xl border border-dashed border-border">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {locale === "ar" ? "لا توجد نتائج" : "No results found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {locale === "ar" 
                  ? "لم نتمكن من العثور على إعلانات تطابق بحثك. جرب كلمات مختلفة أو أزل بعض الفلاتر." 
                  : "We couldn't find any listings matching your search. Try different keywords or remove filters."}
              </p>
              <Button asChild variant="outline">
                <Link href="/listings">
                  {locale === "ar" ? "مسح البحث" : "Clear Search"}
                </Link>
              </Button>
            </div>
          ) : (
            data?.data.map((listing) => {
              const title = locale === "ar" ? listing.titleAr : (listing.titleEn || listing.titleAr);
              const price = listing.isFree 
                ? t("listings.free") 
                : listing.priceCents 
                  ? formatCurrency(listing.priceCents, listing.currency, locale) 
                  : (locale === "ar" ? "تواصل لمعرفة السعر" : "Contact for price");

              return (
                <Link key={listing.id} href={`/listings/${listing.slug}`} className="group flex flex-col">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 hover:border-accent/30 flex flex-col bg-card">
                    {listing.primaryImageUrl ? (
                      <div className="h-48 w-full overflow-hidden relative flex-shrink-0 bg-secondary">
                        <img 
                          src={`/api${listing.primaryImageUrl}`} 
                          alt={title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-muted-foreground/50 font-serif">LivingSyria</span>
                      </div>
                    )}
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{listing.city}</span>
                        {listing.district && <span className="truncate">• {listing.district}</span>}
                      </div>
                      
                      <h2 className="font-bold text-lg mb-4 line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                        {title}
                      </h2>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                        <div className="font-serif font-bold text-lg text-accent">
                          {price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(listing.createdAt, locale)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {data && data.meta.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <Button 
              variant="outline" 
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/listings?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}${q ? `&q=${q}` : ''}`}>
                  {locale === "ar" ? "السابق" : "Previous"}
                </Link>
              ) : (
                <span>{locale === "ar" ? "السابق" : "Previous"}</span>
              )}
            </Button>
            
            <span className="text-sm font-medium">
              {locale === "ar" ? `صفحة ${page} من ${data.meta.pages}` : `Page ${page} of ${data.meta.pages}`}
            </span>
            
            <Button 
              variant="outline" 
              disabled={page >= data.meta.pages}
              asChild={page < data.meta.pages}
            >
              {page < data.meta.pages ? (
                <Link href={`/listings?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}${q ? `&q=${q}` : ''}`}>
                  {locale === "ar" ? "التالي" : "Next"}
                </Link>
              ) : (
                <span>{locale === "ar" ? "التالي" : "Next"}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
