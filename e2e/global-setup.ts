import {
  assertLocalhostTenantsResolve,
  seedPhase1eFixtures,
} from "./fixtures/phase1e-data";
import {
  applyE2eSchema,
  ensureE2eDatabase,
  writeDevelopmentGuideSnapshot,
} from "./helpers/e2e-database";
import { e2ePrisma } from "./helpers/prisma";

export default async function globalSetup(): Promise<void> {
  await writeDevelopmentGuideSnapshot();
  const e2eUrl = await ensureE2eDatabase();
  applyE2eSchema(e2eUrl);
  await assertLocalhostTenantsResolve();
  await seedPhase1eFixtures();
  await e2ePrisma.$disconnect();
}
