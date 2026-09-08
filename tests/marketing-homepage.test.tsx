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

    expect(html).toContain("Aftercare Guide");
    expect(html).toContain("Aftercare platform");
    expect(html).not.toContain("Clinic-branded aftercare");
    expect(html).not.toContain("THE AFTERCARE PLATFORM");
    expect(html).toContain("Aftercare that still feels like your clinic.");
    expect(html).toContain("always leave with clarity.");
    expect(html).toContain("Paper");
    expect(html).toContain("PDFs");
    expect(html).toContain("How it works");
    expect(html).toContain("Apply clinic brand");
    expect(html).toContain("View the clinic demo");
    expect(html).toContain("Early access");
    expect(html).toContain("Change colour theme");
    expect(html).toContain("Branded aftercare patients can revisit.");
    expect(html).toContain("Staff sign in");
    expect(html).not.toContain("Book an appointment");
    expect(html).toContain("http://demodental.localhost:3000/");
    expect(html).toContain("http://app.localhost:3000/login");
    expect(html).toContain("Riverside Dental Demo");
    expect(html).toContain("heroTitleBlock");
    expect(html).toContain("heroEyebrow");
    expect(html).toContain("heroTitle");
    expect(html).toContain("heroBody");
    expect(html).toContain("heroActions");
    expect(html).toContain("heroLower");
    expect(html).toContain("heroFrame");
    expect(html).toContain("deviceStage");
    expect(html).toContain("phoneShell");
    expect(html).toContain("phoneScreen");
    expect(html).toContain("phoneFrame");
    expect(html).toContain("/marketing/iphone-frame.webp");
    expect(html).not.toContain("phoneBezel");
    expect(html).not.toContain("phoneIsland");
    expect(html).not.toContain("phoneGlass");
    expect(html).not.toContain("phonePreview");
    expect(html).not.toContain("desktopPreview");
    expect(html).not.toContain("mobilePreview");
    expect(html).not.toContain("Recovery guides");
    expect(html).not.toContain("Recovery guide");
    expect(html).toContain("Your recovery");
    expect(html).toContain("Step-by-step guidance after treatment.");
    expect(html).toContain("Need help?");
    expect(html).toContain("Call Riverside Dental");
    expect(html).toContain("navAnchor");
    expect(html).toContain("navStaff");
    expect(html).toContain("Tooth Extraction");
    expect(html).toContain("Post-treatment instructions");
    expect(html).not.toContain("Dental Implant");
    expect(html).not.toContain("Root Canal");
    expect(html).toContain("Immediate care");
    expect(html).toContain("Early recovery");
    expect(html).toContain("Healing check");
    expect(html).toContain("First few hours");
    expect(html).toContain("Days 2–3");
    expect(html).toContain("Days 4–7");
    expect(html).toMatch(/deviceStage[^>]*aria-hidden="true"/);
    expect(html).toContain('focusable="false"');
    expect(html).toContain("linearGradient");
    expect(html).toContain("feGaussianBlur");
    expect(html).toContain('src="/marketing/iphone-frame.webp"');
    expect(html).toMatch(/fetch[Pp]riority="low"/);
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).not.toContain("patient PIN");
    expect(html).not.toContain("treatment ID");
    expect(html).not.toContain("date of birth");
    expect(html).not.toContain("Aftercare Rx");
    expect(html).not.toContain("Powered by Care Guide");
    expect(html).not.toContain("Internal staff workspace");
    expect(html).not.toContain("/_marketing");
    expect(html).not.toContain("/_sites");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("<main");
    expect(html).toMatch(/<\/main>[\s\S]*<footer/);
    expect(html).toContain("marketingBase");
    expect(html).toContain("marketingSoft");
    expect(html).toContain("marketingShowcase");
    expect(html).toContain("marketingClosing");
    expect(html).not.toContain("surfaceBase");
    expect(html).not.toContain("surfaceSubtle");
    expect(html).not.toContain("surfaceContrast");
    expect(html).not.toContain("surfaceBrand");
    expect(html).not.toContain("chapterRule");
    expect(html).toContain("data-mk-chapter");
    expect(html).toContain("aria-hidden");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("opacity: 0");
    expect(html).not.toContain("framer-motion");
    expect(html).not.toContain('from "motion');
    expect(html).not.toContain("use client");
  });
});
