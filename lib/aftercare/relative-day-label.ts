import { normalizePeriodLabel } from "@/lib/aftercare/period-label";
import { normalizeDayRange } from "@/lib/aftercare/timeline-range";

export const PROCEDURE_DAY_LABEL = "Day 0 · Procedure day";

/**
 * Relative recovery-day copy for generic public guides.
 * Never derive a calendar date from the current clock — durable URLs have no
 * patient-specific start date until a future RecoveryPlan.startedAt exists.
 */
export function relativeTimelinePeriodLabel(input: {
  periodLabel?: string | null;
  startDay?: number | null;
  endDay?: number | null;
}): string | null {
  const explicit = normalizePeriodLabel(input.periodLabel);
  if (explicit) {
    return explicit;
  }

  const range = normalizeDayRange(input.startDay, input.endDay);
  if (range.startDay === null || range.endDay === null) {
    return null;
  }

  if (range.startDay === 0 && range.endDay === 0) {
    return PROCEDURE_DAY_LABEL;
  }

  if (range.startDay === range.endDay) {
    return `Day ${range.startDay}`;
  }

  return `Days ${range.startDay}–${range.endDay}`;
}

export function timelineStageSummary(input: {
  periodLabel?: string | null;
  startDay?: number | null;
  endDay?: number | null;
  title: string;
}): { when: string; what: string } {
  return {
    when: relativeTimelinePeriodLabel(input) ?? "Timing not set",
    what: input.title.trim() || "Untitled stage",
  };
}
