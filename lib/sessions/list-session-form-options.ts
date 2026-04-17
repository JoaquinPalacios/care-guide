import "server-only";

import { prisma } from "@/lib/prisma";

export interface SessionFormRoomOption {
  id: string;
  name: string;
}

export interface SessionFormDoctorOption {
  id: string;
  name: string;
}

export interface SessionFormSelectedAreaOption {
  id: string;
  key: string;
  label: string;
}

export interface SessionFormTemplateOption {
  id: string;
  name: string;
  selectedAreaOptions: SessionFormSelectedAreaOption[];
}

export interface SessionFormOptions {
  rooms: SessionFormRoomOption[];
  doctors: SessionFormDoctorOption[];
  procedureTemplates: SessionFormTemplateOption[];
}

/**
 * Load the active rooms, doctors, and procedure templates available to a
 * clinic for use in the `/sessions/new` form. Selected-area options are
 * embedded on each template so the client form can render them without an
 * extra round trip.
 */
export async function listSessionFormOptions(
  clinicId: string
): Promise<SessionFormOptions> {
  const [rooms, doctors, procedureTemplates] = await Promise.all([
    prisma.room.findMany({
      where: { clinicId, isActive: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.doctor.findMany({
      where: { clinicId, isActive: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.procedureTemplate.findMany({
      where: { clinicId, isActive: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        selectedAreaOptions: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, key: true, label: true },
        },
      },
    }),
  ]);

  return { rooms, doctors, procedureTemplates };
}
