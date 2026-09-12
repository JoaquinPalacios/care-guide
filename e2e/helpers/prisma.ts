import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { e2eDatabaseUrl } from "./database";

const connectionString = e2eDatabaseUrl();
const adapter = new PrismaPg({ connectionString });

export const e2ePrisma = new PrismaClient({ adapter });
