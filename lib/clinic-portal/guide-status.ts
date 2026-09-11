import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

export type ClinicGuideLifecycleStatus =
  "draft" | "published" | "published_disabled" | "published_draft_changes";

export type GuideStatusPillTone =
  "draft" | "published" | "changes" | "disabled";

export interface GuideStatusPill {
  label: string;
  tone: GuideStatusPillTone;
}

export type GuideDestructiveAction = "delete_draft" | "discard_draft_changes";

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

export function clinicGuideStatusPills(
  status: ClinicGuideLifecycleStatus
): GuideStatusPill[] {
  switch (status) {
    case "published":
      return [{ label: "Published", tone: "published" }];
    case "published_disabled":
      return [
        { label: "Published", tone: "published" },
        { label: "Disabled", tone: "disabled" },
      ];
    case "published_draft_changes":
      return [
        { label: "Published", tone: "published" },
        { label: "Draft changes", tone: "changes" },
      ];
    default:
      return [{ label: "Draft", tone: "draft" }];
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
): GuideDestructiveAction | null {
  switch (status) {
    case "draft":
      return "delete_draft";
    case "published_draft_changes":
      return "discard_draft_changes";
    default:
      return null;
  }
}
