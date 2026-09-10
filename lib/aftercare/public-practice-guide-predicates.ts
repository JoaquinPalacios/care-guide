import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * Public patient visibility. A guide is public when it is enabled, the
 * practice guide is published, and either:
 * - a published clinic-owned content revision exists, or
 * - no content revisions exist yet and the canonical pin is published
 *   (legacy fallback for unmigrated rows).
 */
export const PUBLIC_PRACTICE_GUIDE_WHERE: Prisma.PracticeGuideWhereInput = {
  isEnabled: true,
  status: PracticeGuideStatus.PUBLISHED,
  OR: [
    {
      contentRevisions: {
        some: {
          status: GuideRevisionStatus.PUBLISHED,
          version: { gt: 0 },
        },
      },
    },
    {
      AND: [
        { contentRevisions: { none: {} } },
        {
          pinnedRevision: {
            status: GuideRevisionStatus.PUBLISHED,
          },
        },
      ],
    },
  ],
};
