import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  addDaysIso,
  genericRecoveryDayLabel,
  relativeStageWhenLabel,
  simulatedRecoveryDayLabel,
} from "@/lib/aftercare/recovery-day-label";
import { DEMO_RECOVERY_FIXTURE } from "@/lib/aftercare/demo-tenant";

describe("recovery day labels", () => {
  it("keeps generic public Day 0 relative to the procedure, not the calendar", () => {
    expect(genericRecoveryDayLabel(0)).toBe("Day 0 · Procedure day");
    expect(
      relativeStageWhenLabel({ startDay: 0, endDay: 0, periodLabel: null })
    ).toBe("Day 0 · Procedure day");
    expect(
      relativeStageWhenLabel({
        startDay: 0,
        endDay: 0,
        periodLabel: "First few hours",
      })
    ).toBe("First few hours");
  });

  it("formats demo calendar captions only from an explicit simulated start date", () => {
    expect(
      simulatedRecoveryDayLabel({
        day: 0,
        simulatedStartDate: DEMO_RECOVERY_FIXTURE.simulatedStartDate,
      })
    ).toBe("Day 0 · 10 Sep");
    expect(
      simulatedRecoveryDayLabel({
        day: 1,
        simulatedStartDate: DEMO_RECOVERY_FIXTURE.simulatedStartDate,
        isCurrent: true,
      })
    ).toBe("Day 1 · 11 Sep");
    expect(addDaysIso("2026-09-10", 1)).toBe("2026-09-11");
    expect(
      simulatedRecoveryDayLabel({ day: 0, simulatedStartDate: null })
    ).toBe("Day 0 · Procedure day");
  });

  it("does not read Date.now() for generic or demo day labels", () => {
    const helper = readFileSync("lib/aftercare/recovery-day-label.ts", "utf8");
    const publicGuide = readFileSync(
      "app/(aftercare)/%5Fsites/[tenant]/[guideSlug]/page.tsx",
      "utf8"
    );
    const timeline = readFileSync(
      "app/(aftercare)/components/guide-timeline.tsx",
      "utf8"
    );
    const demo = readFileSync("lib/aftercare/demo-tenant.ts", "utf8");

    expect(helper).not.toContain("Date.now(");
    expect(publicGuide).not.toContain("Date.now(");
    expect(timeline).not.toContain("Date.now(");
    expect(demo).toContain('simulatedStartDate: "2026-09-10"');
    expect(demo).toContain("simulatedDay: 1");
  });
});
