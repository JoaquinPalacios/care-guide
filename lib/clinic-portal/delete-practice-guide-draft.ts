import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { prisma } from "@/lib/prisma";

export async function deletePracticeGuideDraft(input: {
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

  if (guide.status === PracticeGuideStatus.PUBLISHED || hasPublishedRevision) {
    throw new ClinicPortalError(
      "Published guides cannot be deleted in this version of the portal.",
      "conflict"
    );
  }

  const deleted = await prisma.practiceGuide.deleteMany({
    where: {
      id: guide.id,
      clinicId: input.clinicId,
    },
  });

  if (deleted.count !== 1) {
    throw new ClinicPortalError("Guide not found.", "not_found");
  }

  return { id: guide.id };
}
