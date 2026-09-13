import type { Metadata } from "next";

import { buildMarketingJsonLdGraph } from "@/lib/seo/json-ld";
import {
  marketingSeoToMetadata,
  resolveMarketingSeo,
} from "@/lib/seo/resolve-marketing-seo";
import type { MarketingSeoPath, ResolvedMarketingSeo } from "@/lib/seo/types";

export async function loadResolvedMarketingSeo(
  path: MarketingSeoPath
): Promise<ResolvedMarketingSeo> {
  try {
    const { loadMarketingPageSeo, loadPlatformSeoIdentity } =
      await import("@/lib/seo/load-platform-seo");
    const [platform, page] = await Promise.all([
      loadPlatformSeoIdentity(),
      loadMarketingPageSeo(path),
    ]);
    return resolveMarketingSeo({ path, platform, page });
  } catch {
    return resolveMarketingSeo({ path });
  }
}

export async function generateMarketingMetadata(
  path: MarketingSeoPath
): Promise<Metadata> {
  const resolved = await loadResolvedMarketingSeo(path);
  return marketingSeoToMetadata(resolved);
}

export async function loadMarketingJsonLd(path: MarketingSeoPath) {
  const resolved = await loadResolvedMarketingSeo(path);
  return buildMarketingJsonLdGraph(resolved);
}
