import { describe, expect, it } from "vitest";

import {
  deterministicRangeForPeriodLabel,
  normalizeDayRange,
  validateTimelineRanges,
} from "@/lib/aftercare/timeline-range";

describe("timeline ranges", () => {
  it("keeps structured day 0 through days 4–7", () => {
    expect(normalizeDayRange(0, 0)).toEqual({ startDay: 0, endDay: 0 });
    expect(normalizeDayRange(1, 1)).toEqual({ startDay: 1, endDay: 1 });
    expect(normalizeDayRange(2, 3)).toEqual({ startDay: 2, endDay: 3 });
    expect(normalizeDayRange(4, 7)).toEqual({ startDay: 4, endDay: 7 });
  });

  it("does not invent ranges from incomplete values", () => {
    expect(normalizeDayRange(1, null)).toEqual({
      startDay: null,
      endDay: null,
    });
    expect(normalizeDayRange(undefined, 3)).toEqual({
      startDay: null,
      endDay: null,
    });
  });

  it("backfills only deterministic known labels", () => {
    expect(deterministicRangeForPeriodLabel("First few hours")).toEqual({
      startDay: 0,
      endDay: 0,
    });
    expect(deterministicRangeForPeriodLabel("Today / first 24 hours")).toEqual({
      startDay: 1,
      endDay: 1,
    });
    expect(deterministicRangeForPeriodLabel("Days 2–3")).toEqual({
      startDay: 2,
      endDay: 3,
    });
    expect(deterministicRangeForPeriodLabel("Days 4–7")).toEqual({
      startDay: 4,
      endDay: 7,
    });
    expect(
      deterministicRangeForPeriodLabel("Whenever it feels better")
    ).toBeNull();
  });

  it("rejects negative days, inverted ranges, and overlaps", () => {
    expect(
      validateTimelineRanges([
        { key: "bad", startDay: -1, endDay: 0, periodLabel: "Before" },
      ])[0]?.code
    ).toBe("negative_day");

    expect(
      validateTimelineRanges([
        { key: "inverted", startDay: 3, endDay: 1, periodLabel: "Backwards" },
      ])[0]?.code
    ).toBe("end_before_start");

    expect(
      validateTimelineRanges([
        { key: "early", startDay: 0, endDay: 2, periodLabel: "Early" },
        { key: "late", startDay: 2, endDay: 4, periodLabel: "Late" },
      ])[0]?.code
    ).toBe("overlapping_range");
  });

  it("allows adjacent structured ranges and label-only stages", () => {
    expect(
      validateTimelineRanges([
        {
          key: "day-0",
          startDay: 0,
          endDay: 0,
          periodLabel: "First few hours",
        },
        { key: "day-1", startDay: 1, endDay: 1, periodLabel: "Day 1" },
        { key: "days-2-3", startDay: 2, endDay: 3, periodLabel: "Days 2–3" },
        { key: "days-4-7", startDay: 4, endDay: 7, periodLabel: "Days 4–7" },
        { key: "later", periodLabel: "Whenever swelling settles" },
      ])
    ).toEqual([]);
  });
});
