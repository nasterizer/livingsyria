"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n, formatCurrency, formatRelative } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bookmark, Store } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { getApiBase } from "@/lib/api";

type Listing = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  priceCents?: number | null;
  currency: string;
  isFree: boolean;
  isNegotiable: boolean;
  city: string;
  slug: string;
  primaryImageUrl?: string | null;
  createdAt: string;
  status: string;
};

export function SavedListingsClient() {
  const { t, locale, path } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unsaving, setUnsaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${getApiBase()}/api/listings/me/saved`, { credentials: "include" })
      .then((r) => r.json())
      .then((json: { data: Listing[] }) => {
        setListings(json.data ?? []);
      })
      .catch(() => setListings([]))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const unsave = async (id: string) => {
    if (unsaving[id]) return;
    setUnsaving((prev) => ({ ...prev, [id]: true }));
    setListings((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`${getApiBase()}/api/listings/${id}/save`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Already removed from UI; silent fail is acceptable here
    } finally {
      setUnsaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        {t("common.loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Bookmark className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-serif font-bold mb-3">{t("auth.required.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("auth.required.desc")}</p>
        <Button onClick={login} size="lg" className="rounded-full">
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-border/60 bg-background">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {locale === "ar" ? "المحفوظات" : "Saved listings"}
          </h1>
          {!isLoading && listings.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("listings.results_count", { count: listings.length })}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card/50 py-20 px-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">
              {locale === "ar" ? "لا توجد إعلانات محفوظة" : "No saved listings yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {locale === "ar"
                ? "احفظ الإعلانات التي تعجبك بالنقر على أيقونة الإشارة المرجعية."
                : "Bookmark listings you like and find them here anytime."}
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href={path("/listings")}>{t("nav.listings")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => {
              const title =
                locale === "ar"
                  ? listing.titleAr
                  : listing.titleEn || listing.titleAr;
              const price = listing.isFree
                ? t("listings.free")
                : listing.priceCents
                ? formatCurrency(listing.priceCents, listing.currency, locale)
                : t("listings.contact_for_price");

              return (
                <div
                  key={listing.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
                >
                  <Link href={path(`/listings/${listing.slug}`)} className="flex-1">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SmartImage
                        src={imageUrl(listing.primaryImageUrl)}
                        alt={title}
                        seed={listing.slug}
                        imgClassName="group-hover:scale-105"
                      />
                      {listing.isFree && (
                        <div className="absolute bottom-3 start-3">
                          <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">
                            {t("listings.free")}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                        {title}
                      </h2>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif font-bold text-accent">{price}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{listing.city}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatRelative(listing.createdAt, locale)}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-3 pt-1 border-t border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unsave(listing.id)}
                      disabled={!!unsaving[listing.id]}
                      className="w-full gap-1.5 rounded-full h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Bookmark className="h-3 w-3" fill="currentColor" />
                      {locale === "ar" ? "إزالة من المحفوظات" : "Remove from saved"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
