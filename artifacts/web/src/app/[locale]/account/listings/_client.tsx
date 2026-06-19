"use client";

import Link from "next/link";
import { useI18n, formatCurrency, formatRelative } from "@/lib/i18n";
import {
  useListMyListings,
  getListMyListingsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, PlusCircle, Store } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";

export function MyListingsClient() {
  const { t, locale, path } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();

  const { data, isLoading: isDataLoading } = useListMyListings({
    query: {
      enabled: isAuthenticated,
      queryKey: getListMyListingsQueryKey(),
    },
  });

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
          <Store className="h-8 w-8 text-primary" />
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
        <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t("nav.my_listings")}
            </h1>
            {data?.data && data.data.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {t("listings.results_count", { count: data.data.length })}
              </p>
            )}
          </div>
          <Button asChild size="lg" className="gap-2 rounded-full shadow-sm">
            <Link href={path("/listings/new")}>
              <PlusCircle className="h-4 w-4" />
              {t("nav.post")}
            </Link>
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {isDataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card/50 py-20 px-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">{t("me.empty.title")}</h3>
            <p className="text-muted-foreground mb-6">{t("me.empty.desc")}</p>
            <Button asChild size="lg" className="rounded-full">
              <Link href={path("/listings/new")}>{t("nav.post")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((listing) => {
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
                <Link
                  key={listing.id}
                  href={path(`/listings/${listing.slug}`)}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={imageUrl(listing.primaryImageUrl)}
                      alt={title}
                      seed={listing.slug}
                      imgClassName="group-hover:scale-105"
                    />
                    <div className="absolute top-3 end-3">
                      <Badge
                        className={
                          listing.status === "ACTIVE"
                            ? "bg-emerald-600 text-white border-0 shadow-sm"
                            : "bg-card text-foreground border border-border/60"
                        }
                      >
                        {listing.status === "ACTIVE"
                          ? t("me.status.active")
                          : t("me.status.draft")}
                      </Badge>
                    </div>
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
