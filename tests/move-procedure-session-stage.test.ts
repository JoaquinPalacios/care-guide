import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const procedureSession = {
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const procedureStageTemplate = {
    findMany: vi.fn(),
  };
  const sessionStageState = {
    update: vi.fn(),
  };
  const procedureSessionStageTransition = {
    create: vi.fn(),
  };

  const tx = {
    procedureSession,
    procedureStageTemplate,
    sessionStageState,
    procedureSessionStageTransition,
  };

  const $transaction = vi.fn(
    async (callback: (handle: typeof tx) => Promise<unknown>) => callback(tx)
  );

  return {
    tx,
    client: {
      ...tx,
      $transaction,
    },
  };
});

const publisherMock = vi.hoisted(() => ({
  publish: vi.fn(),
}));

const getSessionEventPublisherMock = vi.hoisted(() =>
  vi.fn(() => publisherMock)
);

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock.client,
}));

vi.mock("@/lib/realtime/publisher", () => ({
  getSessionEventPublisher: getSessionEventPublisherMock,
}));

vi.mock("@prisma/client", () => ({
  ProcedureSessionStatus: {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
  },
  ProcedureSessionStageTransitionDirection: {
    NEXT: "NEXT",
    PREVIOUS: "PREVIOUS",
  },
  Prisma: {
    TransactionIsolationLevel: {
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable",
    },
  },
}));

import { moveProcedureSessionStage } from "@/lib/sessions/move-procedure-session-stage";
import {
  SessionNotFoundError,
  SessionNotTransitionableError,
} from "@/lib/sessions/errors";

const SESSION_ID = "session_1";
const CLINIC_ID = "clinic_1";
const TEMPLATE_ID = "template_1";
const DISPLAY_TOKEN = "display_token_1";
const STAGE_1 = "stage_1";
const STAGE_2 = "stage_2";
const STAGE_3 = "stage_3";
const ACTOR_USER_ID = "user_1";

function setupActiveSession(
  overrides: {
    currentStageTemplateId?: string | null;
    status?: "DRAFT" | "ACTIVE" | "COMPLETED";
    stageIds?: string[];
  } = {}
) {
  const currentStageTemplateId = overrides.currentStageTemplateId ?? STAGE_2;
  const stageIds = overrides.stageIds ?? [STAGE_1, STAGE_2, STAGE_3];
  const status = overrides.status ?? "ACTIVE";

  prismaMock.tx.procedureSession.findFirst.mockResolvedValue({
    id: SESSION_ID,
    status,
    procedureTemplateId: TEMPLATE_ID,
    displayToken: DISPLAY_TOKEN,
    stageState: { currentStageTemplateId },
  });

  prismaMock.tx.procedureStageTemplate.findMany.mockResolvedValue(
    stageIds.map((id) => ({ id }))
  );

  prismaMock.tx.sessionStageState.update.mockResolvedValue({
    id: "state_1",
  });

  prismaMock.tx.procedureSession.update.mockResolvedValue({
    id: SESSION_ID,
  });

  prismaMock.tx.procedureSessionStageTransition.create.mockResolvedValue({
    id: "transition_1",
  });
}

describe("moveProcedureSessionStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    publisherMock.publish.mockResolvedValue(undefined);
    getSessionEventPublisherMock.mockReturnValue(publisherMock);
  });

  it("advances NEXT to the following stage and returns `advanced`", async () => {
    setupActiveSession();

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "NEXT",
      actorUserId: ACTOR_USER_ID,
    });

    expect(result.kind).toBe("advanced");
    if (result.kind !== "advanced") {
      throw new Error("expected advanced result");
    }
    expect(result.fromStageTemplateId).toBe(STAGE_2);
    expect(result.toStageTemplateId).toBe(STAGE_3);
    expect(result.promotedToActive).toBe(false);
    expect(result.currentStageStartedAt).toBeInstanceOf(Date);

    expect(prismaMock.client.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" }
    );

    expect(prismaMock.tx.sessionStageState.update).toHaveBeenCalledWith({
      where: { procedureSessionId: SESSION_ID },
      data: {
        currentStageTemplateId: STAGE_3,
        currentStageStartedAt: result.currentStageStartedAt,
      },
    });

    expect(
      prismaMock.tx.procedureSessionStageTransition.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          procedureSessionId: SESSION_ID,
          direction: "NEXT",
          fromStageTemplateId: STAGE_2,
          toStageTemplateId: STAGE_3,
          actorUserId: ACTOR_USER_ID,
          occurredAt: result.currentStageStartedAt,
        }),
      })
    );

    expect(prismaMock.tx.procedureSession.update).not.toHaveBeenCalled();
  });

  it("rewinds PREVIOUS to the prior stage and returns `rewound`", async () => {
    setupActiveSession();

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "PREVIOUS",
    });

    expect(result.kind).toBe("rewound");
    if (result.kind !== "rewound") {
      throw new Error("expected rewound result");
    }
    expect(result.fromStageTemplateId).toBe(STAGE_2);
    expect(result.toStageTemplateId).toBe(STAGE_1);

    expect(prismaMock.tx.sessionStageState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentStageTemplateId: STAGE_1,
        }),
      })
    );

    expect(
      prismaMock.tx.procedureSessionStageTransition.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          direction: "PREVIOUS",
          fromStageTemplateId: STAGE_2,
          toStageTemplateId: STAGE_1,
          actorUserId: null,
        }),
      })
    );
  });

  it("returns at-boundary without writes when NEXT is called on the last stage", async () => {
    setupActiveSession({ currentStageTemplateId: STAGE_3 });

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "NEXT",
    });

    expect(result).toEqual({
      kind: "at-boundary",
      direction: "NEXT",
      currentStageTemplateId: STAGE_3,
    });

    expect(prismaMock.tx.sessionStageState.update).not.toHaveBeenCalled();
    expect(prismaMock.tx.procedureSession.update).not.toHaveBeenCalled();
    expect(
      prismaMock.tx.procedureSessionStageTransition.create
    ).not.toHaveBeenCalled();
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });

  it("returns at-boundary without writes when PREVIOUS is called on the first stage", async () => {
    setupActiveSession({ currentStageTemplateId: STAGE_1 });

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "PREVIOUS",
    });

    expect(result).toEqual({
      kind: "at-boundary",
      direction: "PREVIOUS",
      currentStageTemplateId: STAGE_1,
    });

    expect(prismaMock.tx.sessionStageState.update).not.toHaveBeenCalled();
    expect(
      prismaMock.tx.procedureSessionStageTransition.create
    ).not.toHaveBeenCalled();
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });

  it("throws SessionNotFoundError when the session is missing or from another clinic", async () => {
    prismaMock.tx.procedureSession.findFirst.mockResolvedValue(null);

    await expect(
      moveProcedureSessionStage({
        sessionId: SESSION_ID,
        clinicId: CLINIC_ID,
        direction: "NEXT",
      })
    ).rejects.toBeInstanceOf(SessionNotFoundError);

    expect(prismaMock.tx.sessionStageState.update).not.toHaveBeenCalled();
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });

  it("throws SessionNotTransitionableError when the session is COMPLETED", async () => {
    setupActiveSession({ status: "COMPLETED" });

    await expect(
      moveProcedureSessionStage({
        sessionId: SESSION_ID,
        clinicId: CLINIC_ID,
        direction: "NEXT",
      })
    ).rejects.toBeInstanceOf(SessionNotTransitionableError);

    expect(prismaMock.tx.sessionStageState.update).not.toHaveBeenCalled();
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });

  it("promotes DRAFT to ACTIVE and sets startedAt on the first real transition", async () => {
    setupActiveSession({
      status: "DRAFT",
      currentStageTemplateId: STAGE_1,
    });

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "NEXT",
      actorUserId: ACTOR_USER_ID,
    });

    if (result.kind !== "advanced") {
      throw new Error("expected advanced result");
    }
    expect(result.promotedToActive).toBe(true);
    expect(result.fromStageTemplateId).toBe(STAGE_1);
    expect(result.toStageTemplateId).toBe(STAGE_2);

    expect(prismaMock.tx.procedureSession.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: {
        status: "ACTIVE",
        startedAt: result.currentStageStartedAt,
      },
    });

    expect(prismaMock.tx.sessionStageState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentStageTemplateId: STAGE_2,
          currentStageStartedAt: result.currentStageStartedAt,
        }),
      })
    );

    expect(publisherMock.publish).toHaveBeenCalledTimes(1);
  });

  it("does not promote DRAFT to ACTIVE when PREVIOUS is called on the first stage", async () => {
    setupActiveSession({
      status: "DRAFT",
      currentStageTemplateId: STAGE_1,
    });

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "PREVIOUS",
    });

    expect(result.kind).toBe("at-boundary");
    expect(prismaMock.tx.procedureSession.update).not.toHaveBeenCalled();
    expect(prismaMock.tx.sessionStageState.update).not.toHaveBeenCalled();
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });

  it("publishes a minimal stage.changed event after a successful commit", async () => {
    setupActiveSession();

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "NEXT",
    });

    if (result.kind !== "advanced") {
      throw new Error("expected advanced result");
    }

    expect(publisherMock.publish).toHaveBeenCalledTimes(1);
    expect(publisherMock.publish).toHaveBeenCalledWith({
      type: "stage.changed",
      sessionId: SESSION_ID,
      displayToken: DISPLAY_TOKEN,
      currentStageTemplateId: STAGE_3,
      direction: "NEXT",
      occurredAt: result.currentStageStartedAt.toISOString(),
    });
  });

  it("still returns the persisted result when the publisher throws and logs a warning", async () => {
    setupActiveSession();
    publisherMock.publish.mockRejectedValueOnce(new Error("transport down"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await moveProcedureSessionStage({
      sessionId: SESSION_ID,
      clinicId: CLINIC_ID,
      direction: "NEXT",
    });

    expect(result.kind).toBe("advanced");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "[realtime] stage.changed publish failed",
      expect.objectContaining({
        type: "stage.changed",
        sessionId: SESSION_ID,
        direction: "NEXT",
        error: expect.any(Error),
      })
    );

    warnSpy.mockRestore();
  });

  it("accepts a custom publisher via deps for injection in tests", async () => {
    setupActiveSession();
    const customPublisher = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await moveProcedureSessionStage(
      {
        sessionId: SESSION_ID,
        clinicId: CLINIC_ID,
        direction: "NEXT",
      },
      undefined,
      { publisher: customPublisher }
    );

    expect(result.kind).toBe("advanced");
    expect(customPublisher.publish).toHaveBeenCalledTimes(1);
    expect(publisherMock.publish).not.toHaveBeenCalled();
  });
});
