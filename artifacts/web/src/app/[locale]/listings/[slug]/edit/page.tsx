import { redirect, notFound } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { apiFetch } from "@/lib/api";
import { EditListingForm } from "./_edit-form";

type Listing = {
  id: string;
  slug: string;
  userId: string;
  categoryId: string;
  titleAr: string;
  titleEn?: string | null;
  descriptionAr: string;
  descriptionEn?: string | null;
  priceCents?: number | null;
  currency: string;
  isFree: boolean;
  isNegotiable: boolean;
  city: string;
  district?: string | null;
  status: string;
};

interface Props {
  params: { locale: string; slug: string };
}

export default async function EditListingPage({ params }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const user = await getServerUser();

  if (!user) {
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/listings/${params.slug}/edit`)}`,
    );
  }

  let listing: Listing;
  try {
    const res = await apiFetch<{ data: Listing }>(
      `/api/listings/${params.slug}`,
      { cache: "no-store" },
    );
    listing = res.data;
  } catch {
    notFound();
  }

  if (listing.userId !== user.id) {
    redirect(`/${locale}/listings/${params.slug}`);
  }

  return <EditListingForm listing={listing} />;
}
