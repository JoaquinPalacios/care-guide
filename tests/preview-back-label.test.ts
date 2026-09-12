import { describe, expect, it } from "vitest";

import { staffPreviewBackLabel } from "@/lib/clinic-portal/preview-back-label";

describe("staff preview back label", () => {
  it("names the working guide for editors", () => {
    expect(
      staffPreviewBackLabel({
        canEdit: true,
        guideTitle: "Tooth Extraction",
      })
    ).toBe("Back to Tooth Extraction");
  });

  it("keeps the guides list label when the viewer cannot edit", () => {
    expect(
      staffPreviewBackLabel({
        canEdit: false,
        guideTitle: "Tooth Extraction",
      })
    ).toBe("Back to guides");
  });
});
