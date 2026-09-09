import type { MetadataRoute } from "next";

import { marketingSiteOrigin } from "@/lib/marketing/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/contact"],
      disallow: ["/_marketing", "/_sites", "/login", "/dashboard"],
    },
    sitemap: `${marketingSiteOrigin()}/sitemap.xml`,
  };
}
