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

export interface ClinicGuideStatusPill {
  label: string;
}

export type ClinicGuideDestructiveAction = "delete_draft" | "discard_draft";

export function clinicGuideStatusPills(
  status: ClinicGuideLifecycleStatus
): ClinicGuideStatusPill[] {
  switch (status) {
    case "published":
      return [{ label: "Published" }];
    case "published_disabled":
      return [{ label: "Published" }, { label: "Disabled" }];
    case "published_draft_changes":
      return [{ label: "Published" }, { label: "Draft changes" }];
    default:
      return [{ label: "Draft" }];
  }
}

export function clinicGuideStatusLabel(
  status: ClinicGuideLifecycleStatus
): string {
  return clinicGuideStatusPills(status)
    .map((pill) => pill.label)
    .join(" · ");
}

export function clinicGuideDestructiveAction(
  status: ClinicGuideLifecycleStatus
): ClinicGuideDestructiveAction | null {
  if (status === "draft") {
    return "delete_draft";
  }

  if (status === "published_draft_changes") {
    return "discard_draft";
  }

  return null;
}
