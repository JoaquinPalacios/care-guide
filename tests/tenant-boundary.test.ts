import { beforeEach, describe, expect, it, vi } from "vitest";

const { getClinicBySlug, notFound } = vi.hoisted(() => ({
  getClinicBySlug: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  }),
}));

vi.mock("@/lib/aftercare/get-clinic-by-slug", () => ({
  getClinicBySlug,
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

import { requireTenantClinic } from "@/lib/tenancy/require-tenant-clinic";

const DEMODENTAL = {
  id: "clinic_demo_rivers",
  slug: "demodental",
  name: "Rivers Care Demo Clinic",
  profile: null,
};

describe("requireTenantClinic", () => {
  beforeEach(() => {
    getClinicBySlug.mockReset();
    notFound.mockClear();
  });

  it("resolves the known demodental tenant", async () => {
    getClinicBySlug.mockResolvedValue(DEMODENTAL);

    await expect(requireTenantClinic("demodental")).resolves.toEqual(
      DEMODENTAL
    );
    expect(getClinicBySlug).toHaveBeenCalledWith("demodental");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("returns not-found behaviour for an unknown tenant", async () => {
    getClinicBySlug.mockResolvedValue(null);

    await expect(requireTenantClinic("unknown")).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404"
    );
    expect(getClinicBySlug).toHaveBeenCalledWith("unknown");
    expect(notFound).toHaveBeenCalledOnce();
  });

  it("does not resolve another tenant slug as demodental", async () => {
    getClinicBySlug.mockImplementation(async (slug: string) => {
      if (slug === "demodental") {
        return DEMODENTAL;
      }
      return {
        ...DEMODENTAL,
        id: "clinic_other",
        slug,
        name: "Other Clinic",
      };
    });

    const clinic = await requireTenantClinic("otherclinic");
    expect(clinic.slug).toBe("otherclinic");
    expect(clinic.id).not.toBe(DEMODENTAL.id);
    expect(getClinicBySlug).toHaveBeenCalledWith("otherclinic");
    expect(getClinicBySlug).not.toHaveBeenCalledWith("demodental");
  });
});
