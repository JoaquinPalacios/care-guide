import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nextAuthMock = vi.hoisted(() =>
  vi.fn(() => ({
    auth: vi.fn(),
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  }))
);

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
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

const originalAuthSecret = process.env.AUTH_SECRET;

describe("auth configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    nextAuthMock.mockClear();
  });

  afterEach(() => {
    if (originalAuthSecret === undefined) {
      delete process.env.AUTH_SECRET;
      return;
    }

    process.env.AUTH_SECRET = originalAuthSecret;
  });

  it("fails fast with a clear error when AUTH_SECRET is missing", async () => {
    delete process.env.AUTH_SECRET;

    await expect(import("@/auth")).rejects.toThrow(
      'Missing AUTH_SECRET. Copy ".env.example" to ".env" and set AUTH_SECRET before starting the app.'
    );
  });

  it("passes AUTH_SECRET through to NextAuth when configured", async () => {
    process.env.AUTH_SECRET = "test-auth-secret";

    await import("@/auth");

    expect(nextAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        secret: "test-auth-secret",
      })
    );
  });
});
