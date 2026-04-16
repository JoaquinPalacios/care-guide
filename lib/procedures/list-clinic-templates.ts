import "server-only";

import { prisma } from "@/lib/prisma";

export interface ClinicProcedureTemplateStage {
  stageOrder: number;
  title: string;
  calmCopy: string;
  patientCopy: string;
  detailedCopy: string;
  illustrationUrl: string | null;
  defaultDurationHint: string | null;
}

export interface ClinicProcedureTemplateSelectedAreaOption {
  key: string;
  label: string;
  sortOrder: number;
}

export interface ClinicProcedureTemplateListItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  stageTemplates: ClinicProcedureTemplateStage[];
  selectedAreaOptions: ClinicProcedureTemplateSelectedAreaOption[];
}

export async function listActiveClinicProcedureTemplates(
  clinicId: string
): Promise<ClinicProcedureTemplateListItem[]> {
  return prisma.procedureTemplate.findMany({
    where: {
      clinicId,
      isActive: true,
    },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      stageTemplates: {
        orderBy: { stageOrder: "asc" },
        select: {
          stageOrder: true,
          title: true,
          calmCopy: true,
          patientCopy: true,
          detailedCopy: true,
          illustrationUrl: true,
          defaultDurationHint: true,
        },
      },
      selectedAreaOptions: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          key: true,
          label: true,
          sortOrder: true,
        },
      },
    },
  });
}
