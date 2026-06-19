import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { MyListingsClient } from "./_client";

export const metadata: Metadata = {
  title: "إعلاناتي — My Ads",
};

interface Props {
  params: { locale: string };
}

export default async function MyListingsPage({ params }: Props) {
  const user = await getServerUser();
  if (!user) {
    const locale = params.locale === "en" ? "en" : "ar";
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/account/listings`)}`,
    );
  }
  return <MyListingsClient />;
}
