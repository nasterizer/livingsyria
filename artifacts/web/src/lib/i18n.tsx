import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ar" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
}

const translations = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.news": "الأخبار",
    "nav.listings": "السوق",
    "nav.post": "أضف إعلان",
    "nav.my_listings": "إعلاناتي",
    "auth.login": "تسجيل الدخول",
    "auth.logout": "تسجيل الخروج",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.retry": "إعادة المحاولة",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.search": "بحث",
    "home.hero.title": "دليلك إلى الحياة اليومية في سوريا",
    "home.hero.subtitle": "أخبار، خدمات، وسوق محلي — كل ما يهمك في مكان واحد",
    "home.latest_news": "آخر الأخبار",
    "home.recent_listings": "أحدث الإعلانات",
    "home.categories": "التصنيفات",
    "news.read_more": "اقرأ المزيد",
    "news.ai_summary": "ملخص بالذكاء الاصطناعي",
    "news.source": "المصدر",
    "listings.price": "السعر",
    "listings.free": "مجانًا",
    "listings.negotiable": "قابل للتفاوض",
    "listings.city": "المدينة",
    "listings.contact": "تواصل مع المعلن",
    "post.title": "إضافة إعلان جديد",
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
    "auth.login": "Sign In",
    "auth.logout": "Sign Out",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.retry": "Retry",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.search": "Search",
    "home.hero.title": "Your guide to daily life in Syria",
    "home.hero.subtitle": "News, services, and local market — everything you care about in one place",
    "home.latest_news": "Latest News",
    "home.recent_listings": "Recent Listings",
    "home.categories": "Categories",
    "news.read_more": "Read More",
    "news.ai_summary": "AI Summary",
    "news.source": "Source",
    "listings.price": "Price",
    "listings.free": "Free",
    "listings.negotiable": "Negotiable",
    "listings.city": "City",
    "listings.contact": "Contact Seller",
    "post.title": "Post New Ad",
    "post.category": "Category",
    "post.category.placeholder": "Select Category",
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
    "post.submit": "Publish Ad",
    "post.success": "Ad published successfully",
    "not_found.title": "Page Not Found",
    "not_found.desc": "Sorry, we couldn't find the page you're looking for.",
    "not_found.back": "Back to Home",
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("livingSyria_locale");
    if (saved === "ar" || saved === "en") return saved;
    return "ar"; // Default to Arabic
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("livingSyria_locale", locale);
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = (translations[locale] as any)[key] || key;
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
