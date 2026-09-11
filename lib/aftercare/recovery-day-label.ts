/**
 * Relative recovery-day copy for generic public guides.
 *
 * Generic durable URLs have no patient-specific treatment date. Do not
 * derive Day 0 from the browser clock or the system date — that would be wrong
 * when a patient reopens the same URL later. Calendar dates belong to a
 * future RecoveryPlan.startedAt / procedureDate (not implemented).
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export interface IsoUtcDate {
  year: number;
  month: number;
  day: number;
}

export function parseIsoDateUtc(isoDate: string): IsoUtcDate | null {
  const match = ISO_DATE.exec(isoDate.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const date = new Date(utc);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function addDaysIso(isoDate: string, days: number): string | null {
  const parsed = parseIsoDateUtc(isoDate);
  if (!parsed || !Number.isInteger(days)) {
    return null;
  }

  const date = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day + days)
  );
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function formatIsoDayMonth(isoDate: string): string | null {
  const parsed = parseIsoDateUtc(isoDate);
  if (!parsed) {
    return null;
  }

  return `${parsed.day} ${MONTHS[parsed.month - 1]}`;
}

export function genericRecoveryDayLabel(day: number): string {
  if (day === 0) {
    return "Day 0 · Procedure day";
  }

  return `Day ${day}`;
}

export function relativeStageWhenLabel(input: {
  periodLabel?: string | null;
  startDay?: number | null;
  endDay?: number | null;
}): string {
  const period = input.periodLabel?.trim();
  if (period) {
    return period;
  }

  const start = typeof input.startDay === "number" ? input.startDay : null;
  const end = typeof input.endDay === "number" ? input.endDay : null;

  if (start === 0 && (end === 0 || end === null)) {
    return genericRecoveryDayLabel(0);
  }

  if (start === 0 && end !== null) {
    return `Day 0–${end} · Procedure day`;
  }

  if (start !== null && end !== null && start === end) {
    return genericRecoveryDayLabel(start);
  }

  if (start !== null && end !== null) {
    return `Days ${start}–${end}`;
  }

  if (start !== null) {
    return genericRecoveryDayLabel(start);
  }

  return "Recovery stage";
}

/**
 * Demo / authenticated preview caption when an explicit simulated start
 * date is supplied. Never reads the system clock.
 */
export function simulatedRecoveryDayLabel(input: {
  day: number;
  simulatedStartDate?: string | null;
  isCurrent?: boolean;
}): string {
  const start = input.simulatedStartDate?.trim();
  if (!start) {
    return genericRecoveryDayLabel(input.day);
  }

  const iso = addDaysIso(start, input.day);
  const dateLabel = iso ? formatIsoDayMonth(iso) : null;
  if (!dateLabel) {
    return genericRecoveryDayLabel(input.day);
  }

  if (input.isCurrent) {
    return `Day ${input.day} · ${dateLabel}`;
  }

  if (input.day === 0) {
    return `Day 0 · ${dateLabel}`;
  }

  return `Day ${input.day} · ${dateLabel}`;
}
