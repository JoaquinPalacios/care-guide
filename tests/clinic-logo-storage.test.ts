import { ClinicMembershipRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { authorizeClinicLogoMutation } from "@/lib/clinic-assets/authorize-clinic-logo";
import {
  CLINIC_LOGO_MAX_BYTES,
  clinicLogoObjectKey,
  clinicLogoPublicPath,
  storageKeyFromClinicLogoPath,
  validateClinicLogo,
} from "@/lib/clinic-assets/clinic-logo";
import { clinicAssetStorageStatus } from "@/lib/clinic-assets/config";

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

describe("clinic logo validation", () => {
  it("accepts PNG, JPEG, and WebP magic bytes with matching MIME types", () => {
    expect(
      validateClinicLogo({ bytes: PNG, mimeType: "image/png" })
    ).toMatchObject({ ok: true, extension: "png" });
    expect(
      validateClinicLogo({ bytes: JPEG, mimeType: "image/jpeg" })
    ).toMatchObject({ ok: true, extension: "jpg" });
    expect(
      validateClinicLogo({ bytes: WEBP, mimeType: "image/webp" })
    ).toMatchObject({ ok: true, extension: "webp" });
  });

  it("rejects SVG, mismatched MIME, and oversized files", () => {
    const svg = new TextEncoder().encode(
      "<svg xmlns='http://www.w3.org/2000/svg'></svg>"
    );
    expect(
      validateClinicLogo({ bytes: svg, mimeType: "image/svg+xml" }).ok
    ).toBe(false);
    expect(validateClinicLogo({ bytes: PNG, mimeType: "image/jpeg" }).ok).toBe(
      false
    );

    const oversized = new Uint8Array(CLINIC_LOGO_MAX_BYTES + 1);
    oversized.set(PNG.slice(0, 8));
    expect(
      validateClinicLogo({ bytes: oversized, mimeType: "image/png" })
    ).toMatchObject({
      ok: false,
      error: "Logo files must be 2 MB or smaller.",
    });
  });

  it("builds generated clinic-owned keys and same-origin public paths", () => {
    const key = clinicLogoObjectKey({
      clinicId: "clinic_demo_rivers",
      objectId: "logo_abc123",
      extension: "webp",
    });

    expect(key).toBe("clinics/clinic_demo_rivers/branding/logo_abc123.webp");
    expect(clinicLogoPublicPath(key)).toBe(
      "/clinic-branding/clinic_demo_rivers/logo_abc123.webp"
    );
    expect(
      storageKeyFromClinicLogoPath(
        "/clinic-branding/clinic_demo_rivers/logo_abc123.webp"
      )
    ).toBe(key);
    expect(clinicLogoPublicPath("public/uploads/logo.png")).toBeNull();
  });
});

describe("clinic logo authorization", () => {
  it("allows the authenticated clinic ADMIN only", () => {
    expect(
      authorizeClinicLogoMutation({
        role: ClinicMembershipRole.ADMIN,
        actorClinicId: "clinic_a",
        targetClinicId: "clinic_a",
      })
    ).toEqual({ ok: true });
  });

  it("forbids STAFF and cross-clinic writes", () => {
    expect(
      authorizeClinicLogoMutation({
        role: ClinicMembershipRole.STAFF,
        actorClinicId: "clinic_a",
        targetClinicId: "clinic_a",
      })
    ).toEqual({ ok: false, code: "forbidden" });
    expect(
      authorizeClinicLogoMutation({
        role: ClinicMembershipRole.ADMIN,
        actorClinicId: "clinic_a",
        targetClinicId: "clinic_b",
      })
    ).toEqual({ ok: false, code: "forbidden" });
  });
});

describe("clinic asset storage configuration", () => {
  it("is unconfigured without a provisioned driver and credentials", () => {
    expect(clinicAssetStorageStatus()).toEqual({
      available: false,
      reason: "unconfigured",
    });
  });
});
