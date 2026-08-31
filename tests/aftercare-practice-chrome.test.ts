import { describe, expect, it } from "vitest";

import { DEMO_AFTERCARE_NOTICE } from "@/lib/aftercare/demo-tenant";
import { resolvePracticeChrome } from "@/lib/aftercare/practice-chrome";

const PROFILE = {
  displayName: "Riverside Dental Demo",
  logoUrl: "/demo/riverside-mark.svg",
  phone: "02 5550 0100",
  bookingUrl: "https://www.example.com/riverside-dental-demo/book",
  contactUrl: "https://www.example.com/riverside-dental-demo/contact",
  emergencyInstructions: "Call the demo clinic during hours.",
  showCareGuideAttribution: true,
};

describe("resolvePracticeChrome", () => {
  it("maps a complete demo profile onto patient chrome", () => {
    const chrome = resolvePracticeChrome({
      slug: "demodental",
      name: "Rivers Care Demo Clinic",
      profile: PROFILE,
    });

    expect(chrome.displayName).toBe("Riverside Dental Demo");
    expect(chrome.logoSrc).toBe("/demo/riverside-mark.svg");
    expect(chrome.phoneHref).toBe("tel:0255500100");
    expect(chrome.bookingHref).toBe(
      "https://www.example.com/riverside-dental-demo/book"
    );
    expect(chrome.contactHref).toBe(
      "https://www.example.com/riverside-dental-demo/contact"
    );
    expect(chrome.emergencyInstructions).toBe(
      "Call the demo clinic during hours."
    );
    expect(chrome.showCareGuideAttribution).toBe(true);
    expect(chrome.showDemoNotice).toBe(true);
    expect(DEMO_AFTERCARE_NOTICE).toContain("not clinical advice");
  });

  it("omits optional fields when they are missing or unsafe", () => {
    const chrome = resolvePracticeChrome({
      slug: "otherclinic",
      name: "Other Clinic",
      profile: {
        displayName: "Other Clinic Patient Brand",
        logoUrl: "https://evil.test/logo.png",
        phone: null,
        bookingUrl: "javascript:alert(1)",
        contactUrl: null,
        emergencyInstructions: "   ",
        showCareGuideAttribution: false,
      },
    });

    expect(chrome.displayName).toBe("Other Clinic Patient Brand");
    expect(chrome.logoSrc).toBeNull();
    expect(chrome.phoneHref).toBeNull();
    expect(chrome.bookingHref).toBeNull();
    expect(chrome.contactHref).toBeNull();
    expect(chrome.emergencyInstructions).toBeNull();
    expect(chrome.showCareGuideAttribution).toBe(false);
    expect(chrome.showDemoNotice).toBe(false);
  });

  it("falls back to the clinic name when the profile is missing", () => {
    const chrome = resolvePracticeChrome({
      slug: "otherclinic",
      name: "Other Clinic",
      profile: null,
    });

    expect(chrome.displayName).toBe("Other Clinic");
    expect(chrome.showCareGuideAttribution).toBe(false);
    expect(chrome.showDemoNotice).toBe(false);
  });
});
