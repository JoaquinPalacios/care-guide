import "server-only";

import { PatientDisplayMode, ProcedureSessionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Result of a patient-display load. The route renders the same generic
 * "unavailable" screen for `kind: "unavailable"` regardless of the underlying
 * cause (unknown token, draft, completed, or defensive shape mismatch) so the
 * patient surface never leaks staff-facing state.
 */
export type LoadPatientDisplayResult =
  | { kind: "unavailable" }
  | {
      kind: "ok";
      mode: PatientDisplayMode;
      procedureName: string;
      selectedAreaLabel: string | null;
      currentStage: {
        title: string;
        copy: string;
        illustrationUrl: string | null;
      };
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
      procedureTemplate: { select: { name: true } },
      selectedAreaOption: { select: { label: true } },
      displayPreferences: { select: { mode: true } },
      stageState: {
        select: {
          currentStageTemplateId: true,
          currentStageTemplate: {
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

  if (session.status !== ProcedureSessionStatus.ACTIVE) {
    return UNAVAILABLE;
  }

  const stageState = session.stageState;
  const currentStageTemplate = stageState?.currentStageTemplate;
  const currentStageTemplateId = stageState?.currentStageTemplateId;

  if (!stageState || !currentStageTemplateId || !currentStageTemplate) {
    return UNAVAILABLE;
  }

  const displayPreferences = session.displayPreferences;
  if (!displayPreferences) {
    return UNAVAILABLE;
  }

  const override = session.stageOverrides.find(
    (entry) => entry.procedureStageTemplateId === currentStageTemplateId
  );

  const title = override?.title ?? currentStageTemplate.title;
  const copy = resolveCopy(
    displayPreferences.mode,
    currentStageTemplate,
    override
  );

  return {
    kind: "ok",
    mode: displayPreferences.mode,
    procedureName: session.procedureTemplate.name,
    selectedAreaLabel: session.selectedAreaOption?.label ?? null,
    currentStage: {
      title,
      copy,
      illustrationUrl: currentStageTemplate.illustrationUrl ?? null,
    },
  };
}

interface StageCopyFields {
  calmCopy: string;
  patientCopy: string;
  detailedCopy: string;
}

interface StageCopyOverrideFields {
  calmCopy: string | null;
  patientCopy: string | null;
  detailedCopy: string | null;
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
