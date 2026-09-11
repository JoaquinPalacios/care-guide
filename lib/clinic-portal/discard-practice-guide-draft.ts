import { GuideRevisionStatus } from "@prisma/client";

import { WORKING_DRAFT_VERSION } from "@/lib/aftercare/practice-revision-document";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { prisma } from "@/lib/prisma";

export async function discardPracticeGuideDraft(input: {
  clinicId: string;
  actorUserId: string;
  guideId: string;
}): Promise<{ id: string }> {
  const guide = await prisma.practiceGuide.findFirst({
    where: {
      id: input.guideId,
      clinicId: input.clinicId,
    },
    include: {
      contentRevisions: {
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!guide) {
    throw new ClinicPortalError("Guide not found.", "not_found");
  }

  const draft = guide.contentRevisions.find(
    (revision) => revision.version === WORKING_DRAFT_VERSION
  );
  const published = guide.contentRevisions
    .filter(
      (revision) =>
        revision.status === GuideRevisionStatus.PUBLISHED &&
        revision.version > WORKING_DRAFT_VERSION
    )
    .toSorted((left, right) => right.version - left.version)[0];

  if (!draft || !published) {
    throw new ClinicPortalError(
      "There is no published version to restore.",
      "invalid"
    );
  }

  const restoredAt = published.publishedAt ?? published.updatedAt;

  return prisma.$transaction(async (tx) => {
    await tx.practiceGuideRevisionSection.deleteMany({
      where: { revisionId: draft.id },
    });

    if (published.sections.length > 0) {
      await tx.practiceGuideRevisionSection.createMany({
        data: published.sections.map((section, index) => ({
          revisionId: draft.id,
          key: section.key,
          kind: section.kind,
          title: section.title,
          body: section.body,
          periodLabel: section.periodLabel,
          startDay: section.startDay,
          endDay: section.endDay,
          sortOrder: index + 1,
          provenance: section.provenance,
        })),
      });
    }

    await tx.practiceGuideRevision.update({
      where: { id: draft.id },
      data: {
        title: published.title,
        introduction: published.introduction,
        createdByUserId: input.actorUserId,
      },
    });

    await tx.$executeRaw`
      UPDATE "PracticeGuideRevision"
      SET "updatedAt" = ${restoredAt}
      WHERE id = ${draft.id}
    `;

    await tx.practiceGuide.update({
      where: { id: guide.id },
      data: {
        title: published.title,
      },
    });

    return { id: guide.id };
  });
}
