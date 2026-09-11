import { describe, expect, it } from "vitest";

import { editorStagesToPreviewSections } from "@/lib/clinic-portal/editor-preview-sections";

describe("editor live preview sections", () => {
  it("preserves unsaved stage order and titles with relative Day 0 copy", () => {
    const sections = editorStagesToPreviewSections([
      {
        key: "later",
        title: "Healing check",
        body: "Discomfort should settle.",
        periodLabel: "Days 4–7",
        startDay: "4",
        endDay: "7",
      },
      {
        key: "immediate",
        title: "Immediate care",
        body: "Keep the site still.",
        periodLabel: "",
        startDay: "0",
        endDay: "0",
      },
    ]);

    expect(sections.map((section) => section.key)).toEqual([
      "later",
      "immediate",
    ]);
    expect(sections[0]?.title).toBe("Healing check");
    expect(sections[1]?.periodLabel).toBe("Day 0 · Procedure day");
    expect(JSON.stringify(sections)).not.toMatch(/\d{1,2} \w{3} \d{4}/);
  });
});
