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
    expect(html).not.toContain("THE AFTERCARE PLATFORM");
    expect(html).toContain("Aftercare that still feels like your clinic.");
    expect(html).toContain("always leave with clarity.");
    expect(html).toContain("Paper");
    expect(html).toContain("PDFs");
    expect(html).toContain("How it works");
    expect(html).toContain("Apply clinic brand");
    expect(html).toContain("data-mk-process");
    expect(html).toContain("data-mk-process-rail");
    expect(html).toContain("data-mk-process-card");
    expect(html).toContain("data-mk-pillars");
    expect(html).toContain("data-mk-pillar");
    expect(html).toContain("data-mk-custom-strip");
    expect(html).not.toContain("data-mk-bento");
    expect(html).not.toContain("data-mk-bento-card");
    expect(html).toContain("Looks like your clinic");
    expect(html).toContain("Built for patients");
    expect(html).toContain("Simple to operate");
    expect(html).toContain("data-mk-product-copy");
    expect(html).toContain("data-mk-product-visual");
    expect(html).toContain("data-mk-process-connector");
    expect(html.indexOf("data-mk-product-copy")).toBeLessThan(
      html.indexOf("data-mk-product-canvas")
    );
    expect(html).toContain("Your name, colours and terminology stay front");
    expect(html).toContain("Controlled brand choices");
    expect(html).toContain("Clinic-first presentation");
    expect(html).toContain("Clear aftercare designed to be reopened");
    expect(html).toContain("Durable link");
    expect(html).toContain("Practice contact nearby");
    expect(html).toContain(
      "Enable reviewed guides instead of building pages from scratch."
    );
    expect(html).toContain("Choose relevant guides");
    expect(html).toContain("Keep content consistent");
    expect(html).not.toContain("not a generic platform shell");
    expect(html).not.toContain(
      "Keep approved content consistent across every published guide."
    );
    expect(html).toContain("Controlled customisation");
    expect(html).toContain("Approved guide");
    expect(html).toContain("Clinic brand");
    expect(html).toContain("A branded patient aftercare page");
    expect(html).toContain("data-mk-product-canvas");
    expect(html).toContain("data-mk-patient-preview");
    expect(html).toContain("Patient view");
    expect(html).toContain("Brand flexibility");
    expect(html).not.toContain("Brand directions");
    expect(html).toContain("No login, no feed");
    expect(html).toContain("riverside.[your-domain]/extraction");
    expect(html).toContain("Call the practice");
    expect(html).toContain("Dental Implant");
    expect(html).toContain("Root Canal");
    expect(html).not.toMatch(/<a[^>]*>Dental Implant/);
    expect(html).not.toMatch(/<a[^>]*>Root Canal/);
    expect(html).not.toMatch(/<h[1-6][^>]*>Tooth Extraction/);
    expect(html).toContain("<ol");
    expect(html).toContain("View the clinic demo");
    expect(html).toContain("Request a demo");
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="/pricing"');
    expect(html).toContain("Pricing");
    expect(html).toContain(">Contact<");
    expect(html).toContain("Site menu");
    expect(html).not.toContain("Early access");
    expect(html).not.toContain("earlyAccessLayout");
    expect(html).not.toContain("Design partner");
    expect(html).not.toContain("validate together");
    expect(html).not.toContain("Guide setup");
    expect(html).not.toContain("Clinic branding");
    expect(html).not.toContain("Patient handoff");
    expect(html).not.toContain("early development");
    expect(html).not.toContain("small number of clinics");
    expect(html).not.toContain("#early-access");
    expect(html).not.toContain("See it in practice");
    expect(html).not.toContain("See the patient experience for yourself.");
    expect(html).toContain("Bring your aftercare online.");
    expect(html).toContain("closingCta");
    expect(html).toContain('id="see-it"');
    expect(html).not.toContain("Lead capture is not on this page yet.");
    expect(html).not.toContain("provisional commercial name");
    expect(html).not.toContain("Pricing is not locked.");
    expect(html).not.toContain("not a dashboard in this release");
    expect(html).not.toContain("not in this release");
    expect(html).not.toContain("arbitrary CSS");
    expect(html).not.toContain("phone-sized layout");
    expect(html).not.toContain("Open staff sign in");
    expect(html).not.toContain("Request access");
    expect(html).not.toContain("Contact us");
    expect(html).toContain("Change colour theme");
    expect(html).toContain("Clinic-branded aftercare patients can revisit.");
    expect(html).toContain("See what patients actually receive");
    expect(html).toContain("Family dental");
    expect(html).not.toContain("Family practice");
    expect(html).toContain("Choose a visual tone that feels at home");
    expect(html).toContain("Staff sign in");
    expect(html.match(/Staff sign in/g)).toHaveLength(2);
    expect(html).toContain("footerSeparator");
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
    expect(html).toContain("navRoute");
    expect(html).not.toContain("navAnchor");
    expect(html).toContain("navStaff");
    expect(html).toContain("Tooth Extraction");
    expect(html).toContain("Post-treatment instructions");
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
    expect(html).not.toContain("productEquation");
    expect(html).not.toContain("blendToShowcase");
    expect(html).not.toContain("blendToClosing");
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
