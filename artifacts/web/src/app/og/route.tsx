import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { absoluteImageUrl } from "@/lib/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ListingData = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  priceCents?: number | null;
  currency?: string;
  isFree?: boolean;
  city?: string;
  primaryImageUrl?: string | null;
};

type ArticleData = {
  titleAr: string;
  titleEn?: string | null;
  coverImageUrl?: string | null;
  sourceName?: string | null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "listing";
  const slug = searchParams.get("slug") ?? "";

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  let titleAr = "ليفينغ سوريا";
  let titleEn = "LivingSyria";
  let rawImageUrl: string | null | undefined = null;
  let subtext = "";

  try {
    if (type === "listing") {
      const res = await apiFetch<{ data: ListingData }>(`/api/listings/${slug}`);
      const d = res.data;
      titleAr = d.titleAr;
      titleEn = d.titleEn ?? "";
      rawImageUrl = d.primaryImageUrl;
      const city = d.city ? `${d.city} · ` : "";
      if (d.isFree) {
        subtext = `${city}مجاناً`;
      } else if (d.priceCents) {
        subtext = `${city}${new Intl.NumberFormat("ar", {
          style: "currency",
          currency: d.currency ?? "USD",
          minimumFractionDigits: 0,
        }).format(d.priceCents / 100)}`;
      } else {
        subtext = d.city ?? "";
      }
    } else if (type === "article") {
      const res = await apiFetch<{ data: ArticleData }>(`/api/news/${slug}`);
      const d = res.data;
      titleAr = d.titleAr;
      titleEn = d.titleEn ?? "";
      rawImageUrl = d.coverImageUrl;
      subtext = d.sourceName ?? "";
    }
  } catch {
    // Fall back to brand card
  }

  const imageUrl = absoluteImageUrl(rawImageUrl) ?? null;

  const ar = (titleAr ?? "").substring(0, 65);
  const en = (titleEn ?? "").substring(0, 85);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#120806",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(165deg, rgba(18,8,6,0.55) 0%, rgba(18,8,6,0.92) 65%, rgba(18,8,6,0.99) 100%)",
          }}
        />

        {/* Brand mark — top left */}
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: "52px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "52px",
              borderRadius: "3px",
              background: "#c0392b",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#fff",
                fontSize: "30px",
                fontWeight: "700",
                lineHeight: "1.1",
              }}
            >
              ليفينغ سوريا
            </span>
            <span
              style={{
                color: "#f8a59e",
                fontSize: "13px",
                letterSpacing: "0.18em",
                fontWeight: "600",
              }}
            >
              LIVINGSYRIA
            </span>
          </div>
        </div>

        {/* Titles — bottom section */}
        <div
          style={{
            position: "absolute",
            bottom: "90px",
            left: "52px",
            right: "52px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {ar && (
            <div
              style={{
                color: "#ffffff",
                fontSize: "58px",
                fontWeight: "800",
                lineHeight: "1.15",
                textAlign: "right",
                direction: "rtl",
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
              }}
            >
              {ar.length < (titleAr ?? "").length ? ar + "…" : ar}
            </div>
          )}
          {en && (
            <div
              style={{
                color: "#e5e7eb",
                fontSize: "28px",
                fontWeight: "500",
                lineHeight: "1.35",
              }}
            >
              {en.length < (titleEn ?? "").length ? en + "…" : en}
            </div>
          )}
        </div>

        {/* Subtext badge — bottom */}
        {subtext && (
          <div
            style={{
              position: "absolute",
              bottom: "38px",
              left: "52px",
              background: "#c0392b",
              color: "#fff",
              fontSize: "19px",
              fontWeight: "600",
              padding: "7px 22px",
              borderRadius: "99px",
            }}
          >
            {subtext}
          </div>
        )}

        {/* Decorative bar bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "260px",
            height: "5px",
            background: "linear-gradient(to left, #c0392b, transparent)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
