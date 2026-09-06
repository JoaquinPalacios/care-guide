import { describe, expect, it } from "vitest";

import { groupGuideSections } from "@/lib/aftercare/group-guide-sections";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

function section(
  key: string,
  kind: ComposedGuideSection["kind"],
  periodLabel: string | null = null
): ComposedGuideSection {
  return {
    key,
    kind,
    title: key,
    body: `${key} body`,
    periodLabel,
    provenance: "canonical",
  };
}

describe("groupGuideSections", () => {
  it("groups consecutive recovery timeline stages and leaves other sections alone", () => {
    const blocks = groupGuideSections([
      section("introduction", "INTRODUCTION"),
      section("hours", "RECOVERY_TIMELINE", "First 4 hours"),
      section("week-two", "RECOVERY_TIMELINE", "Week 2+"),
      section("warnings", "WARNING_SIGNS"),
    ]);

    expect(blocks).toEqual([
      { type: "single", section: section("introduction", "INTRODUCTION") },
      {
        type: "timeline",
        sections: [
          section("hours", "RECOVERY_TIMELINE", "First 4 hours"),
          section("week-two", "RECOVERY_TIMELINE", "Week 2+"),
        ],
      },
      { type: "single", section: section("warnings", "WARNING_SIGNS") },
    ]);
  });

  it("does not invent a timeline when a guide has none", () => {
    const blocks = groupGuideSections([
      section("introduction", "INTRODUCTION"),
      section("warnings", "WARNING_SIGNS"),
    ]);

    expect(blocks.every((block) => block.type === "single")).toBe(true);
  });

  it("starts a new timeline group after an interrupting section", () => {
    const blocks = groupGuideSections([
      section("one", "RECOVERY_TIMELINE", "Day 1"),
      section("normal", "WHAT_IS_NORMAL"),
      section("two", "RECOVERY_TIMELINE", "Week 2+"),
    ]);

    expect(blocks.map((block) => block.type)).toEqual([
      "timeline",
      "single",
      "timeline",
    ]);
  });
});
