import type { MetadataRoute } from "next";

import { marketingSiteOrigin } from "@/lib/marketing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = marketingSiteOrigin();

  return [
    {
      url: `${origin}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${origin}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
