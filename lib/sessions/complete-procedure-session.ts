import "server-only";

import { ProcedureSessionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { SessionNotFoundError } from "@/lib/sessions/errors";

export interface CompleteProcedureSessionInput {
  sessionId: string;
  clinicId: string;
}

export type CompleteProcedureSessionResult =
  | { kind: "completed" }
  | { kind: "already-completed" };

const COMPLETABLE_STATUSES: ProcedureSessionStatus[] = [
  ProcedureSessionStatus.DRAFT,
  ProcedureSessionStatus.ACTIVE,
];

type PrismaLike = Pick<typeof prisma, "procedureSession">;

/**
 * Mark a clinic's `ProcedureSession` as `COMPLETED`, unblocking its room for
 * a new session. The status guard inside `updateMany` makes the write
 * race-safe: only DRAFT or ACTIVE rows transition, and a concurrent caller
 * sees `count === 0` instead of overwriting a freshly-completed session.
 *
 * On `count === 0` we discriminate the cause with a follow-up read so that
 * an already-completed session is reported as a benign idempotent no-op
 * while a missing or wrong-clinic session surfaces as `SessionNotFoundError`.
 * `startedAt` is intentionally not touched: a DRAFT-to-COMPLETED jump never
 * actually started the procedure.
 */
export async function completeProcedureSession(
  input: CompleteProcedureSessionInput,
  client: PrismaLike = prisma
): Promise<CompleteProcedureSessionResult> {
  const result = await client.procedureSession.updateMany({
    where: {
      id: input.sessionId,
      clinicId: input.clinicId,
      status: { in: COMPLETABLE_STATUSES },
    },
    data: {
      status: ProcedureSessionStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  if (result.count > 0) {
    return { kind: "completed" };
  }

  const existing = await client.procedureSession.findFirst({
    where: { id: input.sessionId, clinicId: input.clinicId },
    select: { status: true },
  });

  if (!existing) {
    throw new SessionNotFoundError();
  }

  return { kind: "already-completed" };
}
