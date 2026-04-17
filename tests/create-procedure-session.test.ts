import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const room = { findUnique: vi.fn() };
  const doctor = { findUnique: vi.fn() };
  const procedureTemplate = { findUnique: vi.fn() };
  const procedureSession = {
    findFirst: vi.fn(),
    create: vi.fn(),
  };
  const sessionStageState = { create: vi.fn() };
  const patientDisplayPreferences = { create: vi.fn() };

  const tx = {
    room,
    doctor,
    procedureTemplate,
    procedureSession,
    sessionStageState,
    patientDisplayPreferences,
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

const generateDisplayTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock.client,
}));

vi.mock("@/lib/sessions/display-token", () => ({
  generateDisplayToken: generateDisplayTokenMock,
}));

vi.mock("@prisma/client", () => ({
  PatientDisplayMode: {
    CALM: "CALM",
    STANDARD: "STANDARD",
    DETAILED: "DETAILED",
  },
  ProcedureSessionStatus: {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
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

import { createProcedureSession } from "@/lib/sessions/create-procedure-session";
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

const CLINIC_ID = "clinic_1";
const ROOM_ID = "room_1";
const DOCTOR_ID = "doctor_1";
const TEMPLATE_ID = "template_1";
const OPTION_ID = "option_1";
const OTHER_OPTION_ID = "option_other";
const FIRST_STAGE_ID = "stage_1";
const SECOND_STAGE_ID = "stage_2";

function buildValidInput(
  overrides: Partial<Parameters<typeof createProcedureSession>[0]> = {}
) {
  return {
    clinicId: CLINIC_ID,
    roomId: ROOM_ID,
    doctorId: DOCTOR_ID,
    procedureTemplateId: TEMPLATE_ID,
    selectedAreaOptionId: OPTION_ID,
    displayMode: "STANDARD" as const,
    ...overrides,
  };
}

function setupHappyFixtures({
  selectedAreaOptions = [{ id: OPTION_ID }],
}: { selectedAreaOptions?: { id: string }[] } = {}) {
  prismaMock.tx.room.findUnique.mockResolvedValue({
    id: ROOM_ID,
    clinicId: CLINIC_ID,
    isActive: true,
  });

  prismaMock.tx.doctor.findUnique.mockResolvedValue({
    id: DOCTOR_ID,
    clinicId: CLINIC_ID,
    isActive: true,
  });

  prismaMock.tx.procedureTemplate.findUnique.mockResolvedValue({
    id: TEMPLATE_ID,
    clinicId: CLINIC_ID,
    isActive: true,
    stageTemplates: [
      { id: FIRST_STAGE_ID, stageOrder: 1 },
      { id: SECOND_STAGE_ID, stageOrder: 2 },
    ],
    selectedAreaOptions,
  });

  prismaMock.tx.procedureSession.findFirst.mockResolvedValue(null);
  prismaMock.tx.procedureSession.create.mockResolvedValue({
    id: "session_1",
    displayToken: "token_1",
  });
  prismaMock.tx.sessionStageState.create.mockResolvedValue({ id: "state_1" });
  prismaMock.tx.patientDisplayPreferences.create.mockResolvedValue({
    id: "prefs_1",
  });
}

describe("createProcedureSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateDisplayTokenMock.mockReturnValue("token_1");
  });

  it("creates a DRAFT session with stage state and display prefs in one transaction", async () => {
    setupHappyFixtures();

    const result = await createProcedureSession(buildValidInput());

    expect(result).toEqual({
      sessionId: "session_1",
      displayToken: "token_1",
      firstStageTemplateId: FIRST_STAGE_ID,
    });

    expect(prismaMock.client.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.client.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" }
    );

    expect(prismaMock.tx.procedureSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: CLINIC_ID,
        roomId: ROOM_ID,
        doctorId: DOCTOR_ID,
        procedureTemplateId: TEMPLATE_ID,
        selectedAreaOptionId: OPTION_ID,
        status: "DRAFT",
        displayToken: "token_1",
      }),
      select: expect.any(Object),
    });

    expect(prismaMock.tx.sessionStageState.create).toHaveBeenCalledWith({
      data: {
        procedureSessionId: "session_1",
        currentStageTemplateId: FIRST_STAGE_ID,
      },
      select: expect.any(Object),
    });

    expect(prismaMock.tx.patientDisplayPreferences.create).toHaveBeenCalledWith(
      {
        data: {
          procedureSessionId: "session_1",
          mode: "STANDARD",
        },
        select: expect.any(Object),
      }
    );
  });

  it("uses the first stage by lowest stageOrder even if input is unsorted", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureTemplate.findUnique.mockResolvedValue({
      id: TEMPLATE_ID,
      clinicId: CLINIC_ID,
      isActive: true,
      stageTemplates: [
        { id: FIRST_STAGE_ID, stageOrder: 1 },
        { id: SECOND_STAGE_ID, stageOrder: 2 },
      ],
      selectedAreaOptions: [{ id: OPTION_ID }],
    });

    const result = await createProcedureSession(buildValidInput());

    expect(result.firstStageTemplateId).toBe(FIRST_STAGE_ID);
  });

  it("rejects a room from a different clinic", async () => {
    setupHappyFixtures();
    prismaMock.tx.room.findUnique.mockResolvedValue({
      id: ROOM_ID,
      clinicId: "clinic_other",
      isActive: true,
    });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(InvalidRoomError);

    expect(prismaMock.tx.procedureSession.create).not.toHaveBeenCalled();
  });

  it("rejects an inactive room", async () => {
    setupHappyFixtures();
    prismaMock.tx.room.findUnique.mockResolvedValue({
      id: ROOM_ID,
      clinicId: CLINIC_ID,
      isActive: false,
    });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(InvalidRoomError);
  });

  it("rejects a doctor from a different clinic", async () => {
    setupHappyFixtures();
    prismaMock.tx.doctor.findUnique.mockResolvedValue({
      id: DOCTOR_ID,
      clinicId: "clinic_other",
      isActive: true,
    });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(InvalidDoctorError);
  });

  it("rejects an inactive doctor", async () => {
    setupHappyFixtures();
    prismaMock.tx.doctor.findUnique.mockResolvedValue({
      id: DOCTOR_ID,
      clinicId: CLINIC_ID,
      isActive: false,
    });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(InvalidDoctorError);
  });

  it("rejects a template from a different clinic", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureTemplate.findUnique.mockResolvedValue({
      id: TEMPLATE_ID,
      clinicId: "clinic_other",
      isActive: true,
      stageTemplates: [{ id: FIRST_STAGE_ID, stageOrder: 1 }],
      selectedAreaOptions: [],
    });

    await expect(
      createProcedureSession(buildValidInput({ selectedAreaOptionId: null }))
    ).rejects.toBeInstanceOf(InvalidTemplateError);
  });

  it("rejects an inactive template", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureTemplate.findUnique.mockResolvedValue({
      id: TEMPLATE_ID,
      clinicId: CLINIC_ID,
      isActive: false,
      stageTemplates: [{ id: FIRST_STAGE_ID, stageOrder: 1 }],
      selectedAreaOptions: [],
    });

    await expect(
      createProcedureSession(buildValidInput({ selectedAreaOptionId: null }))
    ).rejects.toBeInstanceOf(InvalidTemplateError);
  });

  it("rejects a template that has no stages configured", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureTemplate.findUnique.mockResolvedValue({
      id: TEMPLATE_ID,
      clinicId: CLINIC_ID,
      isActive: true,
      stageTemplates: [],
      selectedAreaOptions: [],
    });

    await expect(
      createProcedureSession(buildValidInput({ selectedAreaOptionId: null }))
    ).rejects.toBeInstanceOf(TemplateHasNoStagesError);
  });

  it("rejects a selected-area option that does not belong to the template", async () => {
    setupHappyFixtures({ selectedAreaOptions: [{ id: OTHER_OPTION_ID }] });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(InvalidSelectedAreaOptionError);
  });

  it("rejects a missing selected-area option when the template has active options", async () => {
    setupHappyFixtures();

    await expect(
      createProcedureSession(buildValidInput({ selectedAreaOptionId: null }))
    ).rejects.toBeInstanceOf(MissingSelectedAreaOptionError);
  });

  it("rejects a selected-area option when the template has none", async () => {
    setupHappyFixtures({ selectedAreaOptions: [] });

    await expect(
      createProcedureSession(
        buildValidInput({ selectedAreaOptionId: OPTION_ID })
      )
    ).rejects.toBeInstanceOf(UnexpectedSelectedAreaOptionError);
  });

  it("allows a null selected-area option when the template has none", async () => {
    setupHappyFixtures({ selectedAreaOptions: [] });

    await expect(
      createProcedureSession(buildValidInput({ selectedAreaOptionId: null }))
    ).resolves.toEqual({
      sessionId: "session_1",
      displayToken: "token_1",
      firstStageTemplateId: FIRST_STAGE_ID,
    });

    expect(prismaMock.tx.procedureSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          selectedAreaOptionId: null,
        }),
      })
    );
  });

  it("rejects a new session when the room already has a DRAFT or ACTIVE session", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureSession.findFirst.mockResolvedValue({
      id: "existing_1",
    });

    await expect(
      createProcedureSession(buildValidInput())
    ).rejects.toBeInstanceOf(RoomOccupiedError);

    expect(prismaMock.tx.procedureSession.findFirst).toHaveBeenCalledWith({
      where: {
        roomId: ROOM_ID,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
      select: { id: true },
    });
    expect(prismaMock.tx.procedureSession.create).not.toHaveBeenCalled();
  });

  it("allows a new session when the only existing session for the room is COMPLETED", async () => {
    setupHappyFixtures();
    prismaMock.tx.procedureSession.findFirst.mockResolvedValue(null);

    await expect(createProcedureSession(buildValidInput())).resolves.toEqual({
      sessionId: "session_1",
      displayToken: "token_1",
      firstStageTemplateId: FIRST_STAGE_ID,
    });
  });

  it("generates the displayToken through the injected helper", async () => {
    setupHappyFixtures();
    generateDisplayTokenMock.mockReturnValue("custom-token");
    prismaMock.tx.procedureSession.create.mockResolvedValue({
      id: "session_2",
      displayToken: "custom-token",
    });

    const result = await createProcedureSession(buildValidInput());

    expect(generateDisplayTokenMock).toHaveBeenCalledTimes(1);
    expect(result.displayToken).toBe("custom-token");
    expect(prismaMock.tx.procedureSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ displayToken: "custom-token" }),
      })
    );
  });
});
