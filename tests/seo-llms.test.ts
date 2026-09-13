import { describe, expect, it } from "vitest";

import { DEFAULT_PLATFORM_SEO } from "@/lib/seo/defaults";
import { buildLlmsTxt, shouldPublishLlmsFull } from "@/lib/seo/llms-txt";
import { buildMarketingSitemap } from "@/lib/seo/sitemap";

describe("llms.txt", () => {
  it("lists only public marketing resources", () => {
    const body = buildLlmsTxt({
      identity: DEFAULT_PLATFORM_SEO,
      origin: "https://example.test",
    });
    expect(body).toContain("# River Aftercare");
    expect(body).toContain("https://example.test/");
    expect(body).toContain("https://example.test/pricing");
    expect(body).toContain("https://example.test/contact");
    expect(body).toContain("https://example.test/about");
    expect(body).not.toContain("/operator");
    expect(body).not.toContain("/login");
    expect(body).not.toContain("/dashboard");
    expect(body).not.toContain("certified");
    expect(shouldPublishLlmsFull(4)).toBe(false);
  });
});

describe("marketing sitemap builder", () => {
  it("includes marketing routes and omits invented timestamps", () => {
    const entries = buildMarketingSitemap({
      origin: "http://localhost",
    });
    expect(entries.map((entry) => entry.url)).toEqual([
      "http://localhost/",
      "http://localhost/pricing",
      "http://localhost/contact",
      "http://localhost/about",
    ]);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(
      true
    );
  });

  it("uses stored updatedAt when provided", () => {
    const updatedAt = new Date("2026-09-13T00:00:00.000Z");
    const entries = buildMarketingSitemap({
      origin: "http://localhost",
      lastModifiedByPath: { "/": updatedAt },
    });
    expect(entries[0]?.lastModified).toEqual(updatedAt);
    expect(entries[1]?.lastModified).toBeUndefined();
  });
});
