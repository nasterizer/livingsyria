import { useI18n, formatCurrency, formatDate } from "@/lib/i18n";
import { useGetListing } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ArrowLeft, Image as ImageIcon, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ListingDetail() {
  const { t, locale, dir } = useI18n();
  const [match, params] = useRoute("/listings/:slug");
  const slug = params?.slug;

  const { data: listingResponse, isLoading } = useGetListing(slug || "");
  const listing = listingResponse?.data;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2 pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
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
        <Button asChild>
          <Link href="/listings">{t("not_found.back")}</Link>
        </Button>
      </div>
    );
  }

  const title = locale === "ar" ? listing.titleAr : (listing.titleEn || listing.titleAr);
  const description = locale === "ar" ? listing.descriptionAr : (listing.descriptionEn || listing.descriptionAr);
  const categoryName = locale === "ar" ? listing.category.nameAr : (listing.category.nameEn || listing.category.nameAr);
  
  const price = listing.isFree 
    ? t("listings.free") 
    : listing.priceCents 
      ? formatCurrency(listing.priceCents, listing.currency, locale) 
      : (locale === "ar" ? "تواصل لمعرفة السعر" : "Contact for price");

  const images = listing.images?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const activeImage = images.length > 0 ? images[activeImageIndex] : null;

  return (
    <>
      <Helmet>
        <title>{title} - LivingSyria</title>
        <meta name="description" content={description.substring(0, 160)} />
        {listing.primaryImageUrl && <meta property="og:image" content={`/api${listing.primaryImageUrl}`} />}
      </Helmet>

      <div className="bg-secondary/30 border-b border-border/40 py-4 mb-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/listings" className="hover:text-primary transition-colors">
              {t("nav.listings")}
            </Link>
            <span className="opacity-50">/</span>
            <Link href={`/listings?category=${listing.category?.slug ?? ''}`} className="hover:text-primary transition-colors">
              {categoryName}
            </Link>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-secondary rounded-2xl overflow-hidden relative border border-border/50">
              {activeImage ? (
                <img 
                  src={`/api${activeImage.objectPath}`} 
                  alt={`${title} - image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                  <ImageIcon className="h-16 w-16 mb-4" />
                  <span className="font-serif">No images</span>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all
                      ${activeImageIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img 
                      src={`/api${img.objectPath}`} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight mb-4 text-foreground">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.city}{listing.district ? `، ${listing.district}` : ''}</span>
                </div>
                <span>•</span>
                <span>{formatDate(listing.createdAt, locale)}</span>
              </div>
              
              <div className="flex flex-wrap items-end gap-4 pb-6 border-b border-border/50">
                <div className="text-4xl font-serif font-bold text-accent">
                  {price}
                </div>
                {listing.isNegotiable && (
                  <Badge variant="outline" className="text-sm font-normal mb-1 border-accent text-accent">
                    {t("listings.negotiable")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mb-10 bg-card rounded-xl p-6 border border-border/50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">
                  ?
                </div>
                <div>
                  <div className="font-bold text-foreground">Seller</div>
                  <div className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</div>
                </div>
              </div>
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <MessageCircle className="h-5 w-5" />
                {t("listings.contact")}
              </Button>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="font-serif text-xl font-bold mb-4">
                {locale === "ar" ? "الوصف" : "Description"}
              </h3>
              <div className="text-lg leading-relaxed whitespace-pre-wrap text-foreground/80">
                {description}
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
