import { useI18n, formatDate } from "@/lib/i18n";
import { useListNews } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NewsList() {
  const { t, locale } = useI18n();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const tag = searchParams.get("tag") || undefined;

  const { data, isLoading } = useListNews({ page, limit: 12, tag });

  return (
    <>
      <Helmet>
        <title>{t("nav.news")} - LivingSyria</title>
        <meta name="description" content="Latest news from trusted Syrian sources" />
      </Helmet>

      <div className="bg-card border-b border-border/40 py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">{t("nav.news")}</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {locale === "ar" 
              ? "مختارات من أهم الأخبار المحلية، ملخصة لتناسب وقتك." 
              : "Selections of the most important local news, summarized for your convenience."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/4 mt-4" />
              </div>
            ))
          ) : data?.data.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              {locale === "ar" ? "لا توجد أخبار حالياً." : "No news available."}
            </div>
          ) : (
            data?.data.map((article) => {
              const title = locale === "ar" ? article.titleAr : (article.titleEn || article.titleAr);
              const summary = locale === "ar" ? article.aiSummaryAr : (article.aiSummaryEn || article.aiSummaryAr);
              
              return (
                <Link key={article.id} href={`/news/${article.slug}`} className="group flex flex-col">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/30 flex flex-col bg-card">
                    {article.coverImageUrl ? (
                      <div className="h-56 w-full overflow-hidden relative flex-shrink-0">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img 
                          src={article.coverImageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-56 w-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl font-serif text-muted-foreground/30">L S</span>
                      </div>
                    )}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">
                          {article.sourceName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(article.publishedAt, locale)}
                        </span>
                      </div>
                      <h2 className="font-bold text-xl mb-4 line-clamp-3 group-hover:text-primary transition-colors font-serif leading-snug">
                        {title}
                      </h2>
                      {summary && (
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1">
                          {summary}
                        </p>
                      )}
                      
                      <div className="flex items-center text-primary font-medium text-sm mt-auto pt-4 border-t border-border/40">
                        {t("news.read_more")}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {data && data.meta.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <Button 
              variant="outline" 
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/news?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}>
                  {locale === "ar" ? "السابق" : "Previous"}
                </Link>
              ) : (
                <span>{locale === "ar" ? "السابق" : "Previous"}</span>
              )}
            </Button>
            
            <span className="text-sm font-medium">
              {locale === "ar" ? `صفحة ${page} من ${data.meta.pages}` : `Page ${page} of ${data.meta.pages}`}
            </span>
            
            <Button 
              variant="outline" 
              disabled={page >= data.meta.pages}
              asChild={page < data.meta.pages}
            >
              {page < data.meta.pages ? (
                <Link href={`/news?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}>
                  {locale === "ar" ? "التالي" : "Next"}
                </Link>
              ) : (
                <span>{locale === "ar" ? "التالي" : "Next"}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
