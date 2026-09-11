import "dotenv/config";

import { afterAll, describe, expect, it } from "vitest";
import { PracticeGuideStatus } from "@prisma/client";

import { getPublishedPracticeGuide } from "@/lib/aftercare/get-published-practice-guide";
import { createCustomPracticeGuide } from "@/lib/clinic-portal/create-practice-guide";
import { deleteUnpublishedPracticeGuide } from "@/lib/clinic-portal/delete-practice-guide";
import { discardPracticeGuideDraft } from "@/lib/clinic-portal/discard-practice-guide-draft";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { publishPracticeGuide } from "@/lib/clinic-portal/publish-practice-guide";
import { savePracticeGuideDraft } from "@/lib/clinic-portal/save-practice-guide-draft";
import { prisma } from "@/lib/prisma";

const PREFIX = "test_p2a2_";
const CLINIC_A_ID = `${PREFIX}clinic_a`;
const CLINIC_B_ID = `${PREFIX}clinic_b`;
const USER_ID = `${PREFIX}admin`;

async function cleanup() {
  await prisma.practiceGuide.deleteMany({
    where: { clinicId: { in: [CLINIC_A_ID, CLINIC_B_ID] } },
  });
  await prisma.clinicProfile.deleteMany({
    where: { clinicId: { in: [CLINIC_A_ID, CLINIC_B_ID] } },
  });
  await prisma.clinic.deleteMany({
    where: { id: { in: [CLINIC_A_ID, CLINIC_B_ID] } },
  });
  await prisma.user.deleteMany({
    where: { id: USER_ID },
  });
}

async function seedClinics() {
  await cleanup();
  await prisma.user.create({
    data: {
      id: USER_ID,
      email: `${PREFIX}admin@example.test`,
      name: "Phase 2A.2 Test Admin",
      platformRole: "NONE",
    },
  });
  await prisma.clinic.create({
    data: {
      id: CLINIC_A_ID,
      name: "Phase 2A.2 Clinic A",
      slug: "testp2a2-clinic-a",
      profile: { create: { displayName: "Clinic A" } },
    },
  });
  await prisma.clinic.create({
    data: {
      id: CLINIC_B_ID,
      name: "Phase 2A.2 Clinic B",
      slug: "testp2a2-clinic-b",
      profile: { create: { displayName: "Clinic B" } },
    },
  });
}

describe("guide draft delete and discard", () => {
  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it("lets an admin delete a never-published draft and refuses cross-clinic delete", async () => {
    await seedClinics();
    const draft = await createCustomPracticeGuide({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: { title: "Scratch draft", publicSlug: "scratch-draft" },
    });

    await expect(
      deleteUnpublishedPracticeGuide({
        clinicId: CLINIC_B_ID,
        guideId: draft.id,
      })
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ClinicPortalError && error.code === "not_found"
    );

    await deleteUnpublishedPracticeGuide({
      clinicId: CLINIC_A_ID,
      guideId: draft.id,
    });

    await expect(
      prisma.practiceGuide.findUnique({ where: { id: draft.id } })
    ).resolves.toBeNull();
  });

  it("discards draft changes without changing the public pinned revision", async () => {
    await seedClinics();
    const guide = await createCustomPracticeGuide({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: { title: "Published custom", publicSlug: "published-custom" },
    });

    await savePracticeGuideDraft({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: {
        guideId: guide.id,
        title: "Published custom",
        publicSlug: "published-custom",
        introduction: "Public intro.",
        sections: [
          {
            key: "introduction",
            kind: "INTRODUCTION",
            title: "Public intro",
            body: "Patients should see this published copy.",
            periodLabel: null,
            startDay: null,
            endDay: null,
          },
        ],
      },
    });

    await publishPracticeGuide({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      guideId: guide.id,
    });

    await savePracticeGuideDraft({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: {
        guideId: guide.id,
        title: "Secret draft title",
        publicSlug: "published-custom",
        introduction: "Draft only.",
        sections: [
          {
            key: "introduction",
            kind: "INTRODUCTION",
            title: "Draft intro",
            body: "This draft must not leak to patients.",
            periodLabel: null,
            startDay: null,
            endDay: null,
          },
        ],
      },
    });

    const before = await getPublishedPracticeGuide({
      clinicSlug: "testp2a2-clinic-a",
      publicSlug: "published-custom",
    });
    expect(before?.title).toBe("Published custom");
    expect(
      before?.sections.find((section) => section.key === "introduction")?.body
    ).toBe("Patients should see this published copy.");

    await discardPracticeGuideDraft({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      guideId: guide.id,
    });

    const after = await getPublishedPracticeGuide({
      clinicSlug: "testp2a2-clinic-a",
      publicSlug: "published-custom",
    });
    expect(after?.title).toBe("Published custom");
    expect(after?.revision.version).toBe(before?.revision.version);
    expect(
      after?.sections.find((section) => section.key === "introduction")?.body
    ).toBe("Patients should see this published copy.");

    const working = await prisma.practiceGuideRevision.findFirst({
      where: { practiceGuideId: guide.id, version: 0 },
      include: { sections: true },
    });
    expect(working?.title).toBe("Published custom");
    expect(working?.sections[0]?.body).toBe(
      "Patients should see this published copy."
    );
    const published = await prisma.practiceGuideRevision.findFirst({
      where: { practiceGuideId: guide.id, version: { gt: 0 } },
      orderBy: { version: "desc" },
    });
    expect(working?.updatedAt.getTime()).toBeLessThanOrEqual(
      published?.publishedAt?.getTime() ?? published?.updatedAt.getTime() ?? 0
    );
  });

  it("refuses to delete a published guide", async () => {
    await seedClinics();
    const guide = await createCustomPracticeGuide({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: { title: "Keep published", publicSlug: "keep-published" },
    });
    await savePracticeGuideDraft({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      values: {
        guideId: guide.id,
        title: "Keep published",
        publicSlug: "keep-published",
        introduction: null,
        sections: [
          {
            key: "introduction",
            kind: "INTRODUCTION",
            title: "Intro",
            body: "Published body.",
            periodLabel: null,
            startDay: null,
            endDay: null,
          },
        ],
      },
    });
    await publishPracticeGuide({
      clinicId: CLINIC_A_ID,
      actorUserId: USER_ID,
      guideId: guide.id,
    });

    await expect(
      deleteUnpublishedPracticeGuide({
        clinicId: CLINIC_A_ID,
        guideId: guide.id,
      })
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ClinicPortalError && error.code === "conflict"
    );

    const remaining = await prisma.practiceGuide.findUnique({
      where: { id: guide.id },
    });
    expect(remaining?.status).toBe(PracticeGuideStatus.PUBLISHED);
    expect(remaining).not.toBeNull();
  });
});
