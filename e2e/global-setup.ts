import {
  assertLocalhostTenantsResolve,
  seedPhase1eFixtures,
} from "./fixtures/phase1e-data";
import { e2ePrisma } from "./helpers/prisma";

export default async function globalSetup(): Promise<void> {
  await assertLocalhostTenantsResolve();
  await seedPhase1eFixtures();
  await e2ePrisma.$disconnect();
}
