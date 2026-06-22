"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiBase } from "@/lib/api";

interface ShareButtonsProps {
  type: "listing" | "article";
  id: string;
  className?: string;
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.118 1.533 5.845L.057 23.885l6.204-1.627A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.579-.503-5.063-1.381l-.363-.215-3.681.965.982-3.589-.236-.372A9.944 9.944 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

type BlurbCache = Record<string, { blurbAr: string; blurbEn: string }>;
const blurbCache: BlurbCache = {};

export function ShareButtons({ type, id, className }: ShareButtonsProps) {
  const [loading, setLoading] = useState<"whatsapp" | "telegram" | null>(null);

  const getBlurb = async (): Promise<{ blurbAr: string; blurbEn: string }> => {
    const key = `${type}:${id}`;
    if (blurbCache[key]) return blurbCache[key]!;

    const res = await fetch(`${getApiBase()}/api/share/blurb?type=${type}&id=${id}`);
    if (!res.ok) throw new Error("blurb fetch failed");
    const json = (await res.json()) as { data: { blurbAr: string; blurbEn: string } };
    blurbCache[key] = json.data;
    return json.data;
  };

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleWhatsApp = async () => {
    if (loading) return;
    setLoading("whatsapp");
    try {
      const { blurbAr, blurbEn } = await getBlurb();
      const text = `${blurbAr}\n${blurbEn}\n\n${currentUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
        "_blank",
      );
    } finally {
      setLoading(null);
    }
  };

  const handleTelegram = async () => {
    if (loading) return;
    setLoading("telegram");
    try {
      const { blurbAr, blurbEn } = await getBlurb();
      const text = `${blurbAr}\n${blurbEn}`;
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } catch {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}`,
        "_blank",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        disabled={loading !== null}
        className="gap-1.5 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 hover:border-[#25D366]/50"
      >
        {loading === "whatsapp" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <WhatsAppIcon />
        )}
        واتساب
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTelegram}
        disabled={loading !== null}
        className="gap-1.5 text-[#229ED9] border-[#229ED9]/30 hover:bg-[#229ED9]/10 hover:border-[#229ED9]/50"
      >
        {loading === "telegram" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TelegramIcon />
        )}
        تيليغرام
      </Button>
    </div>
  );
}
