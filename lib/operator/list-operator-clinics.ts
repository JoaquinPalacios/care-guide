import { PracticeGuideStatus } from "@prisma/client";

import { clinicSetupChecks } from "@/lib/clinic-portal/setup-status";
import { prisma } from "@/lib/prisma";

export interface OperatorClinicListItem {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  guideCount: number;
  publishedGuideCount: number;
  setupLabel: string;
  updatedAt: Date;
}

export async function listOperatorClinics(): Promise<OperatorClinicListItem[]> {
  const clinics = await prisma.clinic.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      profile: {
        select: {
          displayName: true,
          logoUrl: true,
          primaryColor: true,
          accentColor: true,
          themeMode: true,
          phone: true,
          contactUrl: true,
          emergencyInstructions: true,
          updatedAt: true,
        },
      },
      practiceGuides: {
        select: {
          status: true,
          isEnabled: true,
        },
      },
    },
  });

  return clinics.map((clinic) => {
    const publishedGuideCount = clinic.practiceGuides.filter(
      (guide) =>
        guide.status === PracticeGuideStatus.PUBLISHED && guide.isEnabled
    ).length;
    const setup = clinicSetupChecks({
      displayName: clinic.profile?.displayName ?? null,
      logoUrl: clinic.profile?.logoUrl ?? null,
      primaryColor: clinic.profile?.primaryColor ?? null,
      accentColor: clinic.profile?.accentColor ?? null,
      themeMode: clinic.profile?.themeMode ?? null,
      phone: clinic.profile?.phone ?? null,
      contactUrl: clinic.profile?.contactUrl ?? null,
      emergencyInstructions: clinic.profile?.emergencyInstructions ?? null,
      publishedGuideCount,
    });
    const needsAttention = setup.some(
      (check) => check.state === "needs_attention"
    );

    return {
      id: clinic.id,
      name: clinic.name,
      displayName: clinic.profile?.displayName?.trim() || clinic.name,
      slug: clinic.slug,
      guideCount: clinic.practiceGuides.length,
      publishedGuideCount,
      setupLabel: needsAttention ? "Needs attention" : "Configured",
      updatedAt: clinic.profile?.updatedAt ?? clinic.updatedAt,
    };
  });
}

export { summarizeOperatorClinics } from "@/lib/operator/summarize-operator-clinics";
