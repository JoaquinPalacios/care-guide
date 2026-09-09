import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getMarketingContactEmail,
  marketingEnquiryMailto,
} from "@/lib/marketing/contact-email";
import { HOME_METADATA, PRICING_METADATA } from "@/lib/marketing/metadata";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("marketing contact email", () => {
  const previous = process.env.MARKETING_CONTACT_EMAIL;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.MARKETING_CONTACT_EMAIL;
    } else {
      process.env.MARKETING_CONTACT_EMAIL = previous;
    }
  });

  it("accepts a configured address and builds a useful mailto", () => {
    expect(getMarketingContactEmail("hello@example.test")).toBe(
      "hello@example.test"
    );
    expect(marketingEnquiryMailto("hello@example.test")).toContain(
      "mailto:hello@example.test?subject="
    );
    expect(marketingEnquiryMailto("hello@example.test")).toContain(
      "clinic%20enquiry"
    );
  });

  it("rejects missing or malformed values", () => {
    expect(getMarketingContactEmail(undefined)).toBeNull();
    expect(getMarketingContactEmail("not-an-email")).toBeNull();
    expect(getMarketingContactEmail("hello@example")).toBeNull();
  });
});

describe("marketing crawl files", () => {
  const previousRoot = process.env.CARE_GUIDE_ROOT_DOMAIN;
  const previousBase = process.env.CARE_GUIDE_METADATA_BASE;

  beforeEach(() => {
    process.env.CARE_GUIDE_ROOT_DOMAIN = "localhost";
    delete process.env.CARE_GUIDE_METADATA_BASE;
  });

  afterEach(() => {
    if (previousRoot === undefined) {
      delete process.env.CARE_GUIDE_ROOT_DOMAIN;
    } else {
      process.env.CARE_GUIDE_ROOT_DOMAIN = previousRoot;
    }

    if (previousBase === undefined) {
      delete process.env.CARE_GUIDE_METADATA_BASE;
    } else {
      process.env.CARE_GUIDE_METADATA_BASE = previousBase;
    }
  });

  it("lists only public platform routes", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "http://localhost/",
      "http://localhost/pricing",
      "http://localhost/contact",
    ]);
    expect(urls.join(" ")).not.toContain("/_marketing");
    expect(urls.join(" ")).not.toContain("/_sites");
  });

  it("allows public marketing pages and blocks internal rewrites", () => {
    const document = robots();
    expect(document.rules).toMatchObject({
      allow: ["/", "/pricing", "/contact"],
      disallow: expect.arrayContaining(["/_marketing", "/_sites"]),
    });
    expect(document.sitemap).toBe("http://localhost/sitemap.xml");
    expect(HOME_METADATA.title).toContain("Branded patient aftercare");
    expect(PRICING_METADATA.title).toBe("Pricing");
  });
});
