import { GuideRevisionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface CanonicalGuideTemplateOption {
  id: string;
  slug: string;
  title: string;
  specialty: string;
  alreadyEnabled: boolean;
}

export async function listCanonicalGuideTemplates(
  clinicId: string
): Promise<CanonicalGuideTemplateOption[]> {
  const [templates, enabled] = await Promise.all([
    prisma.guideTemplate.findMany({
      where: {
        isActive: true,
        revisions: {
          some: { status: GuideRevisionStatus.PUBLISHED },
        },
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        specialty: true,
      },
    }),
    prisma.practiceGuide.findMany({
      where: {
        clinicId,
        guideTemplateId: { not: null },
      },
      select: { guideTemplateId: true },
    }),
  ]);

  const enabledIds = new Set(
    enabled
      .map((guide) => guide.guideTemplateId)
      .filter((id): id is string => Boolean(id))
  );

  return templates.map((template) => ({
    ...template,
    alreadyEnabled: enabledIds.has(template.id),
  }));
}
