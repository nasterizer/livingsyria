import type { Metadata } from "next";
import { MyListingsClient } from "./_client";

export const metadata: Metadata = {
  title: "إعلاناتي — My Ads",
};

export default function MyListingsPage() {
  return <MyListingsClient />;
}
