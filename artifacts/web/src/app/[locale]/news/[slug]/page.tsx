import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getAppUrl } from "@/lib/seo";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, ArrowLeft } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";

type Locale = "ar" | "en";

type Article = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  summaryAr?: string | null;
  summaryEn?: string | null;
  aiSummaryAr?: string | null;
  aiSummaryEn?: string | null;
  bodyAr?: string | null;
  bodyEn?: string | null;
  coverImageUrl?: string | null;
  publishedAt: string;
  sourceName: string;
  sourceUrl?: string | null;
  tags?: string[] | null;
  slug: string;
};

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await apiFetch<{ data: Article }>(`/api/news/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Article — LivingSyria" };

  const locale = (params.locale as Locale) === "en" ? "en" : "ar";
  const title =
    locale === "ar" ? article.titleAr : article.titleEn || article.titleAr;
  const description = (
    locale === "ar"
      ? article.aiSummaryAr || article.summaryAr
      : article.aiSummaryEn || article.aiSummaryAr || article.summaryAr
  )?.substring(0, 155);

  const appUrl = getAppUrl();
  const slug = params.slug;
  const ogImage = `${appUrl}/og?type=article&slug=${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/ar/news/${slug}`,
      languages: {
        ar: `${appUrl}/ar/news/${slug}`,
        en: `${appUrl}/en/news/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "article",
      publishedTime: article.publishedAt,
      siteName: "LivingSyria",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (params.locale as Locale) === "en" ? "en" : "ar";
  const article = await getArticle(params.slug);
  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;
  const newsHref = `/${locale}/news`;

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {locale === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {locale === "ar"
            ? "عذراً، لم نتمكن من العثور على المقال."
            : "Sorry, we couldn't find this article."}
        </p>
        <Button asChild>
          <Link href={newsHref}>
            {locale === "ar" ? "العودة للأخبار" : "Back to News"}
          </Link>
        </Button>
      </div>
    );
  }

  const title =
    locale === "ar" ? article.titleAr : article.titleEn || article.titleAr;
  const summary =
    locale === "ar"
      ? article.summaryAr
      : article.summaryEn || article.summaryAr;
  const aiSummary =
    locale === "ar"
      ? article.aiSummaryAr
      : article.aiSummaryEn || article.aiSummaryAr;
  const body =
    locale === "ar" ? article.bodyAr : article.bodyEn || article.bodyAr;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    datePublished: article.publishedAt,
    publisher: { "@type": "Organization", name: article.sourceName },
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    description: aiSummary || summary || title,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pb-24">
        {article.coverImageUrl ? (
          <div className="w-full h-[40dvh] md:h-[60dvh] relative mb-8 md:mb-12">
            <img
              src={article.coverImageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        ) : (
          <div className="w-full h-24 md:h-32 bg-secondary mb-8 md:mb-12" />
        )}

        <div className="container mx-auto px-4 max-w-4xl relative z-10 -mt-12 md:-mt-24">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mb-6 bg-background/80 backdrop-blur-sm"
          >
            <Link href={newsHref} className="flex items-center gap-2">
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
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {locale === "ar" ? "ملخص بالذكاء الاصطناعي" : "AI Summary"}
                </div>
                <p className="text-lg leading-relaxed text-foreground/90">{aiSummary}</p>
              </div>
            )}

            {body ? (
              <div className="prose dark:prose-invert prose-lg md:prose-xl max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl whitespace-pre-wrap">
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
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
              <ShareButtons type="article" id={article.id} />
              {article.sourceUrl && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {locale === "ar" ? "المصدر" : "Source"}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
