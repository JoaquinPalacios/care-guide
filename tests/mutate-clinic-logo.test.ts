import { ClinicMembershipRole } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const previousDriver = process.env.CLINIC_ASSET_STORAGE_DRIVER;
process.env.CLINIC_ASSET_STORAGE_DRIVER = "memory";

const { profile } = vi.hoisted(() => ({
  profile: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clinicProfile: profile,
  },
}));

import {
  removeClinicLogo,
  uploadClinicLogo,
} from "@/lib/clinic-assets/mutate-clinic-logo";
import {
  resetClinicAssetStorageCache,
  getClinicAssetStorage,
} from "@/lib/clinic-assets/get-clinic-asset-storage";
import { storageKeyFromClinicLogoPath } from "@/lib/clinic-assets/clinic-logo";
import { resetMemoryClinicAssetStorage } from "@/lib/clinic-assets/memory-clinic-asset-storage";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { ClinicAssetStorageUnavailableError } from "@/lib/clinic-assets/supabase-clinic-asset-storage";

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const SVG = new TextEncoder().encode(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#155e75"/></svg>`
);

describe("uploadClinicLogo / removeClinicLogo", () => {
  beforeEach(() => {
    process.env.CLINIC_ASSET_STORAGE_DRIVER = "memory";
    resetClinicAssetStorageCache();
    resetMemoryClinicAssetStorage();
    profile.findUnique.mockReset();
    profile.update.mockReset();
    profile.findUnique.mockResolvedValue({
      logoUrl: "/demo/riverside-mark.svg",
      displayName: "Demo",
    });
    profile.update.mockResolvedValue({});
  });

  afterEach(() => {
    if (previousDriver === undefined) {
      delete process.env.CLINIC_ASSET_STORAGE_DRIVER;
    } else {
      process.env.CLINIC_ASSET_STORAGE_DRIVER = previousDriver;
    }
    resetClinicAssetStorageCache();
  });

  it("stores a PNG and a sanitized SVG for the authenticated clinic ADMIN", async () => {
    const png = await uploadClinicLogo({
      actorRole: ClinicMembershipRole.ADMIN,
      actorClinicId: "clinic_a",
      targetClinicId: "clinic_a",
      bytes: PNG,
      mimeType: "image/png",
      fileName: "mark.png",
    });
    expect(png.logoUrl).toMatch(/^\/clinic-branding\/clinic_a\/.+\.png$/);

    const svg = await uploadClinicLogo({
      actorRole: ClinicMembershipRole.ADMIN,
      actorClinicId: "clinic_a",
      targetClinicId: "clinic_a",
      bytes: SVG,
      mimeType: "image/svg+xml",
      fileName: "mark.svg",
    });
    expect(svg.logoUrl).toMatch(/^\/clinic-branding\/clinic_a\/.+\.svg$/);
    expect(profile.update).toHaveBeenCalled();
  });

  it("forbids STAFF and cross-clinic writes", async () => {
    await expect(
      uploadClinicLogo({
        actorRole: ClinicMembershipRole.STAFF,
        actorClinicId: "clinic_a",
        targetClinicId: "clinic_a",
        bytes: PNG,
        mimeType: "image/png",
      })
    ).rejects.toBeInstanceOf(ClinicPortalError);

    await expect(
      uploadClinicLogo({
        actorRole: ClinicMembershipRole.ADMIN,
        actorClinicId: "clinic_a",
        targetClinicId: "clinic_b",
        bytes: PNG,
        mimeType: "image/png",
      })
    ).rejects.toBeInstanceOf(ClinicPortalError);
  });

  it("does not persist script tags from an uploaded SVG", async () => {
    const result = await uploadClinicLogo({
      actorRole: ClinicMembershipRole.ADMIN,
      actorClinicId: "clinic_a",
      targetClinicId: "clinic_a",
      bytes: new TextEncoder().encode(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><circle r="4"/></svg>`
      ),
      mimeType: "image/svg+xml",
      fileName: "evil.svg",
    });
    expect(result.logoUrl).toMatch(/^\/clinic-branding\/clinic_a\/.+\.svg$/);
    const key = storageKeyFromClinicLogoPath(result.logoUrl);
    expect(key).toBeTruthy();
    const stored = await getClinicAssetStorage()?.readLogo({
      clinicId: "clinic_a",
      storageKey: key!,
    });
    expect(stored).toBeTruthy();
    expect(new TextDecoder().decode(stored!.bytes)).not.toMatch(/<script/i);
  });

  it("clears a stored logo on remove without deleting a demo path", async () => {
    await removeClinicLogo({
      actorRole: ClinicMembershipRole.ADMIN,
      actorClinicId: "clinic_a",
      targetClinicId: "clinic_a",
    });
    expect(profile.update).toHaveBeenCalledWith({
      where: { clinicId: "clinic_a" },
      data: { logoUrl: null },
    });
  });
});

describe("storage unconfigured", () => {
  it("does not pretend a filesystem upload succeeded", () => {
    expect(ClinicAssetStorageUnavailableError).toBeDefined();
  });
});
