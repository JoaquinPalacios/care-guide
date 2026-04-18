import "server-only";

import { PatientDisplayMode, ProcedureSessionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Result of a patient-display load. The route renders the same generic
 * "unavailable" screen for `kind: "unavailable"` regardless of the underlying
 * cause (unknown token, draft, or defensive shape mismatch) so the patient
 * surface never leaks staff-facing state. `COMPLETED` is the single exception:
 * it has its own calm terminal view with a minimal patient-safe payload.
 */
export type LoadPatientDisplayResult =
  | { kind: "unavailable" }
  | {
      kind: "completed";
      procedureName: string;
      aftercareUrl: string | null;
    }
  | {
      kind: "ok";
      mode: PatientDisplayMode;
      procedureName: string;
      selectedAreaLabel: string | null;
      progress: {
        current: number;
        total: number;
        label: string;
      };
      currentStage: {
        title: string;
        copy: string;
        illustrationUrl: string | null;
      };
      nextStage: {
        title: string;
        copy: string;
      } | null;
    };

type PrismaLike = Pick<typeof prisma, "procedureSession">;

const UNAVAILABLE: LoadPatientDisplayResult = { kind: "unavailable" };

/**
 * Token-scoped read for the patient display surface.
 *
 * Single-purpose by design: only the patient display route consumes this.
 * It does not accept status filters, never returns staff-only fields, and
 * must not be reused by staff code. Other surfaces should add their own
 * loader so the patient contract stays narrow.
 *
 * The lookup is keyed strictly on `ProcedureSession.displayToken`. The
 * staff-facing `[id]` route segment is never trusted for patient access.
 */
export async function loadPatientDisplay(
  displayToken: string,
  client: PrismaLike = prisma
): Promise<LoadPatientDisplayResult> {
  if (typeof displayToken !== "string" || displayToken.length === 0) {
    return UNAVAILABLE;
  }

  const session = await client.procedureSession.findUnique({
    where: { displayToken },
    select: {
      status: true,
      procedureTemplate: {
        select: {
          name: true,
          aftercareUrl: true,
          stageTemplates: {
            orderBy: { stageOrder: "asc" },
            select: {
              id: true,
              title: true,
              calmCopy: true,
              patientCopy: true,
              detailedCopy: true,
              illustrationUrl: true,
            },
          },
        },
      },
      selectedAreaOption: { select: { label: true } },
      displayPreferences: { select: { mode: true } },
      stageState: {
        select: {
          currentStageTemplateId: true,
        },
      },
      stageOverrides: {
        select: {
          procedureStageTemplateId: true,
          title: true,
          calmCopy: true,
          patientCopy: true,
          detailedCopy: true,
        },
      },
    },
  });

  if (!session) {
    return UNAVAILABLE;
  }

  if (session.status === ProcedureSessionStatus.COMPLETED) {
    return {
      kind: "completed",
      procedureName: session.procedureTemplate.name,
      aftercareUrl: session.procedureTemplate.aftercareUrl ?? null,
    };
  }

  if (session.status !== ProcedureSessionStatus.ACTIVE) {
    return UNAVAILABLE;
  }

  const stageState = session.stageState;
  const currentStageTemplateId = stageState?.currentStageTemplateId;
  const orderedStages = session.procedureTemplate.stageTemplates;

  if (!stageState || !currentStageTemplateId || orderedStages.length === 0) {
    return UNAVAILABLE;
  }

  const displayPreferences = session.displayPreferences;
  if (!displayPreferences) {
    return UNAVAILABLE;
  }

  const currentIndex = orderedStages.findIndex(
    (stage) => stage.id === currentStageTemplateId
  );

  if (currentIndex === -1) {
    return UNAVAILABLE;
  }

  const currentStageTemplate = orderedStages[currentIndex];
  const nextStageTemplate = orderedStages[currentIndex + 1] ?? null;

  const currentStage = resolveStageContent({
    mode: displayPreferences.mode,
    template: currentStageTemplate,
    override: session.stageOverrides.find(
      (entry) => entry.procedureStageTemplateId === currentStageTemplate.id
    ),
  });

  const nextStage = nextStageTemplate
    ? resolveStageContent({
        mode: displayPreferences.mode,
        template: nextStageTemplate,
        override: session.stageOverrides.find(
          (entry) => entry.procedureStageTemplateId === nextStageTemplate.id
        ),
      })
    : null;

  return {
    kind: "ok",
    mode: displayPreferences.mode,
    procedureName: session.procedureTemplate.name,
    selectedAreaLabel: session.selectedAreaOption?.label ?? null,
    progress: {
      current: currentIndex + 1,
      total: orderedStages.length,
      label: `Step ${currentIndex + 1} of ${orderedStages.length}`,
    },
    currentStage: {
      title: currentStage.title,
      copy: currentStage.copy,
      illustrationUrl: currentStageTemplate.illustrationUrl ?? null,
    },
    nextStage: nextStage
      ? {
          title: nextStage.title,
          copy: nextStage.copy,
        }
      : null,
  };
}

interface StageCopyFields {
  calmCopy: string;
  patientCopy: string;
  detailedCopy: string;
}

interface StageCopyOverrideFields {
  title: string | null;
  calmCopy: string | null;
  patientCopy: string | null;
  detailedCopy: string | null;
}

interface ResolvedStageContent {
  title: string;
  copy: string;
}

function resolveStageContent({
  mode,
  template,
  override,
}: {
  mode: PatientDisplayMode;
  template: StageCopyFields & { title: string };
  override: StageCopyOverrideFields | undefined;
}): ResolvedStageContent {
  return {
    title: override?.title ?? template.title,
    copy: resolveCopy(mode, template, override),
  };
}

function resolveCopy(
  mode: PatientDisplayMode,
  template: StageCopyFields,
  override: StageCopyOverrideFields | undefined
): string {
  switch (mode) {
    case PatientDisplayMode.CALM:
      return override?.calmCopy ?? template.calmCopy;
    case PatientDisplayMode.STANDARD:
      return override?.patientCopy ?? template.patientCopy;
    case PatientDisplayMode.DETAILED:
      return override?.detailedCopy ?? template.detailedCopy;
  }
}
