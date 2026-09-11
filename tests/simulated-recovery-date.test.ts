import { describe, expect, it } from "vitest";

import {
  addUtcCalendarDays,
  formatUtcDayMonth,
  simulatedRecoveryDateLabel,
} from "@/lib/aftercare/simulated-recovery-date";

describe("explicit simulated recovery dates", () => {
  it("formats demo labels from a fixture start date, not Date.now()", () => {
    expect(addUtcCalendarDays("2026-09-10", 0)).toBe("2026-09-10");
    expect(addUtcCalendarDays("2026-09-10", 1)).toBe("2026-09-11");
    expect(formatUtcDayMonth("2026-09-11")).toBe("11 Sep");
    expect(
      simulatedRecoveryDateLabel({
        simulatedStartDate: "2026-09-10",
        simulatedDay: 1,
      })
    ).toBe("Day 1 · 11 Sep");
  });

  it("does not import or call Date.now", async () => {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("lib/aftercare/simulated-recovery-date.ts", "utf8")
    );
    expect(source).not.toContain("Date.now(");
  });
});
