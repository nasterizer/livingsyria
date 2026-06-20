"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  locale: "ar" | "en";
  returnTo: string;
}

export function LoginForm({ locale, returnTo }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          setError(
            data.message ??
              (isAr ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : "Invalid email or password"),
          );
          return;
        }

        router.push(returnTo);
        router.refresh();
      } catch {
        setError(
          isAr
            ? "حدث خطأ، يرجى المحاولة مجددًا"
            : "Something went wrong, please try again",
        );
      }
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div
          className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm space-y-6"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAr
                ? "سجّل دخولك للمتابعة إلى LivingSyria"
                : "Sign in to continue to LivingSyria"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "example@example.com" : "you@example.com"}
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isPending
                ? isAr
                  ? "جارٍ الدخول…"
                  : "Signing in…"
                : isAr
                  ? "دخول"
                  : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            {isAr
              ? "ليس لديك حساب؟ تواصل مع الإدارة للتسجيل"
              : "No account? Contact admin to register."}
          </p>

          <div className="pt-2 border-t border-border/40 text-center">
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
