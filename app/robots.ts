import type { MetadataRoute } from "next";

import { marketingSiteOrigin } from "@/lib/marketing/site";
import { ROBOTS_DISALLOW_INTERNAL } from "@/lib/seo/robots-policy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/contact"],
      disallow: [...ROBOTS_DISALLOW_INTERNAL],
    },
    sitemap: `${marketingSiteOrigin()}/sitemap.xml`,
  };
}
