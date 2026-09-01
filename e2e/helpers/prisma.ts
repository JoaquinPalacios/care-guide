import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for Phase 1E browser fixtures.");
}

const adapter = new PrismaPg({ connectionString });

export const e2ePrisma = new PrismaClient({ adapter });
