import { describe, expect, it } from "vitest";

import { clinicSetupChecks } from "@/lib/clinic-portal/setup-status";

const CONFIGURED = {
  displayName: "Riverside Dental Demo",
  logoUrl: "/demo/riverside-mark.svg",
  primaryColor: "#0f766e",
  accentColor: "#f59e0b",
  themeMode: "SYSTEM",
  phone: "02 5550 0100",
  contactUrl: "https://www.example.com/contact",
  emergencyInstructions: "Call the clinic or emergency services.",
  publishedGuideCount: 1,
};

describe("clinic setup checks", () => {
  it("marks complete clinic data as configured without inventing a score", () => {
    const checks = clinicSetupChecks(CONFIGURED);

    expect(checks.map((check) => check.state)).toEqual([
      "configured",
      "configured",
      "configured",
      "configured",
      "configured",
    ]);
    expect(checks.map((check) => check.label)).toEqual([
      "Clinic identity",
      "Branding",
      "Contact details",
      "Emergency guidance",
      "Published guide",
    ]);
    expect(JSON.stringify(checks)).not.toMatch(/83%/);
    expect(JSON.stringify(checks)).not.toMatch(/views/);
  });

  it("flags missing identity, contact, emergency, and published guides", () => {
    const checks = clinicSetupChecks({
      displayName: "Harbor",
      logoUrl: null,
      primaryColor: null,
      accentColor: null,
      themeMode: null,
      phone: null,
      contactUrl: null,
      emergencyInstructions: "  ",
      publishedGuideCount: 0,
    });

    expect(checks.find((check) => check.id === "identity")?.state).toBe(
      "needs_attention"
    );
    expect(checks.find((check) => check.id === "branding")?.state).toBe(
      "needs_attention"
    );
    expect(checks.find((check) => check.id === "contact")?.state).toBe(
      "needs_attention"
    );
    expect(checks.find((check) => check.id === "emergency")?.state).toBe(
      "needs_attention"
    );
    expect(checks.find((check) => check.id === "published")?.state).toBe(
      "needs_attention"
    );
  });
});
