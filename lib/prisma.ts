import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAdapter?: PrismaPg;
  prisma?: PrismaClient;
};

let prismaClient: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  const existing =
    process.env.NODE_ENV === "production"
      ? prismaClient
      : globalForPrisma.prisma;

  if (existing) {
    return existing;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const prismaAdapter =
    (process.env.NODE_ENV === "production"
      ? undefined
      : globalForPrisma.prismaAdapter) ??
    new PrismaPg({
      connectionString,
    });

  const prisma = new PrismaClient({ adapter: prismaAdapter });

  if (process.env.NODE_ENV === "production") {
    prismaClient = prisma;
  } else {
    globalForPrisma.prismaAdapter = prismaAdapter;
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
