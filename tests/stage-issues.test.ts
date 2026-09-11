import { describe, expect, it } from "vitest";

import { stageIssueMessage } from "@/app/(staff)/(clinic-portal)/guides/stage-issues";
import type { EditorSection } from "@/app/(staff)/(clinic-portal)/guides/editor-types";

function stage(
  overrides: Partial<EditorSection> & Pick<EditorSection, "key">
): EditorSection {
  return {
    kind: "RECOVERY_TIMELINE",
    title: "Early recovery",
    body: "Rest and follow the clinic advice.",
    periodLabel: "Days 2–3",
    startDay: "2",
    endDay: "3",
    ...overrides,
  };
}

describe("timeline stage issues", () => {
  it("flags empty titles and overlapping ranges while collapsed", () => {
    expect(
      stageIssueMessage(stage({ key: "ok" }), [stage({ key: "ok" })])
    ).toBeNull();
    expect(
      stageIssueMessage(stage({ key: "blank", title: "" }), [
        stage({ key: "blank", title: "" }),
      ])
    ).toBe("Needs attention");

    const overlapping = [
      stage({ key: "early", startDay: "1", endDay: "3" }),
      stage({ key: "late", startDay: "3", endDay: "5" }),
    ];
    expect(stageIssueMessage(overlapping[0], overlapping)).toBe(
      "Needs attention"
    );
    expect(stageIssueMessage(overlapping[1], overlapping)).toBe(
      "Needs attention"
    );
  });
});
