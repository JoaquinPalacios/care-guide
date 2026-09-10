import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { MarketingNavMenu } from "@/app/(marketing)/components/marketing-nav-menu";

describe("marketing mobile navigation", () => {
  it("puts Pricing, Contact, Staff sign in, and Theme inside the site menu", () => {
    const html = renderToStaticMarkup(
      <MarketingNavMenu
        staffHref="http://app.localhost:3000/login"
        items={[
          { href: "/pricing", label: "Pricing" },
          { href: "/contact", label: "Contact", current: true },
        ]}
      />
    );

    expect(html).toContain("Site menu");
    expect(html).toContain("Pricing");
    expect(html).toContain("Contact");
    expect(html).toContain("Staff sign in");
    expect(html).toContain("http://app.localhost:3000/login");
    expect(html).toContain("Theme");
    expect(html).toContain("System");
    expect(html).toContain("navMenuRow");
    expect(html).not.toContain("How it works");
    expect(html).not.toContain("Clinic preview");
  });

  it("uses full-row menu interaction styles with a 48px minimum height", () => {
    const styles = readFileSync("app/(marketing)/marketing.module.css", "utf8");

    expect(styles).toContain(".navMenuRow");
    expect(styles).toContain("min-height: 3.05rem");
    expect(styles).toContain("width: 100%");
    expect(styles).toContain("@media (hover: hover) and (pointer: fine)");
    expect(styles).toContain(".navMenuRow:focus-visible");
    expect(styles).toContain(".navMenuRow:active");
    expect(styles).toContain(".navStaff");
    expect(styles).toContain(".navTheme");
    expect(styles).toContain("display: none");
    expect(styles).not.toContain(".navMenuLink");
  });
});
