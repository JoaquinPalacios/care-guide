import { describe, expect, it } from "vitest";

import { DEFAULT_PLATFORM_SEO } from "@/lib/seo/defaults";
import { isDedicatedOgImageConfigured } from "@/lib/seo/og-policy";
import {
  marketingSeoToMetadata,
  resolveMarketingSeo,
  resolveSocialMetadata,
} from "@/lib/seo/resolve-marketing-seo";

describe("marketing SEO resolution", () => {
  it("falls back to product defaults when no settings row exists", () => {
    const home = resolveMarketingSeo({
      path: "/",
      origin: "https://example.test",
    });
    expect(home.title).toContain("River Aftercare");
    expect(home.canonicalUrl).toBe("https://example.test/");
    expect(home.robots).toEqual({ index: true, follow: true });
    expect(home.identity.sameAsUrls).toEqual([]);
    expect(home.identity.publicContactEmail).toBeNull();
  });

  it("uses page OG overrides, then page SEO, then platform defaults", () => {
    const pageOg = resolveSocialMetadata({
      page: {
        path: "/pricing",
        seoTitle: "Pricing",
        metaDescription: "Page description",
        ogTitle: "Share title",
        ogDescription: "Share description",
        ogImagePath: "/brand/custom-og.png",
        index: true,
        follow: true,
        updatedAt: null,
      },
      identity: {
        ...DEFAULT_PLATFORM_SEO,
        defaultOgImagePath: "/brand/platform-og.png",
      },
      resolvedTitle: "Pricing — River Aftercare",
      resolvedDescription: "Page description",
    });
    expect(pageOg).toEqual({
      title: "Share title",
      description: "Share description",
      imagePath: "/brand/custom-og.png",
      source: "page-og",
    });

    const pageSeo = resolveSocialMetadata({
      page: {
        path: "/pricing",
        seoTitle: "Pricing",
        metaDescription: "Page description",
        ogTitle: null,
        ogDescription: null,
        ogImagePath: null,
        index: true,
        follow: true,
        updatedAt: null,
      },
      identity: {
        ...DEFAULT_PLATFORM_SEO,
        defaultOgImagePath: "/brand/platform-og.png",
      },
      resolvedTitle: "Pricing — River Aftercare",
      resolvedDescription: "Page description",
    });
    expect(pageSeo.source).toBe("page-seo");
    expect(pageSeo.imagePath).toBe("/brand/platform-og.png");
  });

  it("does not emit a malformed image tag when no OG image exists", () => {
    const metadata = marketingSeoToMetadata(
      resolveMarketingSeo({
        path: "/contact",
        origin: "https://example.test",
      })
    );
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter).toMatchObject({ card: "summary" });
    expect(JSON.stringify(metadata)).not.toContain('"images":[]');
    expect(metadata.alternates?.canonical).toBe("https://example.test/contact");
  });

  it("does not treat the product logo as a dedicated OG image", () => {
    expect(
      isDedicatedOgImageConfigured("/brand/river-aftercare-logo.svg")
    ).toBe(false);
    expect(
      isDedicatedOgImageConfigured("/brand/river-aftercare-isologo.svg")
    ).toBe(false);
    expect(isDedicatedOgImageConfigured("/brand/river-aftercare-og.png")).toBe(
      true
    );
  });
});
