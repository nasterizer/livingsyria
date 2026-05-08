import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ar" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.news": "الأخبار",
    "nav.listings": "السوق",
    "nav.post": "أضف إعلان",
    "nav.my_listings": "إعلاناتي",
    "nav.search_placeholder": "ابحث في LivingSyria…",
    "auth.login": "تسجيل الدخول",
    "auth.logout": "تسجيل الخروج",
    "auth.required.title": "تسجيل الدخول مطلوب",
    "auth.required.desc": "سجّل الدخول لمتابعة إعلاناتك ونشر إعلانات جديدة.",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.retry": "إعادة المحاولة",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.search": "بحث",
    "common.all": "الكل",
    "common.view_all": "عرض الكل",
    "common.previous": "السابق",
    "common.next": "التالي",
    "common.page_of": "صفحة {{page}} من {{total}}",
    "home.hero.eyebrow": "مرحبًا بك في سوريا الحيّة",
    "home.hero.title": "كل ما يهم سوريا — في مكان واحد دافئ.",
    "home.hero.subtitle": "أخبار محلية ملخصة بالذكاء الاصطناعي، سوق مجتمعي للجيران، وكل التفاصيل اليومية بنكهة دمشقية.",
    "home.hero.cta_primary": "تصفّح السوق",
    "home.hero.cta_secondary": "اقرأ الأخبار",
    "home.latest_news": "أحدث الأخبار",
    "home.recent_listings": "أحدث الإعلانات",
    "home.categories": "تسوّق حسب التصنيف",
    "home.categories.subtitle": "اعثر على ما تحتاجه — من الأثاث إلى الخدمات.",
    "home.empty_news": "لا توجد أخبار بعد. ارجع لاحقًا.",
    "home.empty_listings": "لم يضف أحد إعلانًا بعد. كن الأول!",
    "news.read_more": "اقرأ المزيد",
    "news.ai_summary": "ملخص بالذكاء الاصطناعي",
    "news.ai_summary.short": "ملخص ذكي",
    "news.source": "المصدر",
    "news.subtitle": "مختارات من أهم الأخبار المحلية، ملخصة بالذكاء الاصطناعي لتناسب وقتك.",
    "news.empty": "لا توجد أخبار حالياً.",
    "news.original_source": "اقرأ المصدر الأصلي",
    "listings.price": "السعر",
    "listings.free": "مجانًا",
    "listings.negotiable": "قابل للتفاوض",
    "listings.contact_for_price": "تواصل لمعرفة السعر",
    "listings.city": "المدينة",
    "listings.contact": "تواصل مع المعلن",
    "listings.subtitle": "اكتشف ما يعرضه جيرانك — من الأثاث إلى السيارات والخدمات.",
    "listings.results_count": "{{count}} إعلان",
    "listings.empty.title": "لا توجد نتائج",
    "listings.empty.desc": "لم نعثر على إعلانات مطابقة. جرّب كلمات مختلفة أو أزل بعض الفلاتر.",
    "listings.empty.clear": "مسح الفلاتر",
    "listings.save": "حفظ",
    "listings.member_since": "عضو منذ {{year}}",
    "listings.description": "الوصف",
    "listings.seller": "المُعلن",
    "listings.no_images": "لا توجد صور",
    "post.title": "إضافة إعلان جديد",
    "post.subtitle": "أعلن عن منتجك أو خدمتك ووصّل لآلاف الجيران في سوريا.",
    "post.category": "التصنيف",
    "post.category.placeholder": "اختر التصنيف",
    "post.title_ar": "العنوان (بالعربية)",
    "post.title_en": "العنوان (بالإنجليزية - اختياري)",
    "post.desc_ar": "الوصف (بالعربية)",
    "post.desc_en": "الوصف (بالإنجليزية - اختياري)",
    "post.price": "السعر",
    "post.currency": "العملة",
    "post.is_free": "هذا العنصر مجاني",
    "post.is_negotiable": "السعر قابل للتفاوض",
    "post.city": "المدينة",
    "post.district": "المنطقة/الحي (اختياري)",
    "post.images": "الصور",
    "post.submit": "نشر الإعلان",
    "post.success": "تم نشر الإعلان بنجاح",
    "me.empty.title": "ليس لديك إعلانات بعد",
    "me.empty.desc": "ابدأ بإضافة إعلانك الأول للوصول إلى آلاف المشترين المحتملين في سوريا.",
    "me.status.active": "نشط",
    "me.status.draft": "مسودة",
    "footer.tagline": "نافذتك على الحياة اليومية في سوريا.",
    "footer.product": "المنتج",
    "footer.community": "المجتمع",
    "footer.about": "عن LivingSyria",
    "footer.rights": "جميع الحقوق محفوظة",
    "locale.toggle_aria": "تغيير اللغة",
    "locale.switch_other": "Switch to English",
    "image.prev_aria": "الصورة السابقة",
    "image.next_aria": "الصورة التالية",
    "common.share": "مشاركة",
    "not_found.title": "الصفحة غير موجودة",
    "not_found.desc": "عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.",
    "not_found.back": "العودة للرئيسية",
  },
  en: {
    "nav.home": "Home",
    "nav.news": "News",
    "nav.listings": "Market",
    "nav.post": "Post Ad",
    "nav.my_listings": "My Ads",
    "nav.search_placeholder": "Search LivingSyria…",
    "auth.login": "Sign In",
    "auth.logout": "Sign Out",
    "auth.required.title": "Sign in required",
    "auth.required.desc": "Sign in to manage your listings and post new ads.",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.retry": "Retry",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.search": "Search",
    "common.all": "All",
    "common.view_all": "View all",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.page_of": "Page {{page}} of {{total}}",
    "home.hero.eyebrow": "Welcome to LivingSyria",
    "home.hero.title": "Everything that matters in Syria — in one warm place.",
    "home.hero.subtitle": "Local news with AI bilingual summaries, a community marketplace, and the everyday details of Syrian life.",
    "home.hero.cta_primary": "Browse the market",
    "home.hero.cta_secondary": "Read the news",
    "home.latest_news": "Latest news",
    "home.recent_listings": "Fresh from the market",
    "home.categories": "Shop by category",
    "home.categories.subtitle": "Find what you need — from furniture to services.",
    "home.empty_news": "No news yet. Check back soon.",
    "home.empty_listings": "No listings yet. Be the first to post.",
    "news.read_more": "Read more",
    "news.ai_summary": "AI Summary",
    "news.ai_summary.short": "AI summary",
    "news.source": "Source",
    "news.subtitle": "A curated feed of the most important local news, summarized in both languages by AI.",
    "news.empty": "No news available.",
    "news.original_source": "Read original source",
    "listings.price": "Price",
    "listings.free": "Free",
    "listings.negotiable": "Negotiable",
    "listings.contact_for_price": "Contact for price",
    "listings.city": "City",
    "listings.contact": "Contact seller",
    "listings.subtitle": "Discover what your neighbors are offering — from furniture to cars and services.",
    "listings.results_count": "{{count}} listings",
    "listings.empty.title": "No results found",
    "listings.empty.desc": "We couldn't find any listings matching your search. Try different keywords or clear filters.",
    "listings.empty.clear": "Clear filters",
    "listings.save": "Save",
    "listings.member_since": "Member since {{year}}",
    "listings.description": "Description",
    "listings.seller": "Seller",
    "listings.no_images": "No images",
    "post.title": "Post a new ad",
    "post.subtitle": "Showcase your product or service and reach thousands of neighbors across Syria.",
    "post.category": "Category",
    "post.category.placeholder": "Select category",
    "post.title_ar": "Title (Arabic)",
    "post.title_en": "Title (English - Optional)",
    "post.desc_ar": "Description (Arabic)",
    "post.desc_en": "Description (English - Optional)",
    "post.price": "Price",
    "post.currency": "Currency",
    "post.is_free": "This item is free",
    "post.is_negotiable": "Price is negotiable",
    "post.city": "City",
    "post.district": "District (Optional)",
    "post.images": "Images",
    "post.submit": "Publish ad",
    "post.success": "Ad published successfully",
    "me.empty.title": "You haven't posted anything yet",
    "me.empty.desc": "Post your first ad and reach thousands of buyers across Syria.",
    "me.status.active": "Active",
    "me.status.draft": "Draft",
    "footer.tagline": "Your window into daily life in Syria.",
    "footer.product": "Product",
    "footer.community": "Community",
    "footer.about": "About LivingSyria",
    "footer.rights": "All rights reserved",
    "locale.toggle_aria": "Change language",
    "locale.switch_other": "التبديل للعربية",
    "image.prev_aria": "Previous image",
    "image.next_aria": "Next image",
    "common.share": "Share",
    "not_found.title": "Page Not Found",
    "not_found.desc": "Sorry, we couldn't find the page you're looking for.",
    "not_found.back": "Back to Home",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("livingSyria_locale");
    if (saved === "ar" || saved === "en") return saved;
    return "ar";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("livingSyria_locale", locale);
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[locale][key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }
    return text;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}

export function formatCurrency(amountCents: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatDate(dateString: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function formatRelative(dateString: string, locale: Locale) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), "month");
  return rtf.format(Math.round(diffSec / 31536000), "year");
}
