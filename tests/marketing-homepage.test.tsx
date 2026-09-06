import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      host: "localhost:3000",
      "x-forwarded-proto": "http",
    }),
}));

import MarketingHomePage from "@/app/(marketing)/%5Fmarketing/page";

describe("marketing homepage", () => {
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

  it("explains the product and links to the demo tenant, not the staff console", async () => {
    const html = renderToStaticMarkup(await MarketingHomePage());

    expect(html).toContain("Care Guide");
    expect(html).toContain(
      "Post-operative instructions patients can actually follow"
    );
    expect(html).toContain("paper");
    expect(html).toContain("PDF");
    expect(html).toContain("How it works");
    expect(html).toContain("Apply clinic branding");
    expect(html).toContain("View the clinic demo");
    expect(html).toContain("http://demodental.localhost:3000/");
    expect(html).toContain("http://app.localhost:3000/login");
    expect(html).toContain("Riverside Dental Demo");
    expect(html).not.toContain("Internal staff workspace");
    expect(html).not.toContain("/_marketing");
    expect(html).not.toContain("/_sites");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("<main");
  });
});
