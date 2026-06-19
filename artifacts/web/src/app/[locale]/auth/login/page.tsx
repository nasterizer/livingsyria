import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تسجيل الدخول — Sign In",
};

interface Props {
  params: { locale: string };
  searchParams: { returnTo?: string };
}

export default function LoginPage({ params, searchParams }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const returnTo = searchParams.returnTo || `/${locale}`;
  const loginHref = `/api/login?returnTo=${encodeURIComponent(returnTo)}`;

  const isAr = locale === "ar";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAr
                ? "سجّل دخولك للمتابعة إلى LivingSyria"
                : "Sign in to continue to LivingSyria"}
            </p>
          </div>

          <a
            href={loginHref}
            className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            {isAr ? "الدخول عبر Replit" : "Sign in with Replit"}
          </a>

          <p className="text-xs text-muted-foreground">
            {isAr ? (
              <>
                ليس لديك حساب؟{" "}
                <a href={loginHref} className="text-primary hover:underline">
                  أنشئ حساباً مجاناً
                </a>
              </>
            ) : (
              <>
                No account?{" "}
                <a href={loginHref} className="text-primary hover:underline">
                  Create one free
                </a>
              </>
            )}
          </p>

          <div className="pt-2 border-t border-border/40">
            <Link
              href={`/${locale}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAr ? "← العودة إلى الرئيسية" : "← Back to home"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
