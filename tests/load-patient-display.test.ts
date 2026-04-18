import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const procedureSession = { findUnique: vi.fn() };
  return {
    client: { procedureSession },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock.client,
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
}));

import { loadPatientDisplay } from "@/lib/sessions/load-patient-display";

const TOKEN = "valid-token-abc";
const STAGE_ID = "stage_1";
const NEXT_STAGE_ID = "stage_2";
const FINAL_STAGE_ID = "stage_3";
const OTHER_STAGE_ID = "stage_other";

interface BuildSessionOverrides {
  status?: "DRAFT" | "ACTIVE" | "COMPLETED";
  mode?: "CALM" | "STANDARD" | "DETAILED";
  selectedAreaOption?: { label: string } | null;
  stageOverrides?: Array<{
    procedureStageTemplateId: string;
    title: string | null;
    calmCopy: string | null;
    patientCopy: string | null;
    detailedCopy: string | null;
  }>;
  illustrationUrl?: string | null;
  stageStatePresent?: boolean;
  currentStageTemplateId?: string;
  currentStageInTemplatePresent?: boolean;
  displayPreferencesPresent?: boolean;
}

function buildSession(overrides: BuildSessionOverrides = {}) {
  const stageTemplates = [
    {
      id: STAGE_ID,
      title: "Numbing the area",
      calmCopy: "We are gently numbing the area.",
      patientCopy: "Numbing the area now.",
      detailedCopy: "Applying topical anesthetic followed by injection.",
      illustrationUrl:
        overrides.illustrationUrl === undefined
          ? "https://example.test/numb.png"
          : overrides.illustrationUrl,
    },
    {
      id: NEXT_STAGE_ID,
      title: "Checking the tooth",
      calmCopy: "We are taking a close look.",
      patientCopy: "Checking the tooth carefully.",
      detailedCopy:
        "Inspecting the tooth and confirming the next treatment step.",
      illustrationUrl: null,
    },
    {
      id: FINAL_STAGE_ID,
      title: "Finishing this part",
      calmCopy: "We are finishing this part.",
      patientCopy: "Finishing this part now.",
      detailedCopy: "Completing the final steps for this part of your visit.",
      illustrationUrl: null,
    },
  ];

  return {
    status: overrides.status ?? "ACTIVE",
    procedureTemplate: {
      name: "Routine Cleaning",
      stageTemplates:
        overrides.currentStageInTemplatePresent === false
          ? stageTemplates.filter((stage) => stage.id !== STAGE_ID)
          : stageTemplates,
    },
    selectedAreaOption:
      overrides.selectedAreaOption === undefined
        ? { label: "Upper left molar" }
        : overrides.selectedAreaOption,
    displayPreferences:
      overrides.displayPreferencesPresent === false
        ? null
        : { mode: overrides.mode ?? "STANDARD" },
    stageState:
      overrides.stageStatePresent === false
        ? null
        : {
            currentStageTemplateId:
              overrides.currentStageTemplateId ?? STAGE_ID,
          },
    stageOverrides: overrides.stageOverrides ?? [],
  };
}

describe("loadPatientDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unavailable for an empty token without querying the database", async () => {
    const result = await loadPatientDisplay("");

    expect(result).toEqual({ kind: "unavailable" });
    expect(
      prismaMock.client.procedureSession.findUnique
    ).not.toHaveBeenCalled();
  });

  it("returns unavailable when the token does not match any session", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(null);

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
    expect(prismaMock.client.procedureSession.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { displayToken: TOKEN } })
    );
  });

  it("queries strictly by displayToken and never by id", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(null);

    await loadPatientDisplay(TOKEN);

    const call =
      prismaMock.client.procedureSession.findUnique.mock.calls[0]?.[0];
    expect(call?.where).toEqual({ displayToken: TOKEN });
    expect(call?.where).not.toHaveProperty("id");
  });

  it("returns unavailable for DRAFT sessions", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ status: "DRAFT" })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
  });

  it("returns unavailable for COMPLETED sessions", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ status: "COMPLETED" })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
  });

  it("returns unavailable when stage state is missing", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ stageStatePresent: false })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
  });

  it("returns unavailable when the current stage template is missing from the ordered template", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ currentStageInTemplatePresent: false })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
  });

  it("returns unavailable when display preferences are missing", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ displayPreferencesPresent: false })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({ kind: "unavailable" });
  });

  it("returns the patient-safe payload for an active session in STANDARD mode", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ mode: "STANDARD" })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toEqual({
      kind: "ok",
      mode: "STANDARD",
      procedureName: "Routine Cleaning",
      selectedAreaLabel: "Upper left molar",
      progress: {
        current: 1,
        total: 3,
        label: "Step 1 of 3",
      },
      currentStage: {
        title: "Numbing the area",
        copy: "Numbing the area now.",
        illustrationUrl: "https://example.test/numb.png",
      },
      nextStage: {
        title: "Checking the tooth",
        copy: "Checking the tooth carefully.",
      },
    });
  });

  it("uses calmCopy when mode is CALM", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ mode: "CALM" })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      mode: "CALM",
      currentStage: { copy: "We are gently numbing the area." },
      nextStage: { copy: "We are taking a close look." },
    });
  });

  it("uses detailedCopy when mode is DETAILED", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ mode: "DETAILED" })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      mode: "DETAILED",
      currentStage: {
        copy: "Applying topical anesthetic followed by injection.",
      },
    });
  });

  it("returns selectedAreaLabel as null when no option is associated", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ selectedAreaOption: null })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      selectedAreaLabel: null,
    });
  });

  it("returns illustrationUrl as null when the template has none", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ illustrationUrl: null })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      currentStage: { illustrationUrl: null },
    });
  });

  it("computes progress from the current stage position", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ currentStageTemplateId: NEXT_STAGE_ID })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      progress: {
        current: 2,
        total: 3,
        label: "Step 2 of 3",
      },
      currentStage: {
        title: "Checking the tooth",
        copy: "Checking the tooth carefully.",
      },
      nextStage: {
        title: "Finishing this part",
        copy: "Finishing this part now.",
      },
    });
  });

  it("returns nextStage as null for the last ordered stage", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({ currentStageTemplateId: FINAL_STAGE_ID })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      progress: {
        current: 3,
        total: 3,
        label: "Step 3 of 3",
      },
      nextStage: null,
    });
  });

  it("merges override fields per-field over template fields", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({
        mode: "STANDARD",
        stageOverrides: [
          {
            procedureStageTemplateId: STAGE_ID,
            title: "Custom stage title",
            calmCopy: null,
            patientCopy: null,
            detailedCopy: "Override-only detailed text.",
          },
        ],
      })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      currentStage: {
        title: "Custom stage title",
        copy: "Numbing the area now.",
      },
    });
  });

  it("uses override copy when present for the active mode", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({
        mode: "CALM",
        stageOverrides: [
          {
            procedureStageTemplateId: STAGE_ID,
            title: null,
            calmCopy: "A calmer override message.",
            patientCopy: null,
            detailedCopy: null,
          },
        ],
      })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      currentStage: {
        title: "Numbing the area",
        copy: "A calmer override message.",
      },
    });
  });

  it("uses mode-matched overrides for the next stage preview", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({
        mode: "DETAILED",
        stageOverrides: [
          {
            procedureStageTemplateId: NEXT_STAGE_ID,
            title: "Custom next stage title",
            calmCopy: null,
            patientCopy: null,
            detailedCopy: "Custom detailed next-step preview.",
          },
        ],
      })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      nextStage: {
        title: "Custom next stage title",
        copy: "Custom detailed next-step preview.",
      },
    });
  });

  it("ignores overrides that target a different stage template", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession({
        stageOverrides: [
          {
            procedureStageTemplateId: OTHER_STAGE_ID,
            title: "Wrong stage override",
            calmCopy: "Wrong calm",
            patientCopy: "Wrong patient",
            detailedCopy: "Wrong detailed",
          },
        ],
      })
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result).toMatchObject({
      kind: "ok",
      currentStage: {
        title: "Numbing the area",
        copy: "Numbing the area now.",
      },
    });
  });

  it("returns only patient-safe top-level keys for ok results", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession()
    );

    const result = await loadPatientDisplay(TOKEN);

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;

    expect(Object.keys(result).sort()).toEqual(
      [
        "kind",
        "mode",
        "procedureName",
        "selectedAreaLabel",
        "progress",
        "currentStage",
        "nextStage",
      ].sort()
    );
    expect(Object.keys(result.currentStage).sort()).toEqual(
      ["title", "copy", "illustrationUrl"].sort()
    );
    expect(result.progress).toEqual({
      current: 1,
      total: 3,
      label: "Step 1 of 3",
    });

    const flat = JSON.stringify(result);
    for (const forbidden of [
      "clinicId",
      "doctor",
      "room",
      "displayToken",
      "createdAt",
      "updatedAt",
      "startedAt",
      "completedAt",
      "id",
      "internalNotes",
    ]) {
      expect(flat).not.toContain(forbidden);
    }
  });

  it("requests only patient-safe fields from the database", async () => {
    prismaMock.client.procedureSession.findUnique.mockResolvedValueOnce(
      buildSession()
    );

    await loadPatientDisplay(TOKEN);

    const call =
      prismaMock.client.procedureSession.findUnique.mock.calls[0]?.[0];
    expect(call?.select).toBeDefined();
    const selectKeys = Object.keys(call!.select).sort();
    expect(selectKeys).toEqual(
      [
        "status",
        "procedureTemplate",
        "selectedAreaOption",
        "displayPreferences",
        "stageState",
        "stageOverrides",
      ].sort()
    );
    expect(call!.select).not.toHaveProperty("clinicId");
    expect(call!.select).not.toHaveProperty("doctor");
    expect(call!.select).not.toHaveProperty("room");
    expect(call!.select).not.toHaveProperty("displayToken");
    expect(call!.select.stageState.select).toEqual({
      currentStageTemplateId: true,
    });
    expect(call!.select.procedureTemplate.select).toEqual({
      name: true,
      stageTemplates: {
        orderBy: { stageOrder: "asc" },
        select: {
          id: true,
          title: true,
          calmCopy: true,
          patientCopy: true,
          detailedCopy: true,
          illustrationUrl: true,
        },
      },
    });
  });
});
