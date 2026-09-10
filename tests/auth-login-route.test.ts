import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyPasswordMock = vi.hoisted(() => vi.fn());
const createDatabaseSessionMock = vi.hoisted(() => vi.fn());
const findUniqueMock = vi.hoisted(() => vi.fn());
const findManyMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: verifyPasswordMock,
}));

vi.mock("@/lib/auth/session", () => ({
  createDatabaseSession: createDatabaseSessionMock,
  postLoginPath: ({
    platformRole,
    hasClinicMembership,
  }: {
    platformRole: string;
    hasClinicMembership: boolean;
  }) =>
    !hasClinicMembership && platformRole === "OPERATOR"
      ? "/operator/clinics"
      : "/dashboard",
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
    clinicMembership: {
      findMany: findManyMock,
    },
  },
}));

vi.mock("@/lib/auth/session-cookie", () => ({
  AUTH_SESSION_COOKIE_NAME: "authjs.session-token",
  authSessionCookieOptions: {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
  },
}));

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    verifyPasswordMock.mockReset();
    createDatabaseSessionMock.mockReset();
    findUniqueMock.mockReset();
    findManyMock.mockReset();
  });

  it("returns 401 for invalid credentials", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      name: "Demo Admin",
      email: "admin@care-guide.test",
      passwordHash: "stored-hash",
      platformRole: "NONE",
    });
    verifyPasswordMock.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@care-guide.test",
          password: "wrong-password",
        }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid credentials.",
    });
  });

  it("creates a session cookie for a valid single-clinic staff user", async () => {
    const expires = new Date("2026-05-01T12:00:00.000Z");

    findUniqueMock.mockResolvedValue({
      id: "user_1",
      name: "Demo Admin",
      email: "admin@care-guide.test",
      passwordHash: "stored-hash",
      platformRole: "NONE",
    });
    verifyPasswordMock.mockReturnValue(true);
    findManyMock.mockResolvedValue([{ clinicId: "clinic_1" }]);
    createDatabaseSessionMock.mockResolvedValue({
      sessionToken: "session-token-123",
      expires,
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@care-guide.test",
          password: "CareGuideDemo123!",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectTo: "/dashboard",
      user: {
        id: "user_1",
        name: "Demo Admin",
        email: "admin@care-guide.test",
      },
    });
    expect(response.headers.get("set-cookie")).toContain(
      "authjs.session-token=session-token-123"
    );
  });

  it("rejects users with multiple clinic memberships", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      name: "Demo Admin",
      email: "admin@care-guide.test",
      passwordHash: "stored-hash",
      platformRole: "NONE",
    });
    verifyPasswordMock.mockReturnValue(true);
    findManyMock.mockResolvedValue([
      { clinicId: "clinic_1" },
      { clinicId: "clinic_2" },
    ]);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@care-guide.test",
          password: "CareGuideDemo123!",
        }),
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error:
        "Your account has multiple clinic memberships and cannot sign in to this MVP yet.",
    });
  });

  it("allows a platform operator with no clinic membership to sign in", async () => {
    const expires = new Date("2026-05-01T12:00:00.000Z");

    findUniqueMock.mockResolvedValue({
      id: "user_operator",
      name: "Demo Operator",
      email: "operator@local.aftercare.test",
      passwordHash: "stored-hash",
      platformRole: "OPERATOR",
    });
    verifyPasswordMock.mockReturnValue(true);
    findManyMock.mockResolvedValue([]);
    createDatabaseSessionMock.mockResolvedValue({
      sessionToken: "operator-session",
      expires,
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "operator@local.aftercare.test",
          password: "LocalOnly123!",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectTo: "/operator/clinics",
      user: {
        id: "user_operator",
        name: "Demo Operator",
        email: "operator@local.aftercare.test",
      },
    });
  });

  it("rejects a clinic user with no membership", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      name: "Demo Admin",
      email: "admin@care-guide.test",
      passwordHash: "stored-hash",
      platformRole: "NONE",
    });
    verifyPasswordMock.mockReturnValue(true);
    findManyMock.mockResolvedValue([]);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@care-guide.test",
          password: "CareGuideDemo123!",
        }),
      })
    );

    expect(response.status).toBe(403);
  });
});
