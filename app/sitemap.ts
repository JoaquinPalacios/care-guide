import type { MetadataRoute } from "next";

import { marketingSiteOrigin } from "@/lib/marketing/site";
import { buildMarketingSitemap } from "@/lib/seo/sitemap";
import type { MarketingSeoPath } from "@/lib/seo/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = marketingSiteOrigin();
  let lastModifiedByPath: Partial<Record<MarketingSeoPath, Date>> = {};

  try {
    const { getSitemapLastModifiedByPath } =
      await import("@/lib/seo/load-platform-seo");
    lastModifiedByPath = await getSitemapLastModifiedByPath();
  } catch {
    lastModifiedByPath = {};
  }

  return buildMarketingSitemap({ origin, lastModifiedByPath });
}
