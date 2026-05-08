import { useI18n, formatCurrency, formatRelative } from "@/lib/i18n";
import { useListListings, useListCategories } from "@workspace/api-client-react";
import { Link, useLocation, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, Bookmark } from "lucide-react";
import { useState, useMemo } from "react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { Badge } from "@/components/ui/badge";

export default function ListingsList() {
  const { t, locale } = useI18n();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const categorySlug = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const q = searchParams.get("q") || undefined;

  const [searchQuery, setSearchQuery] = useState(q || "");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const { data: categories } = useListCategories();
  const { data, isLoading } = useListListings({
    page,
    limit: 24,
    category: categorySlug,
    city,
    q: q || undefined,
  });

  const buildHref = useMemo(
    () =>
      (overrides: Record<string, string | undefined>): string => {
        const params = new URLSearchParams();
        const merged: Record<string, string | undefined> = {
          category: categorySlug,
          city,
          q,
          ...overrides,
        };
        Object.entries(merged).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });
        const qs = params.toString();
        return `/listings${qs ? `?${qs}` : ""}`;
      },
    [categorySlug, city, q],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(buildHref({ q: trimmed || undefined, page: undefined }));
  };

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => ({ ...s, [id]: !s[id] }));
  };

  const heightFor = (idx: number) => {
    const heights = [220, 320, 260, 200, 300, 240, 280, 340, 220, 260];
    return heights[idx % heights.length];
  };

  return (
    <>
      <Helmet>
        <title>{t("nav.listings")} — LivingSyria</title>
        <meta name="description" content={t("listings.subtitle")} />
      </Helmet>

      <section className="relative border-b border-border/60 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 70% 0%, hsl(190 50% 40% / 0.10), transparent 60%), hsl(40 40% 96%)",
          }}
        />
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            {t("nav.listings")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
            {t("listings.subtitle")}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("nav.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 h-12 rounded-full bg-card border-border/60 text-base focus-visible:border-accent/40 focus-visible:ring-accent/20"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm"
            >
              {t("common.search")}
            </Button>
          </form>

          {categories?.data && (
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 -mx-4 px-4">
              <Link href={buildHref({ category: undefined, page: undefined })}>
                <Badge
                  variant={!categorySlug ? "default" : "outline"}
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    !categorySlug
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-card hover:bg-secondary"
                  }`}
                >
                  {t("common.all")}
                </Badge>
              </Link>
              {categories.data.map((cat) => {
                const active = categorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={buildHref({ category: cat.slug, page: undefined })}
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-card hover:bg-secondary"
                      }`}
                    >
                      {locale === "ar" ? cat.nameAr : cat.nameEn || cat.nameAr}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {!isLoading && data && (
          <div className="text-sm text-muted-foreground mb-5">
            {t("listings.results_count", { count: data.meta.total })}
          </div>
        )}

        {isLoading ? (
          <div className="masonry-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <Skeleton className="w-full rounded-2xl" style={{ height: heightFor(i) }} />
              </div>
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-card rounded-2xl border-2 border-dashed border-border/70">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Filter className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("listings.empty.title")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{t("listings.empty.desc")}</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/listings">{t("listings.empty.clear")}</Link>
            </Button>
          </div>
        ) : (
          <div className="masonry-grid">
            {data.data.map((listing, idx) => {
              const title = locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
              const price = listing.isFree
                ? t("listings.free")
                : listing.priceCents
                ? formatCurrency(listing.priceCents, listing.currency, locale)
                : t("listings.contact_for_price");
              const isSaved = !!saved[listing.id];

              return (
                <div key={listing.id} className="masonry-item">
                  <Link href={`/listings/${listing.slug}`} className="group block">
                    <div className="relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-accent/40 hover:shadow-xl transition-all duration-300">
                      <div
                        className="relative w-full overflow-hidden"
                        style={{ height: heightFor(idx) }}
                      >
                        <SmartImage
                          src={imageUrl(listing.primaryImageUrl)}
                          alt={title}
                          seed={listing.slug}
                          imgClassName="group-hover:scale-105"
                        />
                        <button
                          onClick={(e) => toggleSave(e, listing.id)}
                          className={`absolute top-3 end-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur transition-all ${
                            isSaved
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-card/85 text-foreground hover:bg-card opacity-0 group-hover:opacity-100"
                          }`}
                          aria-label={t("listings.save")}
                        >
                          <Bookmark
                            className="h-4 w-4"
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                        {listing.isFree && (
                          <div className="absolute bottom-3 start-3">
                            <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">
                              {t("listings.free")}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-accent transition-colors">
                          {title}
                        </h2>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {!listing.isFree && (
                            <div className="font-serif font-bold text-accent text-base">
                              {price}
                            </div>
                          )}
                          {listing.isNegotiable && !listing.isFree && (
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                              {t("listings.negotiable")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{listing.city}</span>
                          </span>
                          <span className="shrink-0">{formatRelative(listing.createdAt, locale)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {data && data.meta.pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <Button
              variant="outline"
              disabled={page <= 1}
              asChild={page > 1}
              className="rounded-full"
            >
              {page > 1 ? (
                <Link href={buildHref({ page: String(page - 1) })}>{t("common.previous")}</Link>
              ) : (
                <span>{t("common.previous")}</span>
              )}
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {t("common.page_of", { page, total: data.meta.pages })}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.meta.pages}
              asChild={page < data.meta.pages}
              className="rounded-full"
            >
              {page < data.meta.pages ? (
                <Link href={buildHref({ page: String(page + 1) })}>{t("common.next")}</Link>
              ) : (
                <span>{t("common.next")}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
