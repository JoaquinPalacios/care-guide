import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("guide destructive actions authorization", () => {
  it("requires clinic ADMIN membership and never trusts a client clinicId", () => {
    const actions = readFileSync(
      "app/(staff)/(clinic-portal)/guides/actions.ts",
      "utf8"
    );
    const page = readFileSync(
      "app/(staff)/(clinic-portal)/guides/page.tsx",
      "utf8"
    );
    const row = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-row-actions.tsx",
      "utf8"
    );
    const menu = readFileSync(
      "app/(staff)/components/overflow-menu.tsx",
      "utf8"
    );

    expect(actions).toContain("deleteGuideDraftAction");
    expect(actions).toContain("discardGuideDraftChangesAction");
    expect(actions).toContain("requireClinicAdmin");
    expect(actions).not.toContain('formData.get("clinicId")');
    expect(page).toContain("canManage");
    expect(row).toContain("canManage && destructiveAction");
    expect(menu).toContain("getBoundingClientRect");
    expect(row).toContain("Delete this draft guide?");
    expect(row).toContain("Discard draft changes?");
    expect(row).toContain(
      "Patients will continue seeing the currently published version."
    );
  });
});
