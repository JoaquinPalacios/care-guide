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

const DEMO_PROCEDURE_TEMPLATE = {
  id: "proc_tmpl_demo_starter",
  name: "Starter Procedure Walkthrough",
  slug: "starter-procedure-walkthrough",
  isActive: true,
  stages: [
    {
      id: "proc_stage_demo_welcome",
      stageOrder: 1,
      title: "Welcome And Setup",
      calmCopy: "Take a slow breath. We will walk through each step together.",
      patientCopy:
        "We are getting the room ready. This usually takes a minute or two.",
      detailedCopy:
        "Your care team is preparing instruments and confirming your chart. You can relax; nothing has started yet.",
      defaultDurationHint: "about 2 minutes",
    },
    {
      id: "proc_stage_demo_numbing",
      stageOrder: 2,
      title: "Numbing The Area",
      calmCopy: "You may feel a small pinch. It passes quickly.",
      patientCopy:
        "We are gently numbing the area so you stay comfortable during the procedure.",
      detailedCopy:
        "Your doctor is applying a topical gel followed by a local anesthetic. The area will feel tingly, then fully numb in a few minutes.",
      defaultDurationHint: "about 3 minutes",
    },
    {
      id: "proc_stage_demo_wrapup",
      stageOrder: 3,
      title: "Wrapping Up",
      calmCopy: "You are almost done. Thank you for being patient.",
      patientCopy:
        "We are finishing up and will review aftercare instructions with you.",
      detailedCopy:
        "Your doctor is checking the work, cleaning the area, and will hand you aftercare notes before you leave.",
      defaultDurationHint: "about 2 minutes",
    },
  ],
  selectedAreaOptions: [
    {
      id: "proc_area_demo_upper_left",
      key: "upper_left",
      label: "Upper Left",
      sortOrder: 1,
    },
    {
      id: "proc_area_demo_upper_right",
      key: "upper_right",
      label: "Upper Right",
      sortOrder: 2,
    },
    {
      id: "proc_area_demo_lower_left",
      key: "lower_left",
      label: "Lower Left",
      sortOrder: 3,
    },
    {
      id: "proc_area_demo_lower_right",
      key: "lower_right",
      label: "Lower Right",
      sortOrder: 4,
    },
  ],
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

  const procedureTemplate = await prisma.procedureTemplate.upsert({
    where: { id: DEMO_PROCEDURE_TEMPLATE.id },
    update: {
      clinicId: clinic.id,
      name: DEMO_PROCEDURE_TEMPLATE.name,
      slug: DEMO_PROCEDURE_TEMPLATE.slug,
      isActive: DEMO_PROCEDURE_TEMPLATE.isActive,
    },
    create: {
      id: DEMO_PROCEDURE_TEMPLATE.id,
      clinicId: clinic.id,
      name: DEMO_PROCEDURE_TEMPLATE.name,
      slug: DEMO_PROCEDURE_TEMPLATE.slug,
      isActive: DEMO_PROCEDURE_TEMPLATE.isActive,
    },
  });

  for (const stage of DEMO_PROCEDURE_TEMPLATE.stages) {
    await prisma.procedureStageTemplate.upsert({
      where: { id: stage.id },
      update: {
        procedureTemplateId: procedureTemplate.id,
        stageOrder: stage.stageOrder,
        title: stage.title,
        calmCopy: stage.calmCopy,
        patientCopy: stage.patientCopy,
        detailedCopy: stage.detailedCopy,
        defaultDurationHint: stage.defaultDurationHint ?? null,
      },
      create: {
        id: stage.id,
        procedureTemplateId: procedureTemplate.id,
        stageOrder: stage.stageOrder,
        title: stage.title,
        calmCopy: stage.calmCopy,
        patientCopy: stage.patientCopy,
        detailedCopy: stage.detailedCopy,
        defaultDurationHint: stage.defaultDurationHint ?? null,
      },
    });
  }

  for (const option of DEMO_PROCEDURE_TEMPLATE.selectedAreaOptions) {
    await prisma.procedureTemplateSelectedAreaOption.upsert({
      where: { id: option.id },
      update: {
        procedureTemplateId: procedureTemplate.id,
        key: option.key,
        label: option.label,
        sortOrder: option.sortOrder,
      },
      create: {
        id: option.id,
        procedureTemplateId: procedureTemplate.id,
        key: option.key,
        label: option.label,
        sortOrder: option.sortOrder,
      },
    });
  }

  console.info("Seeded clinic-scoped demo data:");
  console.info(`- Clinic: ${clinic.name} (${clinic.id})`);
  console.info(
    `- Admin: ${adminUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.admin.role})`
  );
  console.info(
    `- Staff: ${staffUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.staff.role})`
  );
  console.info(
    `- Procedure template: ${procedureTemplate.name} (${procedureTemplate.id}) with ${DEMO_PROCEDURE_TEMPLATE.stages.length} stages and ${DEMO_PROCEDURE_TEMPLATE.selectedAreaOptions.length} selected-area options`
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
