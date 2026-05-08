import { useI18n, formatCurrency, formatRelative } from "@/lib/i18n";
import { useGetListing } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Share2, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl, monogramFor } from "@/lib/image";

export default function ListingDetail() {
  const { t, locale, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [, params] = useRoute("/listings/:slug");
  const slug = params?.slug;

  const { data: listingResponse, isLoading } = useGetListing(slug || "");
  const listing = listingResponse?.data;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("not_found.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("not_found.desc")}</p>
        <Button asChild className="rounded-full">
          <Link href="/listings">{t("not_found.back")}</Link>
        </Button>
      </div>
    );
  }

  const title = locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const description =
    locale === "ar" ? listing.descriptionAr : listing.descriptionEn || listing.descriptionAr;
  const categoryName =
    locale === "ar" ? listing.category.nameAr : listing.category.nameEn || listing.category.nameAr;

  const price = listing.isFree
    ? t("listings.free")
    : listing.priceCents
    ? formatCurrency(listing.priceCents, listing.currency, locale)
    : t("listings.contact_for_price");

  const images = listing.images?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const activeImage = images.length > 0 ? images[activeImageIndex] : null;
  const NavPrev = isRtl ? ChevronRight : ChevronLeft;
  const NavNext = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <Helmet>
        <title>{title} — LivingSyria</title>
        <meta name="description" content={description.substring(0, 160)} />
        {listing.primaryImageUrl && (
          <meta property="og:image" content={`/api${listing.primaryImageUrl}`} />
        )}
      </Helmet>

      <div className="border-b border-border/60 bg-background">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/listings" className="hover:text-primary transition-colors">
              {t("nav.listings")}
            </Link>
            <span className="opacity-50">/</span>
            <Link
              href={`/listings?category=${listing.category?.slug ?? ""}`}
              className="hover:text-primary transition-colors"
            >
              {categoryName}
            </Link>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-3 space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 bg-card relative group">
              <SmartImage
                src={activeImage ? imageUrl(activeImage.objectPath) : null}
                alt={title}
                seed={listing.slug}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((i) => (i - 1 + images.length) % images.length)
                    }
                    className="absolute start-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                    aria-label={t("image.prev_aria")}
                  >
                    <NavPrev className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                    aria-label={t("image.next_aria")}
                  >
                    <NavNext className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-full bg-foreground/80 text-background text-xs font-medium backdrop-blur">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <SmartImage
                      src={imageUrl(img.objectPath)}
                      alt={`Thumbnail ${idx + 1}`}
                      seed={`${listing.slug}-${idx}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full">
                  {categoryName}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight text-foreground mb-3">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {listing.city}
                      {listing.district ? `, ${listing.district}` : ""}
                    </span>
                  </div>
                  <span className="opacity-50">·</span>
                  <span>{formatRelative(listing.createdAt, locale)}</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5 shadow-sm">
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="text-4xl font-serif font-bold text-accent">{price}</div>
                  {listing.isNegotiable && (
                    <Badge variant="outline" className="border-accent/40 text-accent rounded-full mb-1">
                      {t("listings.negotiable")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1 pb-1">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold font-serif text-primary-foreground shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(15 70% 50%), hsl(15 85% 38%))",
                    }}
                  >
                    {monogramFor(t("listings.seller"))}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {t("listings.seller")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("listings.member_since", { year: new Date(listing.createdAt).getFullYear() })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-full h-12 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {t("listings.contact")}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSaved((s) => !s)}
                      className="gap-2 rounded-full"
                    >
                      <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                      {t("listings.save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title, url: window.location.href }).catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                        }
                      }}
                      className="gap-2 rounded-full"
                    >
                      <Share2 className="h-4 w-4" />
                      {t("common.share")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 p-6">
                <h3 className="font-serif text-lg font-bold mb-3 text-foreground">
                  {t("listings.description")}
                </h3>
                <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
