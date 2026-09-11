/**
 * Demo / authenticated-preview calendar labels from an explicit start date.
 * Do not use the current clock. Generic public guides must not use this helper.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SHORT_MONTHS = [
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

export function addUtcCalendarDays(
  isoDate: string,
  dayOffset: number
): string | null {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(dayOffset)) {
    return null;
  }

  const utc = Date.UTC(year, month - 1, day + dayOffset);
  const next = new Date(utc);
  const yyyy = String(next.getUTCFullYear()).padStart(4, "0");
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatUtcDayMonth(isoDate: string): string | null {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    return null;
  }

  const utc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  const date = new Date(utc);
  return `${date.getUTCDate()} ${SHORT_MONTHS[date.getUTCMonth()]}`;
}

export function simulatedRecoveryDateLabel(input: {
  simulatedStartDate: string;
  simulatedDay: number;
}): string | null {
  const iso = addUtcCalendarDays(input.simulatedStartDate, input.simulatedDay);
  if (!iso) {
    return null;
  }

  const dayMonth = formatUtcDayMonth(iso);
  if (!dayMonth) {
    return null;
  }

  return `Day ${input.simulatedDay} · ${dayMonth}`;
}
