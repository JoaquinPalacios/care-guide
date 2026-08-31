import { describe, expect, it } from "vitest";

import { guideSectionTone } from "@/lib/aftercare/guide-section-tone";
import type { GuideSectionKind } from "@/lib/aftercare/types";

describe("guideSectionTone", () => {
  it("styles from semantic kind rather than section key", () => {
    expect(guideSectionTone("WARNING_SIGNS")).toBe("warning");
    expect(guideSectionTone("EMERGENCY")).toBe("emergency");
    expect(guideSectionTone("INTRODUCTION")).toBe("lead");
    expect(guideSectionTone("IMMEDIATE_CARE")).toBe("lead");
    expect(guideSectionTone("FIRST_24_HOURS")).toBe("default");
    expect(guideSectionTone("CUSTOM")).toBe("default");
  });

  it("does not special-case dental section keys", () => {
    const kinds: GuideSectionKind[] = [
      "RECOVERY_TIMELINE",
      "WHAT_IS_NORMAL",
      "CONTACT_PRACTICE",
    ];
    expect(kinds.map(guideSectionTone)).toEqual([
      "default",
      "default",
      "default",
    ]);
  });
});
