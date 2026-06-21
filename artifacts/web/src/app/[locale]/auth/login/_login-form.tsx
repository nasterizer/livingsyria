"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Mode = "signin" | "register" | "forgot";

interface Props {
  locale: "ar" | "en";
  returnTo: string;
}

export function LoginForm({ locale, returnTo }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("signin");

  // Sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register extra fields
  const [firstName, setFirstName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetState = (next: Mode) => {
    setError(null);
    setSuccess(null);
    setMode(next);
  };

  const handleSignIn = (e: React.FormEvent) => {
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
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          setError(data.message ?? (isAr ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : "Invalid email or password"));
          return;
        }
        router.push(returnTo);
        router.refresh();
      } catch {
        setError(isAr ? "حدث خطأ، يرجى المحاولة مجددًا" : "Something went wrong, please try again");
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError(isAr ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name: firstName || email.split("@")[0] }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          setError(data.message ?? (isAr ? "تعذّر إنشاء الحساب. ربما البريد الإلكتروني مستخدم بالفعل." : "Failed to create account. Email may already be in use."));
          return;
        }
        // Auto sign-in after register
        await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        router.push(returnTo);
        router.refresh();
      } catch {
        setError(isAr ? "حدث خطأ، يرجى المحاولة مجددًا" : "Something went wrong, please try again");
      }
    });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forget-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, redirectTo: `${window.location.origin}/${locale}/auth/reset-password` }),
        });
        if (!res.ok) {
          setError(isAr ? "تعذّر إرسال رسالة الاسترداد" : "Failed to send reset email");
          return;
        }
        setSuccess(isAr ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" : "Password reset link sent to your email");
      } catch {
        setError(isAr ? "حدث خطأ، يرجى المحاولة مجددًا" : "Something went wrong, please try again");
      }
    });
  };

  const inputClass =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div
          className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm space-y-6"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Mode tabs */}
          <div className="flex rounded-xl overflow-hidden border border-border/60">
            <button
              type="button"
              onClick={() => resetState("signin")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {isAr ? "دخول" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => resetState("register")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {isAr ? "إنشاء حساب" : "Register"}
            </button>
          </div>

          {/* Sign In */}
          {mode === "signin" && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-foreground">
                  {isAr ? "مرحباً بعودتك" : "Welcome back"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isAr ? "سجّل دخولك للمتابعة إلى LivingSyria" : "Sign in to continue to LivingSyria"}
                </p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
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
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => resetState("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {isPending ? (isAr ? "جارٍ الدخول…" : "Signing in…") : (isAr ? "دخول" : "Sign In")}
                </button>
              </form>
            </>
          )}

          {/* Register */}
          {mode === "register" && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-foreground">
                  {isAr ? "إنشاء حساب جديد" : "Create an account"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isAr ? "انضم إلى مجتمع LivingSyria" : "Join the LivingSyria community"}
                </p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    {isAr ? "الاسم (اختياري)" : "Name (optional)"}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isAr ? "اسمك" : "Your name"}
                    className={inputClass}
                  />
                </div>
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
                    className={inputClass}
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
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {isPending ? (isAr ? "جارٍ الإنشاء…" : "Creating account…") : (isAr ? "إنشاء الحساب" : "Create account")}
                </button>
              </form>
            </>
          )}

          {/* Forgot password */}
          {mode === "forgot" && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-foreground">
                  {isAr ? "استعادة كلمة المرور" : "Reset password"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isAr ? "أدخل بريدك الإلكتروني وسنرسل لك رابط الاسترداد" : "Enter your email and we'll send a reset link"}
                </p>
              </div>
              {success ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 text-sm text-center">
                  {success}
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
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
                      className={inputClass}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {isPending ? (isAr ? "جارٍ الإرسال…" : "Sending…") : (isAr ? "إرسال رابط الاسترداد" : "Send reset link")}
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => resetState("signin")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                {isAr ? "← العودة إلى تسجيل الدخول" : "← Back to sign in"}
              </button>
            </>
          )}

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
