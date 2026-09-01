import { cleanupPhase1eFixtures } from "./fixtures/phase1e-data";
import { e2ePrisma } from "./helpers/prisma";

export default async function globalTeardown(): Promise<void> {
  await cleanupPhase1eFixtures();
  await e2ePrisma.$disconnect();
}
