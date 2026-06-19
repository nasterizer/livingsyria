import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { PostListingForm } from "./_form";

export const metadata: Metadata = {
  title: "إضافة إعلان — Post an Ad",
};

interface Props {
  params: { locale: string };
}

export default async function PostListingPage({ params }: Props) {
  const user = await getServerUser();
  if (!user) {
    const locale = params.locale === "en" ? "en" : "ar";
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/listings/new`)}`,
    );
  }
  return <PostListingForm />;
}
