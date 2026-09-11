import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("guide editor UX", () => {
  it("exposes Cancel, Save draft, and Publish with discard and publish confirmation", () => {
    const editor = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-editor.tsx",
      "utf8"
    );

    expect(editor).toContain("Cancel");
    expect(editor).toContain("Save draft");
    expect(editor).toContain("Publish guide");
    expect(editor).toContain("Discard unsaved changes?");
    expect(editor).toContain("Keep editing");
    expect(editor).toContain("Discard changes");
    expect(editor).toContain("Publish this guide?");
    expect(editor).toContain("staffEditorToolbar");
    expect(editor).toContain("staffEditorRail");
    expect(editor).not.toContain("staffEditorChrome");
    expect(editor).not.toContain("staffEditorRailCard");
    expect(editor).toContain("useUnsavedChangesGuard");
    expect(editor).toContain("formSaveStatus");
    expect(editor).toContain("EditorLivePreview");
    expect(editor).toContain("TimelineAccordion");
    expect(editor).not.toContain("window.confirm");
    expect(editor).toContain("slugLocked");
    expect(editor).toContain('<input type="hidden" name="publicSlug"');
  });
});
