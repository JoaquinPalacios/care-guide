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

    const editor = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-editor.tsx",
      "utf8"
    );
    const lifecycle = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-lifecycle-actions.tsx",
      "utf8"
    );

    expect(actions).toContain("deleteGuideDraftAction");
    expect(actions).toContain("discardGuideDraftChangesAction");
    expect(actions).toContain("requireClinicAdmin");
    expect(actions).not.toContain('formData.get("clinicId")');
    expect(menu).toContain("aria-label");
    expect(menu).toContain("getBoundingClientRect");
    expect(row).toContain("GuideLifecycleActions");
    expect(editor).toContain("GuideLifecycleActions");
    expect(lifecycle).toContain("More actions");
    expect(lifecycle).toContain("Delete this draft guide?");
    expect(lifecycle).toContain("Discard draft changes?");
    expect(lifecycle).toContain(
      "Patients will continue seeing the currently published version."
    );
  });
});
