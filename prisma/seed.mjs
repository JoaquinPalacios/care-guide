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
  slug: "demodental",
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

const DEMO_ROOM = {
  id: "room_demo_rivers_1",
  name: "Room 1",
  slug: "room-1",
};

const DEMO_DOCTOR = {
  id: "doctor_demo_rivers_default",
  name: "Dr. Demo",
  slug: "dr-demo",
};

const DEMO_PROCEDURE_TEMPLATES = [
  {
    id: "proc_tmpl_demo_starter",
    name: "Starter Procedure Walkthrough",
    slug: "starter-procedure-walkthrough",
    isActive: true,
    aftercareUrl: "https://www.example.com/aftercare/starter-procedure",
    stages: [
      {
        id: "proc_stage_demo_welcome",
        stageOrder: 1,
        title: "Welcome And Setup",
        calmCopy:
          "Take a slow breath. We will walk through each step together.",
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
  },
  {
    id: "proc_tmpl_scaling_root_planing",
    name: "Scaling and Root Planing",
    slug: "scaling-and-root-planing",
    isActive: true,
    aftercareUrl:
      "https://www.exampleclinic.com/aftercare/scaling-and-root-planing",
    stages: [
      {
        id: "proc_stage_scaling_root_planing_settled",
        stageOrder: 1,
        title: "Getting settled",
        calmCopy: "We are getting you comfortable and ready to begin.",
        patientCopy:
          "We are getting everything ready and making sure you are comfortable before treatment starts.",
        detailedCopy:
          "This first stage is about helping you settle in and preparing to begin the cleaning treatment in a calm, organised way.",
        defaultDurationHint: "2–5 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_numbing",
        stageOrder: 2,
        title: "Numbing the area",
        calmCopy: "We are gently numbing the area now.",
        patientCopy:
          "A local anaesthetic is being used so the area can be treated more comfortably.",
        detailedCopy:
          "The gum and nearby teeth are being numbed with local anaesthetic so the deeper cleaning can be carried out with better comfort.",
        defaultDurationHint: "3–8 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_checking",
        stageOrder: 3,
        title: "Checking the gums",
        calmCopy: "We are taking a close look before cleaning.",
        patientCopy:
          "The gums and tooth surfaces are being checked carefully so the cleaning can focus on the right areas.",
        detailedCopy:
          "Before the main cleaning, the periodontist is closely checking the gumline and root areas to guide the treatment and work thoroughly where it is needed.",
        defaultDurationHint: "2–5 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_cleaning",
        stageOrder: 4,
        title: "Deep cleaning begins",
        calmCopy: "We are cleaning below the gumline now.",
        patientCopy:
          "The deeper cleaning is now starting to remove build-up from around the teeth and under the gums.",
        detailedCopy:
          "This stage removes plaque, tartar, and deposits from tooth surfaces and from below the gumline where a regular clean cannot reach.",
        defaultDurationHint: "5–15 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_root_surface",
        stageOrder: 5,
        title: "Cleaning the root surface",
        calmCopy: "We are smoothing the root surface now.",
        patientCopy:
          "The root surfaces are being carefully cleaned and smoothed to help the gums heal against the teeth.",
        detailedCopy:
          "This part of treatment focuses on the tooth roots. Cleaning and smoothing these areas helps reduce places where bacteria and deposits can cling.",
        defaultDurationHint: "5–15 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_detail",
        stageOrder: 6,
        title: "Detailed treatment",
        calmCopy: "We are working carefully through the area.",
        patientCopy:
          "The team is carefully treating the remaining spots to make the cleaning as thorough as possible.",
        detailedCopy:
          "The periodontist is methodically working across the selected area, revisiting deeper or harder-to-reach spots to complete the treatment carefully.",
        defaultDurationHint: "5–12 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_final_rinse",
        stageOrder: 7,
        title: "Final rinse and check",
        calmCopy: "We are finishing the area and checking everything.",
        patientCopy:
          "The area is being rinsed and checked to make sure the treatment stage is complete.",
        detailedCopy:
          "The treated area is being cleaned away and reviewed so the periodontist can confirm the root surfaces and gumline have been addressed as planned.",
        defaultDurationHint: "2–5 min",
        illustrationUrl: null,
      },
      {
        id: "proc_stage_scaling_root_planing_complete",
        stageOrder: 8,
        title: "Procedure complete",
        calmCopy: "This part of your treatment is complete.",
        patientCopy:
          "This treatment visit is complete. Before you leave, you may be given simple aftercare guidance for the next day or two.",
        detailedCopy:
          "The scaling and root planing for this selected area is now complete. A short recovery period is normal, and you may be directed to general aftercare information after the appointment.",
        defaultDurationHint: "1–3 min",
        illustrationUrl: null,
      },
    ],
    selectedAreaOptions: [
      {
        id: "proc_area_scaling_root_planing_upper_right",
        key: "upper_right",
        label: "Upper right",
        sortOrder: 1,
      },
      {
        id: "proc_area_scaling_root_planing_upper_left",
        key: "upper_left",
        label: "Upper left",
        sortOrder: 2,
      },
      {
        id: "proc_area_scaling_root_planing_lower_right",
        key: "lower_right",
        label: "Lower right",
        sortOrder: 3,
      },
      {
        id: "proc_area_scaling_root_planing_lower_left",
        key: "lower_left",
        label: "Lower left",
        sortOrder: 4,
      },
    ],
  },
];

const DEMO_DISCLAIMER =
  "DEMO CONTENT ONLY — this is fictional Care Guide sample copy for local development. It is not clinical advice and must not be given to patients.";

const DEMO_CLINIC_PROFILE = {
  displayName: "Riverside Dental Demo",
  logoUrl: "/demo/riverside-mark.svg",
  primaryColor: "#0f766e",
  accentColor: "#f59e0b",
  phone: "02 5550 0100",
  addressLine1: "12 Riverside Demo Street",
  addressLine2: null,
  city: "Sydney",
  region: "NSW",
  postalCode: "2000",
  country: "AU",
  bookingUrl: "https://www.example.com/riverside-dental-demo/book",
  contactUrl: "https://www.example.com/riverside-dental-demo/contact",
  contactEmail: "hello@riverside-dental-demo.example",
  emergencyInstructions:
    "DEMO: If this were a real practice, patients would call the clinic during hours or emergency services if they have trouble breathing, uncontrolled bleeding, or rapidly worsening swelling. This demo text is not clinical advice.",
  showCareGuideAttribution: true,
};

const DEMO_EXTRACTION_GUIDE = {
  templateId: "guide_tmpl_demo_extraction",
  specialty: "DENTAL",
  slug: "extraction",
  title: "Tooth Extraction",
  revisionId: "guide_rev_demo_extraction_v1",
  version: 1,
  practiceGuideId: "practice_guide_demo_rivers_extraction",
  overrideId: "practice_override_demo_rivers_extraction_contact",
  additionId: "practice_addition_demo_rivers_extraction_hours",
  publishedAt: new Date("2026-08-31T00:00:00.000Z"),
  sections: [
    {
      id: "guide_sec_demo_extraction_intro",
      key: "introduction",
      kind: "INTRODUCTION",
      title: "About this demo guide",
      sortOrder: 1,
      body: `${DEMO_DISCLAIMER}\n\nThis sample “Tooth Extraction” guide exists so Care Guide can demonstrate canonical aftercare content for the Riverside Dental Demo tenant.`,
    },
    {
      id: "guide_sec_demo_extraction_immediate",
      key: "immediate-care",
      kind: "IMMEDIATE_CARE",
      title: "What to do first (demo)",
      sortOrder: 2,
      body: `${DEMO_DISCLAIMER}\n\nA real practice would describe immediate post-extraction steps here. This paragraph is placeholder demo copy only.`,
    },
    {
      id: "guide_sec_demo_extraction_first_day",
      key: "first-24-hours",
      kind: "FIRST_24_HOURS",
      title: "The first day (demo)",
      sortOrder: 3,
      body: `${DEMO_DISCLAIMER}\n\nCanonical demo text for the first 24 hours. Riverside Dental Demo overrides this section in the seeded PracticeGuide.`,
    },
    {
      id: "guide_sec_demo_extraction_normal",
      key: "what-is-normal",
      kind: "WHAT_IS_NORMAL",
      title: "What this demo treats as normal",
      sortOrder: 4,
      body: `${DEMO_DISCLAIMER}\n\nThis section would usually describe expected recovery sensations. The seeded text is intentionally generic and non-clinical.`,
    },
    {
      id: "guide_sec_demo_extraction_warnings",
      key: "warning-signs",
      kind: "WARNING_SIGNS",
      title: "Warning signs (demo)",
      sortOrder: 5,
      body: `${DEMO_DISCLAIMER}\n\nA production guide would list warning signs here. Do not treat this demo list as medical guidance.`,
    },
    {
      id: "guide_sec_demo_extraction_contact",
      key: "contact-practice",
      kind: "CONTACT_PRACTICE",
      title: "Contact the practice (demo)",
      sortOrder: 6,
      body: `${DEMO_DISCLAIMER}\n\nCanonical contact prompt. Patients would normally use the practice phone and booking links from the clinic profile, not this paragraph.`,
    },
  ],
  override: {
    sectionKey: "first-24-hours",
    title: "The first day at Riverside Dental Demo",
    body: `${DEMO_DISCLAIMER}\n\nPractice override: Riverside Dental Demo asks patients to use the demo after-hours number on the clinic profile if they have questions during the first evening. This is sample customisation, not clinical advice.`,
  },
  addition: {
    key: "weekend-contact",
    kind: "CUSTOM",
    title: "Weekend contact (Riverside demo)",
    sortOrder: 1,
    insertAfterSectionKey: "contact-practice",
    body: `${DEMO_DISCLAIMER}\n\nPractice addition: this extra section shows how Riverside Dental Demo can insert local information after a canonical section. It is not a real on-call roster.`,
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

async function upsertProcedureTemplate(clinicId, template) {
  const procedureTemplate = await prisma.procedureTemplate.upsert({
    where: { id: template.id },
    update: {
      clinicId,
      name: template.name,
      slug: template.slug,
      isActive: template.isActive,
      aftercareUrl: template.aftercareUrl,
    },
    create: {
      id: template.id,
      clinicId,
      name: template.name,
      slug: template.slug,
      isActive: template.isActive,
      aftercareUrl: template.aftercareUrl,
    },
  });

  for (const stage of template.stages) {
    await prisma.procedureStageTemplate.upsert({
      where: { id: stage.id },
      update: {
        procedureTemplateId: procedureTemplate.id,
        stageOrder: stage.stageOrder,
        title: stage.title,
        calmCopy: stage.calmCopy,
        patientCopy: stage.patientCopy,
        detailedCopy: stage.detailedCopy,
        illustrationUrl: stage.illustrationUrl ?? null,
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
        illustrationUrl: stage.illustrationUrl ?? null,
        defaultDurationHint: stage.defaultDurationHint ?? null,
      },
    });
  }

  for (const option of template.selectedAreaOptions) {
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

  return procedureTemplate;
}

async function upsertAftercareDemo(clinicId) {
  await prisma.clinicProfile.upsert({
    where: { clinicId },
    update: DEMO_CLINIC_PROFILE,
    create: {
      clinicId,
      ...DEMO_CLINIC_PROFILE,
    },
  });

  const template = await prisma.guideTemplate.upsert({
    where: { id: DEMO_EXTRACTION_GUIDE.templateId },
    update: {
      specialty: DEMO_EXTRACTION_GUIDE.specialty,
      slug: DEMO_EXTRACTION_GUIDE.slug,
      title: DEMO_EXTRACTION_GUIDE.title,
      isActive: true,
    },
    create: {
      id: DEMO_EXTRACTION_GUIDE.templateId,
      specialty: DEMO_EXTRACTION_GUIDE.specialty,
      slug: DEMO_EXTRACTION_GUIDE.slug,
      title: DEMO_EXTRACTION_GUIDE.title,
      isActive: true,
    },
  });

  const revision = await prisma.guideTemplateRevision.upsert({
    where: { id: DEMO_EXTRACTION_GUIDE.revisionId },
    update: {
      guideTemplateId: template.id,
      version: DEMO_EXTRACTION_GUIDE.version,
      status: "PUBLISHED",
      publishedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
      reviewedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
      reviewedBy: "Care Guide demo seed",
    },
    create: {
      id: DEMO_EXTRACTION_GUIDE.revisionId,
      guideTemplateId: template.id,
      version: DEMO_EXTRACTION_GUIDE.version,
      status: "PUBLISHED",
      publishedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
      reviewedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
      reviewedBy: "Care Guide demo seed",
    },
  });

  for (const section of DEMO_EXTRACTION_GUIDE.sections) {
    await prisma.guideTemplateSection.upsert({
      where: { id: section.id },
      update: {
        revisionId: revision.id,
        key: section.key,
        kind: section.kind,
        title: section.title,
        body: section.body,
        sortOrder: section.sortOrder,
      },
      create: {
        id: section.id,
        revisionId: revision.id,
        key: section.key,
        kind: section.kind,
        title: section.title,
        body: section.body,
        sortOrder: section.sortOrder,
      },
    });
  }

  const practiceGuide = await prisma.practiceGuide.upsert({
    where: { id: DEMO_EXTRACTION_GUIDE.practiceGuideId },
    update: {
      clinicId,
      guideTemplateId: template.id,
      pinnedRevisionId: revision.id,
      publicSlug: DEMO_EXTRACTION_GUIDE.slug,
      isEnabled: true,
      status: "PUBLISHED",
      sortOrder: 1,
      publishedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
    },
    create: {
      id: DEMO_EXTRACTION_GUIDE.practiceGuideId,
      clinicId,
      guideTemplateId: template.id,
      pinnedRevisionId: revision.id,
      publicSlug: DEMO_EXTRACTION_GUIDE.slug,
      isEnabled: true,
      status: "PUBLISHED",
      sortOrder: 1,
      publishedAt: DEMO_EXTRACTION_GUIDE.publishedAt,
    },
  });

  await prisma.practiceGuideOverride.upsert({
    where: { id: DEMO_EXTRACTION_GUIDE.overrideId },
    update: {
      practiceGuideId: practiceGuide.id,
      sectionKey: DEMO_EXTRACTION_GUIDE.override.sectionKey,
      title: DEMO_EXTRACTION_GUIDE.override.title,
      body: DEMO_EXTRACTION_GUIDE.override.body,
    },
    create: {
      id: DEMO_EXTRACTION_GUIDE.overrideId,
      practiceGuideId: practiceGuide.id,
      sectionKey: DEMO_EXTRACTION_GUIDE.override.sectionKey,
      title: DEMO_EXTRACTION_GUIDE.override.title,
      body: DEMO_EXTRACTION_GUIDE.override.body,
    },
  });

  await prisma.practiceGuideAddition.upsert({
    where: { id: DEMO_EXTRACTION_GUIDE.additionId },
    update: {
      practiceGuideId: practiceGuide.id,
      key: DEMO_EXTRACTION_GUIDE.addition.key,
      kind: DEMO_EXTRACTION_GUIDE.addition.kind,
      title: DEMO_EXTRACTION_GUIDE.addition.title,
      body: DEMO_EXTRACTION_GUIDE.addition.body,
      sortOrder: DEMO_EXTRACTION_GUIDE.addition.sortOrder,
      insertAfterSectionKey:
        DEMO_EXTRACTION_GUIDE.addition.insertAfterSectionKey,
    },
    create: {
      id: DEMO_EXTRACTION_GUIDE.additionId,
      practiceGuideId: practiceGuide.id,
      key: DEMO_EXTRACTION_GUIDE.addition.key,
      kind: DEMO_EXTRACTION_GUIDE.addition.kind,
      title: DEMO_EXTRACTION_GUIDE.addition.title,
      body: DEMO_EXTRACTION_GUIDE.addition.body,
      sortOrder: DEMO_EXTRACTION_GUIDE.addition.sortOrder,
      insertAfterSectionKey:
        DEMO_EXTRACTION_GUIDE.addition.insertAfterSectionKey,
    },
  });

  return { template, revision, practiceGuide };
}

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { id: DEMO_CLINIC.id },
    update: {
      name: DEMO_CLINIC.name,
      slug: DEMO_CLINIC.slug,
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

  const room = await prisma.room.upsert({
    where: { id: DEMO_ROOM.id },
    update: {
      clinicId: clinic.id,
      name: DEMO_ROOM.name,
      slug: DEMO_ROOM.slug,
    },
    create: {
      id: DEMO_ROOM.id,
      clinicId: clinic.id,
      name: DEMO_ROOM.name,
      slug: DEMO_ROOM.slug,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { id: DEMO_DOCTOR.id },
    update: {
      clinicId: clinic.id,
      name: DEMO_DOCTOR.name,
      slug: DEMO_DOCTOR.slug,
    },
    create: {
      id: DEMO_DOCTOR.id,
      clinicId: clinic.id,
      name: DEMO_DOCTOR.name,
      slug: DEMO_DOCTOR.slug,
    },
  });

  const procedureTemplates = [];
  for (const template of DEMO_PROCEDURE_TEMPLATES) {
    procedureTemplates.push(await upsertProcedureTemplate(clinic.id, template));
  }

  const aftercareDemo = await upsertAftercareDemo(clinic.id);

  console.info("Seeded clinic-scoped demo data:");
  console.info(
    `- Clinic: ${clinic.name} (${clinic.id}) slug=${DEMO_CLINIC.slug}`
  );
  console.info(
    `- Admin: ${adminUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.admin.role})`
  );
  console.info(
    `- Staff: ${staffUser.email} / ${DEMO_PASSWORD} (${DEMO_USERS.staff.role})`
  );
  for (const [index, template] of procedureTemplates.entries()) {
    const seededTemplate = DEMO_PROCEDURE_TEMPLATES[index];
    console.info(
      `- Procedure template: ${template.name} (${template.id}) with ${seededTemplate.stages.length} stages and ${seededTemplate.selectedAreaOptions.length} selected-area options`
    );
  }
  console.info(`- Room: ${room.name} (${room.id})`);
  console.info(`- Doctor: ${doctor.name} (${doctor.id})`);
  console.info(
    `- Clinic profile: ${DEMO_CLINIC_PROFILE.displayName} (patient-facing)`
  );
  console.info(
    `- Aftercare template: ${aftercareDemo.template.title} (${aftercareDemo.template.slug}) revision v${aftercareDemo.revision.version}`
  );
  console.info(
    `- Practice guide: ${aftercareDemo.practiceGuide.publicSlug} pinned=${aftercareDemo.revision.id} published/enabled`
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
