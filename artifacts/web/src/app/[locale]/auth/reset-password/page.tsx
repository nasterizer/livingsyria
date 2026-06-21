import type { Metadata } from "next";
import { ResetPasswordForm } from "./_reset-form";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور — Reset Password",
};

interface Props {
  params: { locale: string };
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ params, searchParams }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const token = searchParams.token ?? "";
  return <ResetPasswordForm locale={locale} token={token} />;
}
