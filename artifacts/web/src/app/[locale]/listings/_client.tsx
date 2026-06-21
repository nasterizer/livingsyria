"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useI18n, formatRelative, formatCurrency } from "@/lib/i18n";
import {
  useListListings,
  useListCategories,
  type ListingsPage,
  type ListCategories200,
} from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin, Bookmark } from "lucide-react";
import { getApiBase } from "@/lib/api";

function heightFor(i: number) {
  return 200 + ((i * 53) % 160);
}

interface ListingsClientProps {
  initialData?: ListingsPage | null;
  initialCategories?: ListCategories200 | null;
}

export function ListingsClient({ initialData, initialCategories }: ListingsClientProps) {
  const { t, locale, path } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login } = useAuth();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const categorySlug = searchParams.get("category") || undefined;
  const qParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [savePending, setSavePending] = useState<Record<string, boolean>>({});

  // Hydrate saved IDs from API when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setSaved({});
      return;
    }
    fetch(`${getApiBase()}/api/listings/me/saved-ids`, { credentials: "include" })
      .then((r) => r.json())
      .then((json: { data: string[] }) => {
        const map: Record<string, boolean> = {};
        for (const id of json.data) map[id] = true;
        setSaved(map);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  function buildHref(overrides: {
    category?: string | undefined;
    page?: string | undefined;
    q?: string;
  }) {
    const params = new URLSearchParams();
    const cat = "category" in overrides ? overrides.category : categorySlug;
    const pg = "page" in overrides ? overrides.page : page > 1 ? String(page) : undefined;
    const q = "q" in overrides ? overrides.q : qParam;
    if (cat) params.set("category", cat);
    if (pg) params.set("page", pg);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `${path("/listings")}${qs ? `?${qs}` : ""}`;
  }

  const { data, isLoading } = useListListings(
    { page, limit: 12, category: categorySlug, q: qParam || undefined },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { initialData: initialData ?? undefined } as any },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = useListCategories({ query: { initialData: initialCategories ?? undefined } } as any);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref({ q: searchQuery, page: undefined }));
  };

  const toggleSave = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        login();
        return;
      }
      if (savePending[id]) return;

      const wasSaved = !!saved[id];
      setSaved((prev) => ({ ...prev, [id]: !wasSaved }));
      setSavePending((prev) => ({ ...prev, [id]: true }));

      try {
        const res = await fetch(`${getApiBase()}/api/listings/${id}/save`, {
          method: wasSaved ? "DELETE" : "POST",
          credentials: "include",
        });
        if (!res.ok) {
          setSaved((prev) => ({ ...prev, [id]: wasSaved }));
        }
      } catch {
        setSaved((prev) => ({ ...prev, [id]: wasSaved }));
      } finally {
        setSavePending((prev) => ({ ...prev, [id]: false }));
      }
    },
    [isAuthenticated, login, saved, savePending],
  );

  return (
    <>
      <section
        className="relative border-b border-border/60 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(38 92% 50% / 0.08), transparent 60%), hsl(210 40% 98%)",
        }}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            {t("nav.listings")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
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
              <Link href={path("/listings")}>{t("listings.empty.clear")}</Link>
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
                  <Link href={path(`/listings/${listing.slug}`)} className="group block">
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
                              ? "bg-primary text-primary-foreground shadow-md opacity-100"
                              : "bg-card/85 text-foreground hover:bg-card opacity-0 group-hover:opacity-100"
                          }`}
                          aria-label={t("listings.save")}
                          disabled={!!savePending[listing.id]}
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
                            <div className="font-serif font-bold text-accent text-base">{price}</div>
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
