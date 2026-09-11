import { describe, expect, it } from "vitest";

import { summarizeOperatorClinics } from "@/lib/operator/summarize-operator-clinics";

describe("operator clinic summary", () => {
  it("derives totals from real clinic rows", () => {
    expect(
      summarizeOperatorClinics([
        {
          publishedGuideCount: 1,
          setupLabel: "Configured",
        },
        {
          publishedGuideCount: 0,
          setupLabel: "Needs attention",
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
