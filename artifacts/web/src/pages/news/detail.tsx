import { useI18n, formatDate } from "@/lib/i18n";
import { useGetNewsArticle } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewsDetail() {
  const { t, locale, dir } = useI18n();
  const [match, params] = useRoute("/news/:slug");
  const slug = params?.slug;

  const { data: articleResponse, isLoading } = useGetNewsArticle(slug || "");
  const article = articleResponse?.data;

  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("not_found.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("not_found.desc")}</p>
        <Button asChild>
          <Link href="/news">{t("not_found.back")}</Link>
        </Button>
      </div>
    );
  }

  const title = locale === "ar" ? article.titleAr : (article.titleEn || article.titleAr);
  const summary = locale === "ar" ? article.summaryAr : (article.summaryEn || article.summaryAr);
  const aiSummary = locale === "ar" ? article.aiSummaryAr : (article.aiSummaryEn || article.aiSummaryAr);
  const body = locale === "ar" ? article.bodyAr : (article.bodyEn || article.bodyAr);

  return (
    <>
      <Helmet>
        <title>{title} - LivingSyria</title>
        <meta name="description" content={summary || aiSummary || title} />
        {article.coverImageUrl && <meta property="og:image" content={article.coverImageUrl} />}
      </Helmet>

      <article className="pb-24">
        {article.coverImageUrl ? (
          <div className="w-full h-[40dvh] md:h-[60dvh] relative mb-8 md:mb-12">
            <img 
              src={article.coverImageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-24 md:h-32 bg-secondary mb-8 md:mb-12"></div>
        )}

        <div className="container mx-auto px-4 max-w-4xl relative z-10 -mt-12 md:-mt-24">
          <Button variant="outline" size="sm" asChild className="mb-6 bg-background/80 backdrop-blur-sm">
            <Link href="/news" className="flex items-center gap-2">
              <ArrowIcon className="h-4 w-4" />
              {locale === "ar" ? "العودة للأخبار" : "Back to News"}
            </Link>
          </Button>

          <div className="bg-card p-6 md:p-10 rounded-2xl shadow-lg border border-border/50 mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium px-3 py-1">
                {article.sourceName}
              </Badge>
              <span className="text-muted-foreground text-sm font-medium">
                {formatDate(article.publishedAt, locale)}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-serif leading-tight mb-8 text-foreground">
              {title}
            </h1>

            {aiSummary && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-10">
                <div className="flex items-center gap-2 text-accent font-bold mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                  {t("news.ai_summary")}
                </div>
                <p className="text-lg leading-relaxed text-foreground/90">
                  {aiSummary}
                </p>
              </div>
            )}

            {body ? (
              <div
                className="prose dark:prose-invert prose-lg md:prose-xl max-w-none
                           prose-p:leading-relaxed prose-headings:font-serif
                           prose-a:text-primary hover:prose-a:text-primary/80
                           prose-img:rounded-xl whitespace-pre-wrap"
              >
                {body}
              </div>
            ) : summary ? (
              <p className="text-xl leading-relaxed text-foreground/90">{summary}</p>
            ) : null}

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  {locale === "ar" ? "كلمات مفتاحية" : "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {article.sourceUrl && (
              <div className="mt-12 pt-8 border-t border-border/50 text-center">
                <Button variant="outline" asChild className="gap-2">
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {t("news.source")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
