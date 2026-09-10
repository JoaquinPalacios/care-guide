import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("authenticated guide preview toolbar", () => {
  it("wraps the real patient renderer with staff chrome outside the document", () => {
    const preview = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/page.tsx",
      "utf8"
    );
    const toolbar = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/staff-preview-toolbar.tsx",
      "utf8"
    );
    const publicGuide = readFileSync(
      "app/(aftercare)/%5Fsites/[tenant]/[guideSlug]/page.tsx",
      "utf8"
    );

    expect(toolbar).toContain("backLabel");
    expect(toolbar).toContain("Draft preview");
    expect(toolbar).toContain("Edit guide");
    expect(preview).toContain(
      'backLabel={canEdit ? "Back to guide" : "Back to guides"}'
    );
    expect(preview).toContain("StaffPreviewToolbar");
    expect(preview).toContain("PatientPage");
    expect(preview).toContain("GuideDocument");
    expect(preview).toContain('colorSchemeSelector: "scope"');
    expect(preview.indexOf("StaffPreviewToolbar")).toBeLessThan(
      preview.indexOf("AFTERCARE_THEME_SCOPE")
    );
    expect(publicGuide).not.toContain("StaffPreviewToolbar");
    expect(publicGuide).not.toContain("Back to guide");
    expect(publicGuide).not.toContain("Draft preview");
    expect(publicGuide).not.toContain("Back to staff");
  });
});
