import "server-only";

import {
  Prisma,
  ProcedureSessionStageTransitionDirection,
  ProcedureSessionStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getSessionEventPublisher,
  type SessionEventPublisher,
} from "@/lib/realtime/publisher";
import {
  SessionNotFoundError,
  SessionNotTransitionableError,
} from "@/lib/sessions/errors";

export type MoveStageDirection = "NEXT" | "PREVIOUS";

export interface MoveProcedureSessionStageInput {
  sessionId: string;
  clinicId: string;
  direction: MoveStageDirection;
  actorUserId?: string | null;
}

export type MoveProcedureSessionStageResult =
  | {
      kind: "advanced" | "rewound";
      fromStageTemplateId: string;
      toStageTemplateId: string;
      currentStageStartedAt: Date;
      promotedToActive: boolean;
    }
  | {
      kind: "at-boundary";
      direction: MoveStageDirection;
      currentStageTemplateId: string | null;
    };

export interface MoveProcedureSessionStageDeps {
  publisher?: SessionEventPublisher;
}

type PrismaLike = Pick<typeof prisma, "$transaction">;

/**
 * Move a `ProcedureSession`'s current stage forward or backward by one
 * ordered step. The whole read-check-write sequence runs inside a single
 * `Serializable` transaction to mirror `createProcedureSession` and prevent
 * two control clients from racing past a boundary or double-promoting a
 * `DRAFT` session.
 *
 * Boundary actions (PREVIOUS on the first stage, NEXT on the last stage)
 * are intentionally idempotent no-ops: they return `at-boundary` without
 * writing to `SessionStageState`, without creating a history row, and
 * without publishing a realtime event. This keeps repeated clicks on a
 * disabled-looking button safe.
 *
 * The first real transition on a `DRAFT` session promotes it to `ACTIVE`
 * and sets `ProcedureSession.startedAt`. Promotion only happens alongside
 * an actual stage change so the patient display's ACTIVE-gated rendering
 * (see `loadPatientDisplay`) never flips on without the stage clock moving.
 *
 * Realtime publish is strictly best-effort and runs *after* the DB commit
 * has returned. Publish failures are logged via `console.warn` and do not
 * alter the caller's result or the persisted stage state — the database
 * remains the source of truth for every reader.
 */
export async function moveProcedureSessionStage(
  input: MoveProcedureSessionStageInput,
  client: PrismaLike = prisma,
  deps: MoveProcedureSessionStageDeps = {}
): Promise<MoveProcedureSessionStageResult> {
  const publisher = deps.publisher ?? getSessionEventPublisher();

  const outcome = await client.$transaction(
    async (tx) => {
      const session = await tx.procedureSession.findFirst({
        where: { id: input.sessionId, clinicId: input.clinicId },
        select: {
          id: true,
          status: true,
          procedureTemplateId: true,
          displayToken: true,
          stageState: { select: { currentStageTemplateId: true } },
        },
      });

      if (!session) {
        throw new SessionNotFoundError();
      }

      if (session.status === ProcedureSessionStatus.COMPLETED) {
        throw new SessionNotTransitionableError();
      }

      const orderedStages = await tx.procedureStageTemplate.findMany({
        where: { procedureTemplateId: session.procedureTemplateId },
        orderBy: { stageOrder: "asc" },
        select: { id: true },
      });

      if (orderedStages.length === 0) {
        throw new Error(
          `Procedure template ${session.procedureTemplateId} has no stages; session ${session.id} is in an invariant-breaking state.`
        );
      }

      const currentStageTemplateId =
        session.stageState?.currentStageTemplateId ?? null;

      if (currentStageTemplateId === null) {
        throw new Error(
          `Session ${session.id} has no current stage; transition is not possible until the stage state is seeded.`
        );
      }

      const currentIndex = orderedStages.findIndex(
        (stage) => stage.id === currentStageTemplateId
      );

      if (currentIndex === -1) {
        throw new Error(
          `Session ${session.id} current stage ${currentStageTemplateId} is not part of template ${session.procedureTemplateId}; stage state has drifted from the template.`
        );
      }

      const targetIndex =
        input.direction === "NEXT" ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex < 0 || targetIndex >= orderedStages.length) {
        return {
          kind: "at-boundary" as const,
          direction: input.direction,
          currentStageTemplateId,
        };
      }

      const toStageTemplateId = orderedStages[targetIndex].id;
      const now = new Date();

      await tx.sessionStageState.update({
        where: { procedureSessionId: session.id },
        data: {
          currentStageTemplateId: toStageTemplateId,
          currentStageStartedAt: now,
        },
      });

      const promotedToActive = session.status === ProcedureSessionStatus.DRAFT;

      if (promotedToActive) {
        await tx.procedureSession.update({
          where: { id: session.id },
          data: {
            status: ProcedureSessionStatus.ACTIVE,
            startedAt: now,
          },
        });
      }

      await tx.procedureSessionStageTransition.create({
        data: {
          procedureSessionId: session.id,
          direction:
            input.direction === "NEXT"
              ? ProcedureSessionStageTransitionDirection.NEXT
              : ProcedureSessionStageTransitionDirection.PREVIOUS,
          fromStageTemplateId: currentStageTemplateId,
          toStageTemplateId,
          actorUserId: input.actorUserId ?? null,
          occurredAt: now,
        },
        select: { id: true },
      });

      return {
        kind:
          input.direction === "NEXT"
            ? ("advanced" as const)
            : ("rewound" as const),
        fromStageTemplateId: currentStageTemplateId,
        toStageTemplateId,
        currentStageStartedAt: now,
        promotedToActive,
        displayToken: session.displayToken,
        sessionId: session.id,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  if (outcome.kind === "at-boundary") {
    return outcome;
  }

  try {
    await publisher.publish({
      type: "stage.changed",
      sessionId: outcome.sessionId,
      displayToken: outcome.displayToken,
      currentStageTemplateId: outcome.toStageTemplateId,
      direction: input.direction,
      occurredAt: outcome.currentStageStartedAt.toISOString(),
    });
  } catch (error) {
    console.warn("[realtime] stage.changed publish failed", {
      type: "stage.changed",
      sessionId: outcome.sessionId,
      direction: input.direction,
      error,
    });
  }

  return {
    kind: outcome.kind,
    fromStageTemplateId: outcome.fromStageTemplateId,
    toStageTemplateId: outcome.toStageTemplateId,
    currentStageStartedAt: outcome.currentStageStartedAt,
    promotedToActive: outcome.promotedToActive,
  };
}
