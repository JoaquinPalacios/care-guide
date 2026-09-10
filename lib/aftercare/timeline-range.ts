import { normalizePeriodLabel } from "@/lib/aftercare/period-label";

export interface DayRange {
  startDay: number;
  endDay: number;
}

export interface TimelineStageInput {
  key: string;
  periodLabel?: string | null;
  startDay?: number | null;
  endDay?: number | null;
}

export type TimelineRangeIssueCode =
  "negative_day" | "end_before_start" | "overlapping_range";

export interface TimelineRangeIssue {
  code: TimelineRangeIssueCode;
  keys: string[];
  message: string;
}

/**
 * Known demo/canonical labels whose day ranges are deterministic.
 * Do not guess ranges from arbitrary free text.
 */
export const DETERMINISTIC_PERIOD_RANGES: Record<string, DayRange> = {
  "First few hours": { startDay: 0, endDay: 0 },
  "Today / first 24 hours": { startDay: 1, endDay: 1 },
  Today: { startDay: 1, endDay: 1 },
  "Days 2–3": { startDay: 2, endDay: 3 },
  "Days 2-3": { startDay: 2, endDay: 3 },
  "Days 4–7": { startDay: 4, endDay: 7 },
  "Days 4-7": { startDay: 4, endDay: 7 },
};

export function normalizeDayRange(
  startDay: number | null | undefined,
  endDay: number | null | undefined
): { startDay: number | null; endDay: number | null } {
  if (
    typeof startDay !== "number" ||
    typeof endDay !== "number" ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endDay)
  ) {
    return { startDay: null, endDay: null };
  }

  return { startDay, endDay };
}

export function deterministicRangeForPeriodLabel(
  periodLabel: string | null | undefined
): DayRange | null {
  const label = normalizePeriodLabel(periodLabel);
  if (!label) {
    return null;
  }

  return DETERMINISTIC_PERIOD_RANGES[label] ?? null;
}

export function validateTimelineRanges(
  stages: TimelineStageInput[]
): TimelineRangeIssue[] {
  const issues: TimelineRangeIssue[] = [];
  const structured: Array<TimelineStageInput & DayRange> = [];

  for (const stage of stages) {
    const range = normalizeDayRange(stage.startDay, stage.endDay);
    if (range.startDay === null || range.endDay === null) {
      continue;
    }

    if (range.startDay < 0 || range.endDay < 0) {
      issues.push({
        code: "negative_day",
        keys: [stage.key],
        message: "Recovery days must be 0 or greater.",
      });
      continue;
    }

    if (range.endDay < range.startDay) {
      issues.push({
        code: "end_before_start",
        keys: [stage.key],
        message: "The last day of a stage cannot be before its first day.",
      });
      continue;
    }

    structured.push({
      ...stage,
      startDay: range.startDay,
      endDay: range.endDay,
    });
  }

  const ordered = structured.toSorted(
    (left, right) =>
      left.startDay - right.startDay || left.endDay - right.endDay
  );

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (current.startDay <= previous.endDay) {
      issues.push({
        code: "overlapping_range",
        keys: [previous.key, current.key],
        message:
          "Structured recovery stages cannot overlap. Adjust the day ranges or keep one stage as display-only.",
      });
    }
  }

  return issues;
}
