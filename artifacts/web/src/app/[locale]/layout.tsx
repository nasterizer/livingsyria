import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

type Locale = "ar" | "en";

interface Props {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export const metadata: Metadata = {
  title: {
    default: "LivingSyria — ليفينغ سوريا",
    template: "%s — LivingSyria",
  },
  description:
    "Your daily platform for Syria news, classifieds, and community. منصتك اليومية لأخبار سوريا والإعلانات المبوبة والمجتمع.",
  openGraph: {
    siteName: "LivingSyria",
    locale: "ar_SY",
  },
};

export default function LocaleLayout({ children, params }: Props) {
  const locale = (params.locale as Locale) === "en" ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
