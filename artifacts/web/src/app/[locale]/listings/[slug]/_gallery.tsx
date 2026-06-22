"use client";

import { useState, useEffect, useCallback } from "react";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { ChevronLeft, ChevronRight, MessageCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { monogramFor } from "@/lib/image";
import { useAuth } from "@workspace/replit-auth-web";
import { getApiBase } from "@/lib/api";
import { ShareButtons } from "@/components/ShareButtons";

type Image = { id: string; objectPath: string; sortOrder: number };

interface Props {
  listingId: string;
  images: Image[];
  title: string;
  slug: string;
  price: string;
  isNegotiable: boolean;
  isFree: boolean;
  city: string;
  district?: string | null;
  categoryName: string;
  priceCents?: number | null;
  currency: string;
  createdAt: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
}

function useSavedState(listingId: string) {
  const { isAuthenticated, login } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSaved(false);
      return;
    }
    fetch(`${getApiBase()}/api/listings/me/saved-ids`, { credentials: "include" })
      .then((r) => r.json())
      .then((json: { data: string[] }) => {
        setSaved(json.data.includes(listingId));
      })
      .catch(() => {});
  }, [isAuthenticated, listingId]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (pending) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    setPending(true);
    try {
      const res = await fetch(`${getApiBase()}/api/listings/${listingId}/save`, {
        method: wasSaved ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) setSaved(wasSaved);
    } catch {
      setSaved(wasSaved);
    } finally {
      setPending(false);
    }
  }, [isAuthenticated, login, listingId, saved, pending]);

  return { saved, pending, toggle };
}

export function ListingGallery({ listingId, images, title, slug, price, isNegotiable, categoryName, descriptionAr, descriptionEn }: Props) {
  const { t, locale, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [activeIndex, setActiveIndex] = useState(0);
  const { saved, pending, toggle } = useSavedState(listingId);

  const NavPrev = isRtl ? ChevronRight : ChevronLeft;
  const NavNext = isRtl ? ChevronLeft : ChevronRight;

  const activeImage = images.length > 0 ? images[activeIndex] : null;
  const description = locale === "ar" ? descriptionAr : descriptionEn || descriptionAr;

  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 bg-card relative group">
        <SmartImage
          src={activeImage ? imageUrl(activeImage.objectPath) : null}
          alt={title}
          seed={slug}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute start-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
              aria-label={t("image.prev_aria")}
            >
              <NavPrev className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
              className="absolute end-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/85 backdrop-blur flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
              aria-label={t("image.next_aria")}
            >
              <NavNext className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-full bg-foreground/80 text-background text-xs font-medium backdrop-blur">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <SmartImage
                src={imageUrl(img.objectPath)}
                alt={`Thumbnail ${idx + 1}`}
                seed={`${slug}-${idx}`}
              />
            </button>
          ))}
        </div>
      )}

      <div className="lg:hidden bg-card rounded-2xl border border-border/60 p-6 space-y-4 shadow-sm">
        <Badge variant="outline" className="rounded-full">{categoryName}</Badge>
        <div className="text-4xl font-serif font-bold text-accent">{price}</div>
        {isNegotiable && (
          <Badge variant="outline" className="border-accent/40 text-accent rounded-full">
            {t("listings.negotiable")}
          </Badge>
        )}

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold font-serif text-primary-foreground shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(15 70% 50%), hsl(15 85% 38%))" }}
          >
            {monogramFor(t("listings.seller"))}
          </div>
          <div>
            <div className="font-semibold text-foreground">{t("listings.seller")}</div>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2 rounded-full h-12">
          <MessageCircle className="h-5 w-5" />
          {t("listings.contact")}
        </Button>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={toggle}
            disabled={pending}
            className="w-full gap-2 rounded-full"
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            {t("listings.save")}
          </Button>
          <ShareButtons type="listing" id={listingId} className="w-full justify-center" />
        </div>

        {description && (
          <div className="pt-2 border-t border-border/60">
            <h3 className="font-serif text-lg font-bold mb-3 text-foreground">{t("listings.description")}</h3>
            <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{description}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ListingActions({
  listingId,
  title,
  price,
  isNegotiable,
  categoryName,
  descriptionAr,
  descriptionEn,
  createdYear,
}: {
  listingId: string;
  title: string;
  price: string;
  isNegotiable: boolean;
  categoryName: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  createdYear: number;
}) {
  const { t, locale } = useI18n();
  const { saved, pending, toggle } = useSavedState(listingId);
  const description = locale === "ar" ? descriptionAr : descriptionEn || descriptionAr;

  return (
    <div className="lg:col-span-2">
      <div className="lg:sticky lg:top-24 space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 rounded-full">{categoryName}</Badge>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="text-4xl font-serif font-bold text-accent">{price}</div>
            {isNegotiable && (
              <Badge variant="outline" className="border-accent/40 text-accent rounded-full">
                {t("listings.negotiable")}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold font-serif text-primary-foreground shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(15 70% 50%), hsl(15 85% 38%))" }}
            >
              {monogramFor(t("listings.seller"))}
            </div>
            <div>
              <div className="font-semibold text-foreground">{t("listings.seller")}</div>
              <div className="text-xs text-muted-foreground">
                {t("listings.member_since", { year: createdYear })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button size="lg" className="w-full gap-2 rounded-full h-12 shadow-sm hover:shadow-md transition-shadow">
              <MessageCircle className="h-5 w-5" />
              {t("listings.contact")}
            </Button>
            <Button
              variant="outline"
              onClick={toggle}
              disabled={pending}
              className="w-full gap-2 rounded-full"
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
              {t("listings.save")}
            </Button>
            <ShareButtons type="listing" id={listingId} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h3 className="font-serif text-lg font-bold mb-3 text-foreground">{t("listings.description")}</h3>
          <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{description}</div>
        </div>
      </div>
    </div>
  );
}
