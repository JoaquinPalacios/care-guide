import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { prisma } from "@/lib/prisma";

export async function unpublishPracticeGuide(input: {
  clinicId: string;
  actorUserId: string;
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
      revision.status === GuideRevisionStatus.PUBLISHED && revision.version > 0
  );

  if (guide.status !== PracticeGuideStatus.PUBLISHED) {
    throw new ClinicPortalError(
      "Only currently published guides can be unpublished.",
      "conflict"
    );
  }

  if (!hasPublishedRevision) {
    throw new ClinicPortalError(
      "This guide has no published revision to unpublish.",
      "conflict"
    );
  }

  await prisma.practiceGuide.update({
    where: { id: guide.id },
    data: {
      status: PracticeGuideStatus.UNPUBLISHED,
      isEnabled: false,
    },
  });

  return { id: guide.id };
}
