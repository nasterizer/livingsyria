import type { Metadata } from "next";
import { LoginForm } from "./_login-form";

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
  return <LoginForm locale={locale} returnTo={returnTo} />;
}
