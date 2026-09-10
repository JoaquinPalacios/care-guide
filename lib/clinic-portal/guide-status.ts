import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

export type ClinicGuideLifecycleStatus =
  "draft" | "published" | "published_disabled" | "published_draft_changes";

export function clinicGuideLifecycleStatus(input: {
  status: PracticeGuideStatus;
  isEnabled: boolean;
  publishedRevisionStatus?: GuideRevisionStatus | null;
  draftUpdatedAt?: Date | null;
  publishedAt?: Date | null;
}): ClinicGuideLifecycleStatus {
  if (input.status !== PracticeGuideStatus.PUBLISHED) {
    return "draft";
  }

  if (!input.isEnabled) {
    return "published_disabled";
  }

  if (
    input.publishedRevisionStatus === GuideRevisionStatus.PUBLISHED &&
    input.draftUpdatedAt &&
    input.publishedAt &&
    input.draftUpdatedAt.getTime() > input.publishedAt.getTime()
  ) {
    return "published_draft_changes";
  }

  return "published";
}

export function clinicGuideStatusLabel(
  status: ClinicGuideLifecycleStatus
): string {
  switch (status) {
    case "published":
      return "Published";
    case "published_disabled":
      return "Published, disabled";
    case "published_draft_changes":
      return "Published · Draft changes";
    default:
      return "Draft";
  }
}
