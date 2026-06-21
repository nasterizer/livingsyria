import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/admin",
          "/*/account",
          "/api",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
