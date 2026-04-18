import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const procedureSession = {
    updateMany: vi.fn(),
    findFirst: vi.fn(),
  };

  return {
    procedureSession,
    client: { procedureSession },
  };
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

import { completeProcedureSession } from "@/lib/sessions/complete-procedure-session";
import { SessionNotFoundError } from "@/lib/sessions/errors";

const SESSION_ID = "session_1";
const CLINIC_ID = "clinic_1";
const DISPLAY_TOKEN = "display_token_1";
const COMPLETED_AT = new Date("2026-04-18T11:30:00.000Z");

function buildInput(
  overrides: Partial<Parameters<typeof completeProcedureSession>[0]> = {}
) {
  return {
    sessionId: SESSION_ID,
    clinicId: CLINIC_ID,
    ...overrides,
  };
}

describe("completeProcedureSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transitions a DRAFT session to COMPLETED and reports completed", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      id: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      completedAt: COMPLETED_AT,
    });

    const result = await completeProcedureSession(buildInput());

    expect(result).toEqual({ kind: "completed" });

    expect(prismaMock.procedureSession.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.procedureSession.updateMany).toHaveBeenCalledWith({
      where: {
        id: SESSION_ID,
        clinicId: CLINIC_ID,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
      data: expect.objectContaining({
        status: "COMPLETED",
        completedAt: expect.any(Date),
      }),
    });
    expect(prismaMock.procedureSession.findFirst).toHaveBeenCalledWith({
      where: { id: SESSION_ID, clinicId: CLINIC_ID },
      select: { id: true, displayToken: true, completedAt: true },
    });
  });

  it("transitions an ACTIVE session to COMPLETED via the same status guard", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      id: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      completedAt: COMPLETED_AT,
    });

    const result = await completeProcedureSession(buildInput());

    expect(result).toEqual({ kind: "completed" });
    expect(prismaMock.procedureSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ["DRAFT", "ACTIVE"] },
        }),
      })
    );
  });

  it("does not write `startedAt` when transitioning to COMPLETED", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      id: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      completedAt: COMPLETED_AT,
    });

    await completeProcedureSession(buildInput());

    const [call] = prismaMock.procedureSession.updateMany.mock.calls;
    const data = call[0].data as Record<string, unknown>;

    expect(data).not.toHaveProperty("startedAt");
  });

  it("returns already-completed when the session is already COMPLETED (idempotent)", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      status: "COMPLETED",
    });

    const result = await completeProcedureSession(buildInput());

    expect(result).toEqual({ kind: "already-completed" });

    expect(prismaMock.procedureSession.findFirst).toHaveBeenCalledWith({
      where: { id: SESSION_ID, clinicId: CLINIC_ID },
      select: { status: true },
    });
  });

  it("publishes a completion nudge after a successful completion", async () => {
    const publisher = { publish: vi.fn().mockResolvedValue(undefined) };
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      id: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      completedAt: COMPLETED_AT,
    });

    const result = await completeProcedureSession(buildInput(), undefined, {
      publisher,
    });

    expect(result).toEqual({ kind: "completed" });
    expect(publisher.publish).toHaveBeenCalledWith({
      type: "session.completed",
      sessionId: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      occurredAt: COMPLETED_AT.toISOString(),
    });
  });

  it("swallows completion nudge publish failures so completion stays safe", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publisher = { publish: vi.fn().mockRejectedValue(new Error("boom")) };
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.procedureSession.findFirst.mockResolvedValue({
      id: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      completedAt: COMPLETED_AT,
    });

    const result = await completeProcedureSession(buildInput(), undefined, {
      publisher,
    });

    expect(result).toEqual({ kind: "completed" });
    expect(warn).toHaveBeenCalled();
  });

  it("throws SessionNotFoundError when the session belongs to another clinic", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.procedureSession.findFirst.mockResolvedValue(null);

    await expect(completeProcedureSession(buildInput())).rejects.toBeInstanceOf(
      SessionNotFoundError
    );
  });

  it("throws SessionNotFoundError when the session does not exist", async () => {
    prismaMock.procedureSession.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.procedureSession.findFirst.mockResolvedValue(null);

    await expect(
      completeProcedureSession(buildInput({ sessionId: "missing" }))
    ).rejects.toBeInstanceOf(SessionNotFoundError);
  });
});
