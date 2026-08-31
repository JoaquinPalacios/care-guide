import "server-only";

import { composeGuideDocument } from "@/lib/aftercare/compose-guide-document";
import { clinicBySlugSelect } from "@/lib/aftercare/get-clinic-by-slug";
import { PUBLIC_PRACTICE_GUIDE_WHERE } from "@/lib/aftercare/public-practice-guide-predicates";
import { isValidCareGuideSlug } from "@/lib/aftercare/slug";
import type { ComposedGuideSection } from "@/lib/aftercare/types";
import { prisma } from "@/lib/prisma";

export interface PublishedPracticeGuideDocument {
  clinic: {
    id: string;
    slug: string;
    name: string;
  };
  profile: {
    displayName: string;
    logoUrl: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    bookingUrl: string | null;
    contactUrl: string | null;
    contactEmail: string | null;
    emergencyInstructions: string | null;
    showCareGuideAttribution: boolean;
  } | null;
  template: {
    id: string;
    slug: string;
    title: string;
    specialty: string;
  };
  practiceGuide: {
    id: string;
    publicSlug: string;
    publishedAt: Date | null;
  };
  revision: {
    id: string;
    version: number;
    reviewedAt: Date | null;
  };
  sections: ComposedGuideSection[];
}

const publishedGuideInclude = {
  clinic: {
    select: clinicBySlugSelect,
  },
  guideTemplate: {
    select: {
      id: true,
      slug: true,
      title: true,
      specialty: true,
    },
  },
  pinnedRevision: {
    select: {
      id: true,
      version: true,
      reviewedAt: true,
      sections: {
        orderBy: [{ sortOrder: "asc" as const }, { key: "asc" as const }],
        select: {
          key: true,
          kind: true,
          title: true,
          body: true,
          sortOrder: true,
        },
      },
    },
  },
  overrides: {
    select: {
      sectionKey: true,
      title: true,
      body: true,
    },
  },
  additions: {
    select: {
      key: true,
      kind: true,
      title: true,
      body: true,
      sortOrder: true,
      insertAfterSectionKey: true,
    },
  },
};

export async function getPublishedPracticeGuide(input: {
  clinicSlug: string;
  publicSlug: string;
}): Promise<PublishedPracticeGuideDocument | null> {
  if (
    !isValidCareGuideSlug(input.clinicSlug) ||
    !isValidCareGuideSlug(input.publicSlug)
  ) {
    return null;
  }

  const practiceGuide = await prisma.practiceGuide.findFirst({
    where: {
      publicSlug: input.publicSlug,
      clinic: { slug: input.clinicSlug },
      ...PUBLIC_PRACTICE_GUIDE_WHERE,
    },
    include: publishedGuideInclude,
  });

  if (!practiceGuide) {
    return null;
  }

  return {
    clinic: {
      id: practiceGuide.clinic.id,
      slug: practiceGuide.clinic.slug,
      name: practiceGuide.clinic.name,
    },
    profile: practiceGuide.clinic.profile,
    template: practiceGuide.guideTemplate,
    practiceGuide: {
      id: practiceGuide.id,
      publicSlug: practiceGuide.publicSlug,
      publishedAt: practiceGuide.publishedAt,
    },
    revision: {
      id: practiceGuide.pinnedRevision.id,
      version: practiceGuide.pinnedRevision.version,
      reviewedAt: practiceGuide.pinnedRevision.reviewedAt,
    },
    sections: composeGuideDocument({
      canonicalSections: practiceGuide.pinnedRevision.sections.map(
        (section) => ({
          key: section.key,
          kind: section.kind,
          title: section.title,
          body: section.body,
          sortOrder: section.sortOrder,
        })
      ),
      overrides: practiceGuide.overrides,
      additions: practiceGuide.additions.map((addition) => ({
        key: addition.key,
        kind: addition.kind,
        title: addition.title,
        body: addition.body,
        sortOrder: addition.sortOrder,
        insertAfterSectionKey: addition.insertAfterSectionKey,
      })),
    }).sections,
  };
}
