import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ClinicMembershipRole } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "CareGuideDemo123!";

const DEMO_CLINIC = {
  id: "clinic_demo_rivers",
  name: "Rivers Care Demo Clinic",
};

const DEMO_USERS = {
  admin: {
    id: "user_demo_admin",
    name: "Demo Admin",
    email: "admin@care-guide.test",
    role: ClinicMembershipRole.ADMIN,
  },
  staff: {
    id: "user_demo_staff",
    name: "Demo Staff",
    email: "staff@care-guide.test",
    role: ClinicMembershipRole.STAFF,
  },
};

function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

async function upsertDemoUser(user) {
  const passwordHash = createPasswordHash(DEMO_PASSWORD);

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      passwordHash,
    },
    create: {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash,
    },
  });
}

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { id: DEMO_CLINIC.id },
    update: {
      name: DEMO_CLINIC.name,
    },
    create: DEMO_CLINIC,
  });

  const adminUser = await upsertDemoUser(DEMO_USERS.admin);
  const staffUser = await upsertDemoUser(DEMO_USERS.staff);

  await prisma.clinicMembership.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: adminUser.id,
      },
    },
    update: {
      role: DEMO_USERS.admin.role,
    },
    create: {
      clinicId: clinic.id,
      userId: adminUser.id,
      role: DEMO_USERS.admin.role,
    },
  });

  await prisma.clinicMembership.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: staffUser.id,
      },
    },
    update: {
      role: DEMO_USERS.staff.role,
    },
    create: {
      clinicId: clinic.id,
      userId: staffUser.id,
      role: DEMO_USERS.staff.role,
    },
  });

  console.info("Seeded clinic-scoped demo data:");
  console.info(`- Clinic: ${clinic.name} (${clinic.id})`);
  console.info(
    `- Admin: ${adminUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.admin.role})`
  );
  console.info(
    `- Staff: ${staffUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.staff.role})`
  );
}

main()
  .catch((error) => {
    console.error("Prisma seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
