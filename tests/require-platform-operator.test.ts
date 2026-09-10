import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getAuthContext: getAuthContextMock,
  isPlatformOperator: (user: { platformRole?: string } | null | undefined) =>
    user?.platformRole === "OPERATOR",
}));

import { requirePlatformOperator } from "@/lib/auth/require-platform-operator";

describe("requirePlatformOperator", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
    redirectMock.mockReset();
    getAuthContextMock.mockReset();
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
    });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("returns the operator user", async () => {
    const user = {
      id: "user_operator",
      email: "operator@care-guide.test",
      name: "Demo Operator",
      platformRole: "OPERATOR",
    };
    getAuthContextMock.mockResolvedValue({
      user,
      clinicMembership: null,
    });

    await expect(requirePlatformOperator()).resolves.toEqual({ user });
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("does not let a clinic ADMIN access operator routes", async () => {
    getAuthContextMock.mockResolvedValue({
      user: {
        id: "user_admin",
        email: "admin@care-guide.test",
        name: "Demo Admin",
        platformRole: "NONE",
      },
      clinicMembership: {
        membershipId: "membership_1",
        role: "ADMIN",
        clinic: { id: "clinic_1", name: "Riverside" },
      },
    });

    await expect(requirePlatformOperator()).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404"
    );
    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
