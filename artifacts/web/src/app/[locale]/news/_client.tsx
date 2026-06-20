"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, formatRelative } from "@/lib/i18n";
import { useListNews, useListNewsSources, type NewsPage } from "@workspace/api-client-react";
import { SmartImage } from "@/components/SmartImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, ExternalLink, Search, X } from "lucide-react";

interface NewsListClientProps {
  initialData?: NewsPage | null;
}

const ALL_SOURCES = "__all__";

export function NewsListClient({ initialData }: NewsListClientProps) {
  const { t, locale, dir, path } = useI18n();
  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const tag = searchParams.get("tag") || undefined;
  const sourceParam = searchParams.get("source") || "";
  const searchParam = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname],
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value || null });
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilters = !!searchParam || !!sourceParam;

  const { data, isLoading } = useListNews(
    {
      page,
      limit: 12,
      tag,
      search: searchParam || undefined,
      source: sourceParam || undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { initialData: !searchParam && !sourceParam ? (initialData ?? undefined) : undefined } as any },
  );

  const { data: sourcesData } = useListNewsSources();
  const sources = sourcesData?.data ?? [];

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <section className="relative border-b border-border/60 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 30% 0%, hsl(15 70% 50% / 0.10), transparent 60%), hsl(40 40% 96%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-foreground">
              {t("news.ai_summary")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            {t("nav.news")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {t("news.subtitle")}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              style={{ [isRtl ? "right" : "left"]: "0.75rem" }}
            />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("news.search_placeholder")}
              className={`rounded-full bg-card ${isRtl ? "pr-9 pl-4" : "pl-9 pr-4"}`}
              dir={dir}
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                style={{ [isRtl ? "left" : "right"]: "0.75rem" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {sources.length > 0 && (
            <Select
              value={sourceParam || ALL_SOURCES}
              onValueChange={(val) =>
                updateParams({ source: val === ALL_SOURCES ? null : val })
              }
            >
              <SelectTrigger className="rounded-full bg-card w-full sm:w-48">
                <SelectValue placeholder={t("news.all_sources")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SOURCES}>{t("news.all_sources")}</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:text-foreground self-center"
              onClick={() => {
                setSearchInput("");
                updateParams({ search: null, source: null });
              }}
            >
              <X className="h-3.5 w-3.5 me-1" />
              {t("news.clear_filters")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border/60 space-y-4">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card/50 py-20 text-center text-muted-foreground">
            {hasFilters ? (
              <div className="flex flex-col items-center gap-3">
                <p>{t("news.no_results")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: null, source: null });
                  }}
                >
                  {t("news.clear_filters")}
                </Button>
              </div>
            ) : (
              t("news.empty")
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {data.data.map((article) => {
              const title = locale === "ar" ? article.titleAr : article.titleEn || article.titleAr;
              const summary =
                locale === "ar" ? article.aiSummaryAr : article.aiSummaryEn || article.aiSummaryAr;

              return (
                <article
                  key={article.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <Link href={path(`/news/${article.slug}`)} className="block">
                    <div className="aspect-[16/9] relative overflow-hidden bg-secondary">
                      <SmartImage
                        src={article.coverImageUrl}
                        alt={title}
                        seed={article.slug}
                        imgClassName="group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-4 start-4">
                        <Badge className="bg-card/95 backdrop-blur text-foreground border border-border/60 shadow-sm">
                          {article.sourceName}
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <div className="p-6 md:p-7">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{formatRelative(article.publishedAt, locale)}</span>
                      {article.tags && article.tags.length > 0 && (
                        <>
                          <span className="opacity-50">·</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {article.tags.slice(0, 3).map((tg) => (
                              <span
                                key={tg}
                                className="px-2 py-0.5 rounded-full bg-secondary text-foreground/70 text-[11px] font-medium"
                              >
                                #{tg}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <Link href={path(`/news/${article.slug}`)}>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-foreground hover:text-primary transition-colors mb-4">
                        {title}
                      </h2>
                    </Link>

                    {summary && (
                      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 md:p-5 mb-5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                          <Sparkles className="h-3 w-3" />
                          {t("news.ai_summary")}
                        </div>
                        <p className="text-foreground/85 leading-relaxed">{summary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <Button asChild variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10">
                        <Link href={path(`/news/${article.slug}`)}>
                          {t("news.read_more")}
                          <ArrowIcon className="h-4 w-4 ms-1.5" />
                        </Link>
                      </Button>
                      {article.sourceUrl && (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                        >
                          {t("news.original_source")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
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
                <Link href={buildPageUrl(page - 1)}>{t("common.previous")}</Link>
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
                <Link href={buildPageUrl(page + 1)}>{t("common.next")}</Link>
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
