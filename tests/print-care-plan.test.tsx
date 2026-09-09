import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getPublishedPracticeGuide, notFound } = vi.hoisted(() => ({
  getPublishedPracticeGuide: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  }),
}));

vi.mock("@/lib/aftercare/get-published-practice-guide", () => ({
  getPublishedPracticeGuide,
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      host: "demodental.localhost:3000",
      "x-forwarded-proto": "http",
    }),
}));

import PrintPage from "@/app/(aftercare)/%5Fsites/[tenant]/[guideSlug]/print/page";
import TenantGuidePage from "@/app/(aftercare)/%5Fsites/[tenant]/[guideSlug]/page";

const PUBLISHED_AT = new Date("2026-08-31T00:00:00.000Z");

const SECTIONS = [
  {
    key: "introduction",
    kind: "INTRODUCTION" as const,
    title: "After your extraction",
    body: "Follow the stages in order.",
    periodLabel: null,
    provenance: "canonical" as const,
  },
  {
    key: "immediate-care",
    kind: "RECOVERY_TIMELINE" as const,
    title: "Immediate care",
    body: "Keep the site still.",
    periodLabel: "First few hours",
    provenance: "canonical" as const,
  },
  {
    key: "first-24-hours",
    kind: "RECOVERY_TIMELINE" as const,
    title: "Protect the healing site",
    periodLabel: "Today / first 24 hours",
    provenance: "canonical" as const,
    body: "Leave the site undisturbed today.",
  },
  {
    key: "what-is-normal",
    kind: "WHAT_IS_NORMAL" as const,
    title: "What's normal",
    body: "Mild swelling can be expected.",
    periodLabel: null,
    provenance: "canonical" as const,
  },
];

const DOCUMENT = {
  clinic: {
    id: "clinic_demo_rivers",
    slug: "demodental",
    name: "Rivers Care Demo Clinic",
  },
  profile: {
    displayName: "Riverside Dental Demo",
    logoUrl: "/demo/riverside-mark.svg",
    primaryColor: "#0f766e",
    accentColor: "#f59e0b",
    phone: "02 5550 0100",
    addressLine1: "12 Riverside Demo Street",
    addressLine2: null,
    city: "Sydney",
    region: "NSW",
    postalCode: "2000",
    country: "AU",
    bookingUrl: "https://www.example.com/riverside-dental-demo/book",
    contactUrl: "https://www.example.com/riverside-dental-demo/contact",
    contactEmail: "hello@riverside-dental-demo.example",
    emergencyInstructions: "Call the clinic during hours.",
    showCareGuideAttribution: true,
    instructionTerminology: "POST_TREATMENT",
    themeMode: "SYSTEM",
    allowPatientThemeToggle: true,
  },
  template: {
    id: "guide_tmpl_demo_extraction",
    slug: "extraction",
    title: "Tooth Extraction",
    specialty: "DENTAL",
  },
  practiceGuide: {
    id: "practice_guide_demo_rivers_extraction",
    publicSlug: "extraction",
    publishedAt: PUBLISHED_AT,
  },
  revision: {
    id: "guide_rev_demo_extraction_v1",
    version: 1,
    reviewedAt: PUBLISHED_AT,
  },
  sections: SECTIONS,
};

describe("printable care plan", () => {
  beforeEach(() => {
    getPublishedPracticeGuide.mockReset();
    notFound.mockClear();
  });

  it("derives print content from the same resolved guide as the web page", async () => {
    getPublishedPracticeGuide.mockResolvedValue(DOCUMENT);

    const web = renderToStaticMarkup(
      await TenantGuidePage({
        params: Promise.resolve({
          tenant: "demodental",
          guideSlug: "extraction",
        }),
      })
    );
    const print = renderToStaticMarkup(
      await PrintPage({
        params: Promise.resolve({
          tenant: "demodental",
          guideSlug: "extraction",
        }),
      })
    );

    expect(print).toContain("Tooth Extraction");
    expect(print).toContain("Riverside Dental Demo");
    expect(print).toContain("After your extraction");
    expect(print).toContain("Follow the stages in order.");
    expect(print).toContain("Immediate care");
    expect(print).toContain("Keep the site still.");
    expect(print).toContain("SAMPLE / NOT CLINICAL ADVICE");
    expect(print).toContain("Powered by Aftercare Guide");
    expect(print).not.toContain('role="tablist"');
    expect(print).not.toContain("Check-in");
    expect(print).not.toContain("How are you feeling today?");
    expect(print).not.toContain("Change colour theme");
    expect(print).toContain("data-print-care-plan");
    expect(print).not.toContain("date of birth");
    expect(print).not.toContain("PIN");
    expect(print).not.toContain("patient name");
    expect(web).toContain("Leave the site undisturbed today.");
    expect(print).toContain("Leave the site undisturbed today.");
  });
});
