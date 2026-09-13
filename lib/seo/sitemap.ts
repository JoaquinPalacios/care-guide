import { MARKETING_SEO_PATHS, type MarketingSeoPath } from "@/lib/seo/types";
import { marketingCanonicalUrl } from "@/lib/seo/resolve-marketing-seo";

export interface MarketingSitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}

export function buildMarketingSitemap(input: {
  origin: string;
  paths?: readonly MarketingSeoPath[];
  lastModifiedByPath?: Partial<Record<MarketingSeoPath, Date>>;
}): MarketingSitemapEntry[] {
  const paths = input.paths ?? MARKETING_SEO_PATHS;
  return paths.map((path) => {
    const lastModified = input.lastModifiedByPath?.[path];
    return {
      url: marketingCanonicalUrl(path, input.origin),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.8,
      ...(lastModified ? { lastModified } : {}),
    };
  });
}
