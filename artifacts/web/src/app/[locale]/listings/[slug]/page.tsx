import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { ListingGallery, ListingActions } from "./_gallery";
import { ContactSellerForm } from "./_contact-form";
import { getServerUser } from "@/lib/server-auth";
import { imageUrl, absoluteImageUrl } from "@/lib/image";
import { getAppUrl } from "@/lib/seo";

type Locale = "ar" | "en";

type Listing = {
  id: string;
  userId: string;
  titleAr: string;
  titleEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  priceCents?: number | null;
  currency: string;
  isFree: boolean;
  isNegotiable: boolean;
  city: string;
  district?: string | null;
  slug: string;
  createdAt: string;
  primaryImageUrl?: string | null;
  category: { nameAr: string; nameEn?: string | null; slug: string };
  images?: Array<{ id: string; objectPath: string; sortOrder: number }>;
};

async function getListing(slug: string): Promise<Listing | null> {
  try {
    const res = await apiFetch<{ data: Listing }>(`/api/listings/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

async function getPublicSettings(): Promise<{ messagingEnabled: boolean }> {
  try {
    const res = await apiFetch<{ data: { messagingEnabled: boolean } }>("/api/settings/public");
    return { messagingEnabled: res.data.messagingEnabled ?? true };
  } catch {
    return { messagingEnabled: true };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: "Listing — LivingSyria" };

  const locale = (params.locale as Locale) === "en" ? "en" : "ar";
  const title =
    locale === "ar"
      ? listing.titleAr
      : listing.titleEn || listing.titleAr;
  const description = (
    locale === "ar"
      ? listing.descriptionAr
      : listing.descriptionEn || listing.descriptionAr
  )?.substring(0, 155);

  const ogImage = absoluteImageUrl(listing.primaryImageUrl);
  const appUrl = getAppUrl();
  const slug = params.slug;

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/ar/listings/${slug}`,
      languages: {
        ar: `${appUrl}/ar/listings/${slug}`,
        en: `${appUrl}/en/listings/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
      type: "website",
      siteName: "LivingSyria",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (params.locale as Locale) === "en" ? "en" : "ar";
  const [listing, serverUser, settings] = await Promise.all([
    getListing(params.slug),
    getServerUser(),
    getPublicSettings(),
  ]);
  const { messagingEnabled } = settings;
  const listingsHref = `/${locale}/listings`;

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {locale === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <Button asChild className="rounded-full">
          <Link href={listingsHref}>
            {locale === "ar" ? "العودة للسوق" : "Back to Market"}
          </Link>
        </Button>
      </div>
    );
  }

  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const categoryName =
    locale === "ar"
      ? listing.category.nameAr
      : listing.category.nameEn || listing.category.nameAr;

  const price = listing.isFree
    ? locale === "ar" ? "مجانًا" : "Free"
    : listing.priceCents
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: listing.currency,
        minimumFractionDigits: 0,
      }).format(listing.priceCents / 100)
    : locale === "ar" ? "تواصل لمعرفة السعر" : "Contact for price";

  const images =
    listing.images?.sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description:
      locale === "ar"
        ? listing.descriptionAr
        : listing.descriptionEn || listing.descriptionAr,
    image: absoluteImageUrl(listing.primaryImageUrl)
      ? [absoluteImageUrl(listing.primaryImageUrl)!]
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: listing.currency,
      price: listing.isFree ? 0 : (listing.priceCents ?? null),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-border/60 bg-background">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={listingsHref} className="hover:text-primary transition-colors">
              {locale === "ar" ? "السوق" : "Market"}
            </Link>
            <span className="opacity-50">/</span>
            <Link
              href={`${listingsHref}?category=${listing.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {categoryName}
            </Link>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <ListingGallery
            listingId={listing.id}
            images={images}
            title={title}
            slug={listing.slug}
            price={price}
            isNegotiable={listing.isNegotiable}
            isFree={listing.isFree}
            city={listing.city}
            district={listing.district}
            categoryName={categoryName}
            priceCents={listing.priceCents}
            currency={listing.currency}
            createdAt={listing.createdAt}
            descriptionAr={listing.descriptionAr}
            descriptionEn={listing.descriptionEn}
          />

          <div className="hidden lg:block lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight text-foreground mb-3">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
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

              <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                <ListingActions
                  listingId={listing.id}
                  title={title}
                  price={price}
                  isNegotiable={listing.isNegotiable}
                  categoryName={categoryName}
                  descriptionAr={listing.descriptionAr}
                  descriptionEn={listing.descriptionEn}
                  createdYear={new Date(listing.createdAt).getFullYear()}
                />
              </div>

              {messagingEnabled ? (
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                  <h3 className="font-serif text-base font-bold mb-4 text-foreground">
                    {locale === "ar" ? "تواصل مع المعلن" : "Contact seller"}
                  </h3>
                  <ContactSellerForm
                    listingId={listing.id}
                    listingOwnerId={listing.userId}
                    currentUserId={serverUser?.id ?? null}
                    listingSlug={listing.slug}
                  />
                </div>
              ) : (
                <div className="bg-muted/50 rounded-2xl border border-border/60 p-6">
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    {locale === "ar"
                      ? "خاصية المراسلة معطّلة مؤقتًا"
                      : "Messaging is currently disabled"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
