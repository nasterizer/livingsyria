import { useI18n, formatCurrency, formatDate } from "@/lib/i18n";
import { useListMyListings, getListMyListingsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Image as ImageIcon, PlusCircle } from "lucide-react";

export default function MyListings() {
  const { t, locale } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const { data, isLoading: isDataLoading } = useListMyListings({
    query: {
      enabled: isAuthenticated,
      queryKey: getListMyListingsQueryKey(),
    },
  });

  if (isAuthLoading) {
    return <div className="container py-24 text-center">{t("common.loading")}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">You need to log in to view your listings.</p>
        <Button onClick={() => window.location.href = '/api/login?returnTo=/me/listings'}>
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  const isLoading = isDataLoading;

  return (
    <>
      <Helmet>
        <title>{t("nav.my_listings")} - LivingSyria</title>
      </Helmet>

      <div className="bg-secondary/30 border-b border-border/40 py-8 mb-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-serif font-bold text-foreground">{t("nav.my_listings")}</h1>
          <Button asChild className="w-full md:w-auto gap-2 bg-primary">
            <Link href="/post">
              <PlusCircle className="h-4 w-4" />
              {t("nav.post")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : data?.data.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-card rounded-xl border border-dashed border-border shadow-sm">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {locale === "ar" ? "ليس لديك إعلانات" : "You have no listings"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {locale === "ar" 
                  ? "ابدأ بإضافة إعلانك الأول للوصول إلى آلاف المشترين المحتملين." 
                  : "Start by posting your first ad to reach thousands of potential buyers."}
              </p>
              <Button asChild>
                <Link href="/post">{t("nav.post")}</Link>
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
                <Card key={listing.id} className="h-full overflow-hidden flex flex-col border-border/50 bg-card">
                  <Link href={`/listings/${listing.slug}`} className="block h-48 w-full relative bg-secondary hover:opacity-90 transition-opacity">
                    {listing.primaryImageUrl ? (
                      <img 
                        src={`/api${listing.primaryImageUrl}`} 
                        alt={title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"}>
                        {listing.status === "ACTIVE" 
                          ? (locale === "ar" ? "نشط" : "Active")
                          : (locale === "ar" ? "مسودة" : "Draft")}
                      </Badge>
                    </div>
                  </Link>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{listing.city}</span>
                    </div>
                    
                    <h2 className="font-bold text-lg mb-4 line-clamp-2 leading-snug">
                      {title}
                    </h2>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="font-serif font-bold text-accent">
                        {price}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(listing.createdAt, locale)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
