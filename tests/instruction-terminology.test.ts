import { describe, expect, it } from "vitest";

import {
  instructionLabel,
  parseInstructionTerminology,
  practiceInstructionsTitle,
} from "@/lib/aftercare/instruction-terminology";

describe("instruction terminology", () => {
  it.each([
    ["AFTERCARE", "Aftercare instructions"],
    ["POST_TREATMENT", "Post-treatment instructions"],
    ["POST_PROCEDURE", "Post-procedure instructions"],
    ["POST_OPERATIVE", "Post-operative instructions"],
    ["RECOVERY", "Recovery instructions"],
  ] as const)("maps %s to %s", (value, label) => {
    expect(parseInstructionTerminology(value)).toBe(value);
    expect(instructionLabel(value)).toBe(label);
  });

  it("defaults missing or unsafe values to AFTERCARE", () => {
    expect(parseInstructionTerminology(null)).toBe("AFTERCARE");
    expect(parseInstructionTerminology(undefined)).toBe("AFTERCARE");
    expect(parseInstructionTerminology(" custom heading ")).toBe("AFTERCARE");
    expect(instructionLabel(null)).toBe("Aftercare instructions");
  });

  it("builds a practice title without repeating the guide name", () => {
    expect(
      practiceInstructionsTitle("Riverside Dental Demo", "POST_TREATMENT")
    ).toBe("Riverside Dental Demo — Post-treatment instructions");
    expect(
      practiceInstructionsTitle(
        "Sydney Specialist Oral Surgery",
        "POST_OPERATIVE"
      )
    ).toBe("Sydney Specialist Oral Surgery — Post-operative instructions");
  });
});
