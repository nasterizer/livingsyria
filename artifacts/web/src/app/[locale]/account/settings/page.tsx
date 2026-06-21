import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { AccountSettingsClient } from "./_client";

export const metadata: Metadata = {
  title: "إعدادات الحساب — Account Settings",
};

interface Props {
  params: { locale: string };
}

export default async function AccountSettingsPage({ params }: Props) {
  const user = await getServerUser();
  if (!user) {
    const locale = params.locale === "en" ? "en" : "ar";
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/account/settings`)}`,
    );
  }
  return <AccountSettingsClient />;
}
