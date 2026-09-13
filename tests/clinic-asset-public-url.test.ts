import { afterEach, describe, expect, it } from "vitest";

import {
  clinicAssetPublicUrl,
  isClinicLogoStoredReference,
  resolveClinicLogoSrc,
} from "@/lib/clinic-assets/public-url";

const ENV_KEYS = ["CLINIC_ASSET_PUBLIC_ORIGIN"] as const;
const previous = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]])
);

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

const KEY =
  "clinics/clinic_a/branding/11111111-1111-4111-8111-111111111111.webp";

describe("clinic asset public URL resolver", () => {
  it("keeps demo paths as same-origin image sources", () => {
    expect(resolveClinicLogoSrc("/demo/riverside-mark.svg")).toBe(
      "/demo/riverside-mark.svg"
    );
    expect(isClinicLogoStoredReference("/demo/riverside-mark.svg")).toBe(true);
  });

  it("resolves stored object keys without concatenating an assets host in components", () => {
    delete process.env.CLINIC_ASSET_PUBLIC_ORIGIN;
    expect(clinicAssetPublicUrl(KEY)).toBe(
      "/clinic-branding/clinic_a/11111111-1111-4111-8111-111111111111.webp"
    );
    expect(resolveClinicLogoSrc(KEY)).toBe(
      "/clinic-branding/clinic_a/11111111-1111-4111-8111-111111111111.webp"
    );
    expect(isClinicLogoStoredReference(KEY)).toBe(true);
  });

  it("prefixes a validated public origin onto object keys", () => {
    process.env.CLINIC_ASSET_PUBLIC_ORIGIN = "https://assets.example.test";
    expect(resolveClinicLogoSrc(KEY)).toBe(
      `https://assets.example.test/${KEY}`
    );
    expect(
      resolveClinicLogoSrc(
        "/clinic-branding/clinic_a/11111111-1111-4111-8111-111111111111.webp"
      )
    ).toBe(`https://assets.example.test/${KEY}`);
  });

  it("rejects javascript, data, traversal, and arbitrary external URLs from stored values", () => {
    process.env.CLINIC_ASSET_PUBLIC_ORIGIN = "https://assets.example.test";
    expect(resolveClinicLogoSrc("javascript:alert(1)")).toBeNull();
    expect(resolveClinicLogoSrc("data:image/png;base64,aaaa")).toBeNull();
    expect(resolveClinicLogoSrc("https://evil.test/logo.png")).toBeNull();
    expect(resolveClinicLogoSrc("//evil.test/logo.png")).toBeNull();
    expect(resolveClinicLogoSrc("/../secret.svg")).toBeNull();
    expect(isClinicLogoStoredReference("https://evil.test/logo.png")).toBe(
      false
    );
    expect(isClinicLogoStoredReference("javascript:alert(1)")).toBe(false);
  });

  it("rejects an unsafe configured origin instead of emitting it", () => {
    process.env.CLINIC_ASSET_PUBLIC_ORIGIN = "javascript:alert(1)";
    expect(clinicAssetPublicUrl(KEY)).toBe(
      "/clinic-branding/clinic_a/11111111-1111-4111-8111-111111111111.webp"
    );
    process.env.CLINIC_ASSET_PUBLIC_ORIGIN =
      "https://user:pass@assets.example.test";
    expect(clinicAssetPublicUrl(KEY)).toBe(
      "/clinic-branding/clinic_a/11111111-1111-4111-8111-111111111111.webp"
    );
  });
});
