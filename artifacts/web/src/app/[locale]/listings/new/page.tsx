import type { Metadata } from "next";
import { PostListingForm } from "./_form";

export const metadata: Metadata = {
  title: "إضافة إعلان — Post an Ad",
};

export default function PostListingPage() {
  return <PostListingForm />;
}
