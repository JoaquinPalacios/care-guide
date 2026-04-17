import "server-only";

import { ProcedureSessionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface InProgressSessionListItem {
  id: string;
  status: ProcedureSessionStatus;
  createdAt: Date;
  roomName: string;
  doctorName: string;
  procedureTemplateName: string;
  selectedAreaLabel: string | null;
}

const IN_PROGRESS_STATUSES: ProcedureSessionStatus[] = [
  ProcedureSessionStatus.DRAFT,
  ProcedureSessionStatus.ACTIVE,
];

type PrismaLike = Pick<typeof prisma, "procedureSession">;

/**
 * List all DRAFT or ACTIVE sessions for a clinic, ordered most recent first,
 * for surfacing on the dashboard. Mirrors the room-occupancy rule used by
 * `createProcedureSession` so a session shown here is exactly one that would
 * block a new session for its room.
 */
export async function listInProgressSessions(
  clinicId: string,
  client: PrismaLike = prisma
): Promise<InProgressSessionListItem[]> {
  const rows = await client.procedureSession.findMany({
    where: { clinicId, status: { in: IN_PROGRESS_STATUSES } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      room: { select: { name: true } },
      doctor: { select: { name: true } },
      procedureTemplate: { select: { name: true } },
      selectedAreaOption: { select: { label: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    roomName: row.room.name,
    doctorName: row.doctor.name,
    procedureTemplateName: row.procedureTemplate.name,
    selectedAreaLabel: row.selectedAreaOption?.label ?? null,
  }));
}
