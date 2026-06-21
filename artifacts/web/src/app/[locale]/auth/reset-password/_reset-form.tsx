"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  locale: "ar" | "en";
  token: string;
}

export function ResetPasswordForm({ locale, token }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(isAr ? "كلمات المرور غير متطابقة" : "Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError(
        isAr
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters",
      );
      return;
    }
    if (!token) {
      setError(
        isAr
          ? "رابط الاسترداد غير صالح أو منتهي الصلاحية"
          : "Reset link is invalid or has expired",
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword, token }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          setError(
            data.message ??
              (isAr
                ? "رابط الاسترداد غير صالح أو منتهي الصلاحية"
                : "Reset link is invalid or has expired"),
          );
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 2500);
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
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-foreground">
              {isAr ? "إعادة تعيين كلمة المرور" : "Reset password"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAr ? "أدخل كلمة المرور الجديدة" : "Enter your new password"}
            </p>
          </div>

          {success ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 text-sm text-center">
              {isAr
                ? "تم تعيين كلمة المرور. سيتم توجيهك لتسجيل الدخول…"
                : "Password set. Redirecting to sign in…"}
            </div>
          ) : !token ? (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm text-center">
              {isAr
                ? "رابط الاسترداد غير صالح أو منتهي الصلاحية"
                : "Reset link is invalid or has expired"}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">
                  {isAr ? "كلمة المرور الجديدة" : "New password"}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">
                  {isAr ? "تأكيد كلمة المرور" : "Confirm password"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
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
                    ? "جارٍ الحفظ…"
                    : "Saving…"
                  : isAr
                    ? "تعيين كلمة المرور"
                    : "Set password"}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-border/40 text-center">
            <Link
              href={`/${locale}/auth/login`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAr ? "← العودة إلى تسجيل الدخول" : "← Back to sign in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
