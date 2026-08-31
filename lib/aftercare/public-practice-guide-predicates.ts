import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";

export const PUBLIC_PRACTICE_GUIDE_WHERE = {
  isEnabled: true,
  status: PracticeGuideStatus.PUBLISHED,
  pinnedRevision: {
    status: GuideRevisionStatus.PUBLISHED,
  },
} as const;
