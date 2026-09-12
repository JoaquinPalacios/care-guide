import { describe, expect, it } from "vitest";

import {
  followPortalPreviewLabel,
  resolveEffectivePreviewAppearance,
} from "@/lib/branding/preview-appearance";

describe("authenticated preview appearance", () => {
  it("labels Follow portal from the staff portal preference", () => {
    expect(followPortalPreviewLabel("light")).toBe("Follow portal (Light)");
    expect(followPortalPreviewLabel("dark")).toBe("Follow portal (Dark)");
    expect(followPortalPreviewLabel("system")).toBe("Follow portal (System)");
    expect(followPortalPreviewLabel(null)).toBe("Follow portal (System)");
  });

  it("resolves one effective appearance for chrome and the patient surface", () => {
    expect(
      resolveEffectivePreviewAppearance({
        choice: "light",
        clinicThemeMode: "DARK",
        portalPreference: "dark",
      })
    ).toBe("light");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "dark",
        clinicThemeMode: "LIGHT",
        portalPreference: "light",
      })
    ).toBe("dark");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "portal",
        clinicThemeMode: "DARK",
        portalPreference: "light",
      })
    ).toBe("light");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "portal",
        clinicThemeMode: "LIGHT",
        portalPreference: "dark",
      })
    ).toBe("dark");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "portal",
        clinicThemeMode: "DARK",
        portalPreference: "system",
      })
    ).toBe("system");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "clinic",
        clinicThemeMode: "SYSTEM",
        portalPreference: "dark",
      })
    ).toBe("system");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "clinic",
        clinicThemeMode: "DARK",
        portalPreference: "light",
      })
    ).toBe("dark");
    expect(
      resolveEffectivePreviewAppearance({
        choice: "clinic",
        clinicThemeMode: "LIGHT",
        portalPreference: "dark",
      })
    ).toBe("light");
  });
});
