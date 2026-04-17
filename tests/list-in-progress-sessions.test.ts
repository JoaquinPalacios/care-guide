import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const procedureSession = { findMany: vi.fn() };
  return { procedureSession, client: { procedureSession } };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock.client,
}));

vi.mock("@prisma/client", () => ({
  ProcedureSessionStatus: {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
  },
}));

import { listInProgressSessions } from "@/lib/sessions/list-in-progress-sessions";

const CLINIC_ID = "clinic_1";
const CREATED_AT = new Date("2026-04-17T10:00:00.000Z");

describe("listInProgressSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns flattened DRAFT/ACTIVE sessions for a clinic, newest first", async () => {
    prismaMock.procedureSession.findMany.mockResolvedValue([
      {
        id: "session_1",
        status: "ACTIVE",
        createdAt: CREATED_AT,
        room: { name: "Room A" },
        doctor: { name: "Dr. Smith" },
        procedureTemplate: { name: "Procedure X" },
        selectedAreaOption: { label: "Upper right" },
      },
      {
        id: "session_2",
        status: "DRAFT",
        createdAt: CREATED_AT,
        room: { name: "Room B" },
        doctor: { name: "Dr. Jones" },
        procedureTemplate: { name: "Procedure Y" },
        selectedAreaOption: null,
      },
    ]);

    const result = await listInProgressSessions(CLINIC_ID);

    expect(result).toEqual([
      {
        id: "session_1",
        status: "ACTIVE",
        createdAt: CREATED_AT,
        roomName: "Room A",
        doctorName: "Dr. Smith",
        procedureTemplateName: "Procedure X",
        selectedAreaLabel: "Upper right",
      },
      {
        id: "session_2",
        status: "DRAFT",
        createdAt: CREATED_AT,
        roomName: "Room B",
        doctorName: "Dr. Jones",
        procedureTemplateName: "Procedure Y",
        selectedAreaLabel: null,
      },
    ]);
  });

  it("scopes by clinicId and the same DRAFT/ACTIVE statuses used for room occupancy", async () => {
    prismaMock.procedureSession.findMany.mockResolvedValue([]);

    await listInProgressSessions(CLINIC_ID);

    expect(prismaMock.procedureSession.findMany).toHaveBeenCalledWith({
      where: { clinicId: CLINIC_ID, status: { in: ["DRAFT", "ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      select: expect.any(Object),
    });
  });

  it("returns an empty list when no in-progress sessions exist", async () => {
    prismaMock.procedureSession.findMany.mockResolvedValue([]);

    const result = await listInProgressSessions(CLINIC_ID);

    expect(result).toEqual([]);
  });
});
