import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PrismaGlobal = typeof globalThis & {
  prisma?: { $disconnect?: () => Promise<unknown> };
  prismaAdapter?: unknown;
};

const prismaGlobal = globalThis as PrismaGlobal;

async function clearPrismaSingleton() {
  if (prismaGlobal.prisma?.$disconnect) {
    await prismaGlobal.prisma.$disconnect();
  }
  delete prismaGlobal.prisma;
  delete prismaGlobal.prismaAdapter;
}

describe("lazy Prisma initialization", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(async () => {
    await clearPrismaSingleton();
    vi.resetModules();
    delete process.env.DATABASE_URL;
  });

  afterEach(async () => {
    await clearPrismaSingleton();
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it("can import lib/prisma when DATABASE_URL is absent", async () => {
    await expect(import("@/lib/prisma")).resolves.toMatchObject({
      getPrisma: expect.any(Function),
    });
  });

  it("throws a clear configuration error when getPrisma() is called without DATABASE_URL", async () => {
    const { getPrisma } = await import("@/lib/prisma");

    expect(() => getPrisma()).toThrow(
      "DATABASE_URL is required to initialize Prisma."
    );
  });

  it("returns a singleton client when DATABASE_URL is configured", async () => {
    process.env.DATABASE_URL =
      "postgresql://prisma:prisma@127.0.0.1:1/prisma_lazy_init_test";

    const { getPrisma } = await import("@/lib/prisma");
    const first = getPrisma();
    const second = getPrisma();

    expect(second).toBe(first);
    await first.$disconnect();
  });
});
