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

  beforeEach(() => {
    process.env.CARE_GUIDE_ROOT_DOMAIN = "localhost";
  });

  afterEach(() => {
    if (previousRoot === undefined) {
      delete process.env.CARE_GUIDE_ROOT_DOMAIN;
    } else {
      process.env.CARE_GUIDE_ROOT_DOMAIN = previousRoot;
    }
  });

  it("is a concise conversion page with a real enquiry form", async () => {
    const html = renderToStaticMarkup(await MarketingContactPage());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Bring your aftercare online without losing your");
    expect(html).toContain('data-mk-page-hero="contact"');
    expect(html).toContain("mkPageWaveContact");
    expect(html).toContain("Send an enquiry");
    expect(html).toContain('name="fullName"');
    expect(html).toContain('name="workEmail"');
    expect(html).toContain('name="clinicName"');
    expect(html).toContain('name="locationCount"');
    expect(html).toContain('name="phone"');
    expect(html).toContain("Anything you&#x27;d like us to know?");
    expect(html).toContain(
      "Please don&#x27;t include patient or clinical information."
    );
    expect(html).toContain("Send enquiry");
    expect(html).toContain('name="website"');
    expect(html).toContain("optional");
    expect(html).not.toContain("Who it's for");
    expect(html).not.toContain("What happens next");
    expect(html).not.toContain("What we'll set up");
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("Thanks — your enquiry has been sent.");
    expect(html).not.toContain("patient date of birth");
    expect(html).not.toContain("specialty");
    expect(html).not.toContain("password");
    expect(html).not.toContain("/_marketing");
    expect(html).not.toContain("/_sites");
    expect(html).not.toContain("Call Riverside Dental Demo");
  });
});
