import "server-only";

import {
  getClinicBySlug,
  type ClinicBySlugRecord,
} from "@/lib/aftercare/get-clinic-by-slug";
import { PUBLIC_PRACTICE_GUIDE_WHERE } from "@/lib/aftercare/public-practice-guide-predicates";
import { isValidCareGuideSlug } from "@/lib/aftercare/slug";
import type { PublishedPracticeGuideSummary } from "@/lib/aftercare/types";
import { prisma } from "@/lib/prisma";

export interface ListedPublishedPracticeGuides {
  clinic: {
    id: string;
    slug: string;
    name: string;
  };
  profile: ClinicBySlugRecord["profile"];
  guides: PublishedPracticeGuideSummary[];
}

export async function listPublishedPracticeGuides(
  clinicSlug: string
): Promise<ListedPublishedPracticeGuides | null> {
  if (!isValidCareGuideSlug(clinicSlug)) {
    return null;
  }

  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    return null;
  }

  const guides = await prisma.practiceGuide.findMany({
    where: {
      clinicId: clinic.id,
      ...PUBLIC_PRACTICE_GUIDE_WHERE,
    },
    orderBy: [{ sortOrder: "asc" }, { publicSlug: "asc" }],
    select: {
      id: true,
      publicSlug: true,
      sortOrder: true,
      publishedAt: true,
      guideTemplate: {
        select: { title: true },
      },
    },
  });

  return {
    clinic: {
      id: clinic.id,
      slug: clinic.slug,
      name: clinic.name,
    },
    profile: clinic.profile,
    guides: guides.map((guide) => ({
      id: guide.id,
      publicSlug: guide.publicSlug,
      title: guide.guideTemplate.title,
      sortOrder: guide.sortOrder,
      publishedAt: guide.publishedAt,
    })),
  };
}
