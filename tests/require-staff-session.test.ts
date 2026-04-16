import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());
const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getAuthContext: getAuthContextMock,
}));

import { requireStaffSession } from "@/lib/auth/require-staff-session";

describe("requireStaffSession", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    getAuthContextMock.mockReset();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects signed-out users to /login", async () => {
    getAuthContextMock.mockResolvedValue({
      user: null,
      clinicMembership: null,
    });

    await expect(requireStaffSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("returns the current staff session context when present", async () => {
    const clinicMembership = {
      membershipId: "membership_1",
      role: "ADMIN",
      clinic: {
        id: "clinic_1",
        name: "Rivers Care Demo Clinic",
      },
    };

    getAuthContextMock.mockResolvedValue({
      user: {
        id: "user_1",
        email: "admin@care-guide.test",
        name: "Demo Admin",
      },
      clinicMembership,
    });

    await expect(requireStaffSession()).resolves.toEqual({
      user: {
        id: "user_1",
        email: "admin@care-guide.test",
        name: "Demo Admin",
      },
      clinicMembership,
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
