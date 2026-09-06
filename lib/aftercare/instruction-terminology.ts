export const INSTRUCTION_TERMINOLOGY = [
  "AFTERCARE",
  "POST_TREATMENT",
  "POST_PROCEDURE",
  "POST_OPERATIVE",
  "RECOVERY",
] as const;

export type InstructionTerminology = (typeof INSTRUCTION_TERMINOLOGY)[number];

const INSTRUCTION_LABELS: Record<InstructionTerminology, string> = {
  AFTERCARE: "Aftercare instructions",
  POST_TREATMENT: "Post-treatment instructions",
  POST_PROCEDURE: "Post-procedure instructions",
  POST_OPERATIVE: "Post-operative instructions",
  RECOVERY: "Recovery instructions",
};

export function parseInstructionTerminology(
  value: string | null | undefined
): InstructionTerminology {
  if (typeof value !== "string") {
    return "AFTERCARE";
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === "AFTERCARE" ||
    normalized === "POST_TREATMENT" ||
    normalized === "POST_PROCEDURE" ||
    normalized === "POST_OPERATIVE" ||
    normalized === "RECOVERY"
  ) {
    return normalized;
  }

  return "AFTERCARE";
}

export function instructionLabel(value: string | null | undefined): string {
  return INSTRUCTION_LABELS[parseInstructionTerminology(value)];
}

export function practiceInstructionsTitle(
  practiceName: string,
  value: string | null | undefined
): string {
  return `${practiceName} — ${instructionLabel(value)}`;
}
