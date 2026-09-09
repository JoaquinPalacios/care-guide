import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      host: "localhost:3000",
      "x-forwarded-proto": "http",
    }),
}));

import MarketingContactPage from "@/app/(marketing)/%5Fmarketing/contact/page";

describe("marketing contact page", () => {
  const previousRoot = process.env.CARE_GUIDE_ROOT_DOMAIN;
  const previousEmail = process.env.MARKETING_CONTACT_EMAIL;

  beforeEach(() => {
    process.env.CARE_GUIDE_ROOT_DOMAIN = "localhost";
    process.env.MARKETING_CONTACT_EMAIL = "hello@example.test";
  });

  afterEach(() => {
    if (previousRoot === undefined) {
      delete process.env.CARE_GUIDE_ROOT_DOMAIN;
    } else {
      process.env.CARE_GUIDE_ROOT_DOMAIN = previousRoot;
    }

    if (previousEmail === undefined) {
      delete process.env.MARKETING_CONTACT_EMAIL;
    } else {
      process.env.MARKETING_CONTACT_EMAIL = previousEmail;
    }
  });

  it("is a platform sales page with a mailto, not a fake form", async () => {
    const html = renderToStaticMarkup(await MarketingContactPage());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Bring your aftercare online without losing your");
    expect(html).toContain("not Riverside Dental");
    expect(html).toContain("http://demodental.localhost:3000/");
    expect(html).toContain('href="/pricing"');
    expect(html).toContain("mailto:hello@example.test?subject=");
    expect(html).toContain("Aftercare%20Guide%20%E2%80%94%20clinic%20enquiry");
    expect(html).toContain("Email us");
    expect(html).not.toContain("<form");
    expect(html).not.toContain('type="submit"');
    expect(html).not.toContain("Thanks, we received");
    expect(html).not.toContain("/_marketing");
    expect(html).not.toContain("/_sites");
    expect(html).not.toContain("Call Riverside Dental Demo");
  });

  it("omits the mailto when no contact email is configured", async () => {
    delete process.env.MARKETING_CONTACT_EMAIL;
    const html = renderToStaticMarkup(await MarketingContactPage());

    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("<form");
    expect(html).toContain(
      "does not currently publish a clinic enquiry address"
    );
  });
});
