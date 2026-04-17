import "server-only";

import {
  PatientDisplayMode,
  Prisma,
  ProcedureSessionStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { generateDisplayToken } from "@/lib/sessions/display-token";
import {
  InvalidDoctorError,
  InvalidRoomError,
  InvalidSelectedAreaOptionError,
  InvalidTemplateError,
  MissingSelectedAreaOptionError,
  RoomOccupiedError,
  TemplateHasNoStagesError,
  UnexpectedSelectedAreaOptionError,
} from "@/lib/sessions/errors";

export interface CreateProcedureSessionInput {
  clinicId: string;
  roomId: string;
  doctorId: string;
  procedureTemplateId: string;
  selectedAreaOptionId: string | null;
  displayMode: PatientDisplayMode;
}

export interface CreateProcedureSessionResult {
  sessionId: string;
  displayToken: string;
  firstStageTemplateId: string;
}

const ROOM_OCCUPIED_STATUSES: ProcedureSessionStatus[] = [
  ProcedureSessionStatus.DRAFT,
  ProcedureSessionStatus.ACTIVE,
];

type PrismaLike = Pick<typeof prisma, "$transaction">;

/**
 * Atomically create a `ProcedureSession` in `DRAFT` with its
 * `SessionStageState` and `PatientDisplayPreferences`. All validation is
 * re-performed inside the transaction against the same handle so room
 * occupancy and clinic scoping cannot drift between check and write.
 *
 * The transaction is requested at `Serializable` isolation for the strongest
 * guarantee on the room-occupancy rule. If the local Postgres does not
 * support it, callers can fall back via the optional `client` argument or by
 * temporarily relaxing the isolation level; Issue #11 is responsible for
 * hardening concurrency around stage transitions.
 */
export async function createProcedureSession(
  input: CreateProcedureSessionInput,
  client: PrismaLike = prisma
): Promise<CreateProcedureSessionResult> {
  const displayToken = generateDisplayToken();

  return client.$transaction(
    async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: input.roomId },
        select: { id: true, clinicId: true, isActive: true },
      });

      if (!room || room.clinicId !== input.clinicId || !room.isActive) {
        throw new InvalidRoomError();
      }

      const doctor = await tx.doctor.findUnique({
        where: { id: input.doctorId },
        select: { id: true, clinicId: true, isActive: true },
      });

      if (!doctor || doctor.clinicId !== input.clinicId || !doctor.isActive) {
        throw new InvalidDoctorError();
      }

      const template = await tx.procedureTemplate.findUnique({
        where: { id: input.procedureTemplateId },
        select: {
          id: true,
          clinicId: true,
          isActive: true,
          stageTemplates: {
            orderBy: { stageOrder: "asc" },
            select: { id: true, stageOrder: true },
          },
          selectedAreaOptions: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      });

      if (
        !template ||
        template.clinicId !== input.clinicId ||
        !template.isActive
      ) {
        throw new InvalidTemplateError();
      }

      const firstStage = template.stageTemplates[0];

      if (!firstStage) {
        throw new TemplateHasNoStagesError();
      }

      const activeOptionIds = new Set(
        template.selectedAreaOptions.map((option) => option.id)
      );

      if (activeOptionIds.size === 0) {
        if (input.selectedAreaOptionId !== null) {
          throw new UnexpectedSelectedAreaOptionError();
        }
      } else if (input.selectedAreaOptionId === null) {
        throw new MissingSelectedAreaOptionError();
      } else if (!activeOptionIds.has(input.selectedAreaOptionId)) {
        throw new InvalidSelectedAreaOptionError();
      }

      const conflict = await tx.procedureSession.findFirst({
        where: {
          roomId: input.roomId,
          status: { in: ROOM_OCCUPIED_STATUSES },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new RoomOccupiedError();
      }

      const session = await tx.procedureSession.create({
        data: {
          clinicId: input.clinicId,
          roomId: input.roomId,
          doctorId: input.doctorId,
          procedureTemplateId: input.procedureTemplateId,
          selectedAreaOptionId: input.selectedAreaOptionId,
          status: ProcedureSessionStatus.DRAFT,
          displayToken,
        },
        select: { id: true, displayToken: true },
      });

      await tx.sessionStageState.create({
        data: {
          procedureSessionId: session.id,
          currentStageTemplateId: firstStage.id,
        },
        select: { id: true },
      });

      await tx.patientDisplayPreferences.create({
        data: {
          procedureSessionId: session.id,
          mode: input.displayMode,
        },
        select: { id: true },
      });

      return {
        sessionId: session.id,
        displayToken: session.displayToken,
        firstStageTemplateId: firstStage.id,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
