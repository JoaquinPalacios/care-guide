import { describe, expect, it } from "vitest";

import {
  followPortalPreviewLabel,
  resolvePreviewPatientTheme,
} from "@/lib/branding/preview-appearance";

describe("authenticated preview appearance", () => {
  it("labels Follow portal from the staff portal preference", () => {
    expect(followPortalPreviewLabel("light")).toBe("Follow portal (Light)");
    expect(followPortalPreviewLabel("dark")).toBe("Follow portal (Dark)");
    expect(followPortalPreviewLabel("system")).toBe("Follow portal (System)");
    expect(followPortalPreviewLabel(null)).toBe("Follow portal (System)");
  });

  it("resolves Follow portal independently from clinic SYSTEM", () => {
    expect(
      resolvePreviewPatientTheme({
        choice: "portal",
        clinicThemeMode: "SYSTEM",
      })
    ).toBe("portal");
    expect(
      resolvePreviewPatientTheme({
        choice: "clinic",
        clinicThemeMode: "SYSTEM",
      })
    ).toBe("system");
    expect(
      resolvePreviewPatientTheme({
        choice: "light",
        clinicThemeMode: "DARK",
      })
    ).toBe("light");
    expect(
      resolvePreviewPatientTheme({
        choice: "dark",
        clinicThemeMode: "LIGHT",
      })
    ).toBe("dark");
  });
});
