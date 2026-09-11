import { describe, expect, it } from "vitest";

import { summarizeOperatorClinics } from "@/lib/operator/summarize-operator-clinics";

describe("operator clinic summary", () => {
  it("derives totals from real clinic rows", () => {
    expect(
      summarizeOperatorClinics([
        {
          id: "clinic_a",
          name: "Riverside",
          displayName: "Riverside Dental Demo",
          slug: "demodental",
          guideCount: 2,
          publishedGuideCount: 1,
          setupLabel: "Configured",
          updatedAt: new Date("2026-09-11"),
        },
        {
          id: "clinic_b",
          name: "Harbor",
          displayName: "Harbor Family Dental",
          slug: "harbor",
          guideCount: 1,
          publishedGuideCount: 0,
          setupLabel: "Needs attention",
          updatedAt: new Date("2026-09-11"),
        },
      ])
    ).toEqual({
      totalClinics: 2,
      configuredClinics: 1,
      publishedGuides: 1,
      needsAttention: 1,
    });
  });
});
