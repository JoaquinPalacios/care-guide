import { describe, expect, it } from "vitest";

import {
  PROCEDURE_DAY_LABEL,
  relativeTimelinePeriodLabel,
  timelineStageSummary,
} from "@/lib/aftercare/relative-day-label";

describe("relative timeline day labels", () => {
  it("labels Day 0 as procedure day without using a calendar date", () => {
    expect(relativeTimelinePeriodLabel({ startDay: 0, endDay: 0 })).toBe(
      PROCEDURE_DAY_LABEL
    );
    expect(PROCEDURE_DAY_LABEL).toContain("Day 0");
    expect(PROCEDURE_DAY_LABEL).toContain("Procedure day");
    expect(PROCEDURE_DAY_LABEL).not.toMatch(/\d{1,2}\s+[A-Z][a-z]{2}/);
  });

  it("keeps explicit period labels and formats later relative ranges", () => {
    expect(
      relativeTimelinePeriodLabel({
        periodLabel: "First few hours",
        startDay: 0,
        endDay: 0,
      })
    ).toBe("First few hours");
    expect(relativeTimelinePeriodLabel({ startDay: 2, endDay: 3 })).toBe(
      "Days 2–3"
    );
    expect(relativeTimelinePeriodLabel({ startDay: 1, endDay: 1 })).toBe(
      "Day 1"
    );
  });

  it("summarizes when/what for collapsed editor stages", () => {
    expect(
      timelineStageSummary({
        periodLabel: "Days 2–3",
        title: "Early recovery",
      })
    ).toEqual({
      when: "Days 2–3",
      what: "Early recovery",
    });
  });
});
