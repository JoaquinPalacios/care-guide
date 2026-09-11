import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  aftercarePageMetadata,
  AFTERCARE_ROBOTS,
  tenantGuideDescription,
  tenantGuideDocumentTitle,
} from "@/lib/aftercare/tenant-metadata";
import {
  CONTACT_METADATA,
  HOME_METADATA,
  marketingPageMetadata,
  PRICING_METADATA,
} from "@/lib/marketing/metadata";
import { marketingSiteOrigin } from "@/lib/marketing/site";
import { sanitizeMetadataText } from "@/lib/seo/metadata-text";
import {
  INDEXABLE_ROBOTS,
  PRIVATE_ROBOTS,
  ROBOTS_DISALLOW_INTERNAL,
  TENANT_LAUNCH_ROBOTS,
} from "@/lib/seo/robots-policy";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("launch SEO policy", () => {
  it("keeps marketing pages indexable with canonical and social metadata", () => {
    const home = marketingPageMetadata(HOME_METADATA, {
      pathname: "/",
      absoluteTitle: true,
    });
    const pricing = marketingPageMetadata(PRICING_METADATA, {
      pathname: "/pricing",
    });
    const contact = marketingPageMetadata(CONTACT_METADATA, {
      pathname: "/contact",
    });

    expect(home.robots).toEqual(INDEXABLE_ROBOTS);
    expect(home.alternates?.canonical).toBe(`${marketingSiteOrigin()}/`);
    expect(home.openGraph?.url).toContain("http://");
    expect(pricing.robots).toEqual(INDEXABLE_ROBOTS);
    expect(pricing.alternates?.canonical).toBe(
      `${marketingSiteOrigin()}/pricing`
    );
    expect(pricing.openGraph?.title).toContain("Pricing");
    expect(contact.alternates?.canonical).toBe(
      `${marketingSiteOrigin()}/contact`
    );
    expect(JSON.stringify(contact.twitter)).toContain('"card":"summary"');
  });

  it("marks staff, operator, and authenticated preview as private", () => {
    expect(PRIVATE_ROBOTS).toEqual({ index: false, follow: false });
  });

  it("keeps tenant patient pages noindex with shareable follow and resolved copy", () => {
    expect(AFTERCARE_ROBOTS).toEqual(TENANT_LAUNCH_ROBOTS);
    expect(TENANT_LAUNCH_ROBOTS).toEqual({ index: false, follow: true });

    expect(
      tenantGuideDocumentTitle(
        "Tooth Extraction",
        "Riverside Dental",
        "AFTERCARE"
      )
    ).toBe("Tooth Extraction Aftercare | Riverside Dental");
    expect(
      tenantGuideDescription(
        "Tooth Extraction",
        "Riverside Dental",
        "AFTERCARE"
      )
    ).toBe(
      "Aftercare instructions for tooth extraction from Riverside Dental."
    );

    const metadata = aftercarePageMetadata({
      title: "Tooth Extraction Aftercare | Riverside Dental",
      description:
        "Aftercare instructions for tooth extraction from Riverside Dental.",
      siteName: "Riverside Dental",
      canonicalUrl: "http://riverside.example/extraction",
    });
    expect(metadata.robots).toEqual(TENANT_LAUNCH_ROBOTS);
    expect(metadata.alternates?.canonical).toBe(
      "http://riverside.example/extraction"
    );
    expect(metadata.openGraph?.url).toBe("http://riverside.example/extraction");
  });

  it("strips raw HTML from metadata strings", () => {
    expect(sanitizeMetadataText("<script>alert(1)</script>Safe title")).toBe(
      "Safe title"
    );
    expect(
      tenantGuideDocumentTitle(
        "<b>Tooth Extraction</b>",
        "Riverside Dental",
        "AFTERCARE"
      )
    ).toBe("Tooth Extraction Aftercare | Riverside Dental");
  });

  it("lists only public marketing URLs in the launch sitemap", () => {
    const previousRoot = process.env.CARE_GUIDE_ROOT_DOMAIN;
    const previousBase = process.env.CARE_GUIDE_METADATA_BASE;
    process.env.CARE_GUIDE_ROOT_DOMAIN = "localhost";
    delete process.env.CARE_GUIDE_METADATA_BASE;
    try {
      const urls = sitemap().map((entry) => entry.url);
      expect(urls).toEqual([
        "http://localhost/",
        "http://localhost/pricing",
        "http://localhost/contact",
      ]);
      expect(urls.join(" ")).not.toContain("/dashboard");
      expect(urls.join(" ")).not.toContain("/guides");
      expect(urls.join(" ")).not.toContain("/operator");
      expect(urls.join(" ")).not.toContain("/_sites");
      expect(urls.join(" ")).not.toContain("demodental");
    } finally {
      restore("CARE_GUIDE_ROOT_DOMAIN", previousRoot);
      restore("CARE_GUIDE_METADATA_BASE", previousBase);
    }
  });

  it("allows marketing and disallows authenticated internal surfaces in robots.txt", () => {
    const document = robots();
    expect(document.rules).toMatchObject({
      allow: ["/", "/pricing", "/contact"],
      disallow: expect.arrayContaining([
        ...ROBOTS_DISALLOW_INTERNAL,
        "/operator",
        "/guides",
        "/practice",
      ]),
    });
  });

  it("keeps staff, operator, and draft preview metadata private in source", () => {
    const staff = readFileSync("app/(staff)/layout.tsx", "utf8");
    const operator = readFileSync("app/(staff)/(operator)/layout.tsx", "utf8");
    const preview = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/page.tsx",
      "utf8"
    );
    expect(staff).toContain("PRIVATE_ROBOTS");
    expect(operator).toContain("staffAppScroller");
    expect(preview).toContain("PRIVATE_ROBOTS");
    expect(preview).not.toContain("canonical");
  });
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
