import { db, categoriesTable, newsArticlesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { makeSlug } from "../lib/slug";

const CATEGORIES = [
  { slug: "real-estate", nameAr: "عقارات", nameEn: "Real Estate", icon: "Building2", sortOrder: 1 },
  { slug: "vehicles", nameAr: "مركبات", nameEn: "Vehicles", icon: "Car", sortOrder: 2 },
  { slug: "jobs", nameAr: "وظائف", nameEn: "Jobs", icon: "Briefcase", sortOrder: 3 },
  { slug: "electronics", nameAr: "إلكترونيات", nameEn: "Electronics", icon: "Smartphone", sortOrder: 4 },
  { slug: "furniture", nameAr: "أثاث", nameEn: "Furniture", icon: "Sofa", sortOrder: 5 },
  { slug: "services", nameAr: "خدمات", nameEn: "Services", icon: "Wrench", sortOrder: 6 },
  { slug: "fashion", nameAr: "أزياء", nameEn: "Fashion", icon: "Shirt", sortOrder: 7 },
  { slug: "education", nameAr: "تعليم", nameEn: "Education", icon: "GraduationCap", sortOrder: 8 },
];

const SAMPLE_NEWS = [
  {
    titleAr: "ورشة إعادة إعمار حي القابون في دمشق تنطلق هذا الأسبوع",
    titleEn: "Reconstruction works begin in Damascus's Qaboun neighborhood",
    summaryAr: "بدأت السلطات المحلية أعمال إعادة الإعمار في حي القابون شرق دمشق، وسط آمال السكان بعودة سريعة إلى منازلهم.",
    summaryEn: "Local authorities have launched reconstruction work in Qaboun, eastern Damascus, as residents look forward to returning home soon.",
    sourceName: "SANA",
    sourceUrl: "https://example.com/seed/qaboun-reconstruction",
    coverImageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200",
    tags: ["damascus", "reconstruction"],
  },
  {
    titleAr: "ارتفاع طفيف لليرة السورية أمام الدولار في السوق الموازية",
    titleEn: "Syrian pound edges up against the dollar on parallel markets",
    summaryAr: "سجلت الليرة السورية ارتفاعاً طفيفاً أمام الدولار اليوم، وسط نشاط متجدد في الأسواق الموازية بدمشق وحلب.",
    summaryEn: "The Syrian pound posted modest gains against the US dollar today amid renewed activity in parallel markets in Damascus and Aleppo.",
    sourceName: "BBC Arabic",
    sourceUrl: "https://example.com/seed/syp-rate",
    coverImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200",
    tags: ["economy", "currency"],
  },
  {
    titleAr: "افتتاح معرض حلب الدولي للكتاب بمشاركة عربية واسعة",
    titleEn: "Aleppo International Book Fair opens with broad Arab participation",
    summaryAr: "افتُتح معرض حلب الدولي للكتاب اليوم بمشاركة دور نشر من عدة دول عربية، ضمن جهود إحياء الحركة الثقافية في المدينة.",
    summaryEn: "The Aleppo International Book Fair opened today with publishers from across the Arab world, part of efforts to revive the city's cultural scene.",
    sourceName: "Al Jazeera",
    sourceUrl: "https://example.com/seed/aleppo-book-fair",
    coverImageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200",
    tags: ["culture", "aleppo"],
  },
];

async function main() {
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values(cat)
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: {
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        },
      });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  console.log("Seeding news articles...");
  let newsInserted = 0;
  for (const item of SAMPLE_NEWS) {
    const result = await db
      .insert(newsArticlesTable)
      .values({
        slug: makeSlug(item.titleAr),
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        summaryAr: item.summaryAr,
        summaryEn: item.summaryEn,
        coverImageUrl: item.coverImageUrl,
        tags: item.tags,
        status: "PUBLISHED",
        publishedAt: new Date(),
      })
      .onConflictDoNothing({ target: newsArticlesTable.sourceUrl })
      .returning({ id: newsArticlesTable.id });
    newsInserted += result.length;
  }
  console.log(`Seeded ${newsInserted} news articles.`);

  // Verify
  const counts = await db.execute(
    sql`SELECT (SELECT count(*) FROM categories) as cats, (SELECT count(*) FROM news_articles) as news`,
  );
  console.log("Counts:", counts.rows[0]);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
