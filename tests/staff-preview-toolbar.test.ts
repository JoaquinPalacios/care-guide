import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("authenticated guide preview toolbar", () => {
  it("wraps the real patient renderer with staff chrome outside the document", () => {
    const preview = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/page.tsx",
      "utf8"
    );
    const shell = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/staff-preview-shell.tsx",
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
    expect(toolbar).toContain("Patient preview");
    expect(toolbar).toContain("Patient preview appearance");
    expect(preview).toContain(
      'backLabel={canEdit ? "Back to guide" : "Back to guides"}'
    );
    expect(preview).toContain("StaffPreviewShell");
    expect(preview).toContain("<PatientPage");
    expect(preview).toContain("GuideDocument");
    expect(preview).toContain('colorSchemeSelector: "scope"');
    expect(shell).toContain("PatientThemeBoundary");
    expect(shell).toContain("StaffPreviewToolbar");
    expect(preview.lastIndexOf("<StaffPreviewShell")).toBeLessThan(
      preview.lastIndexOf("<PatientPage")
    );
    expect(preview).not.toContain("StaffPreviewToolbar");
    expect(publicGuide).not.toContain("StaffPreviewToolbar");
    expect(publicGuide).not.toContain("Back to guide");
    expect(publicGuide).not.toContain("Draft preview");
    expect(publicGuide).not.toContain("Back to staff");
  });
});
