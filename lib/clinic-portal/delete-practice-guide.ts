import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

import { WORKING_DRAFT_VERSION } from "@/lib/aftercare/practice-revision-document";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { prisma } from "@/lib/prisma";

export async function deleteUnpublishedPracticeGuide(input: {
  clinicId: string;
  guideId: string;
}): Promise<{ id: string }> {
  const guide = await prisma.practiceGuide.findFirst({
    where: {
      id: input.guideId,
      clinicId: input.clinicId,
    },
    select: {
      id: true,
      status: true,
      publishedAt: true,
      contentRevisions: {
        select: {
          version: true,
          status: true,
        },
      },
    },
  });

  if (!guide) {
    throw new ClinicPortalError("Guide not found.", "not_found");
  }

  const hasPublishedRevision = guide.contentRevisions.some(
    (revision) =>
      revision.status === GuideRevisionStatus.PUBLISHED &&
      revision.version > WORKING_DRAFT_VERSION
  );

  if (
    guide.status === PracticeGuideStatus.PUBLISHED ||
    guide.publishedAt ||
    hasPublishedRevision
  ) {
    throw new ClinicPortalError(
      "Published guides cannot be deleted in this phase.",
      "conflict"
    );
  }

  await prisma.practiceGuide.delete({
    where: { id: guide.id },
  });

  return { id: guide.id };
}
