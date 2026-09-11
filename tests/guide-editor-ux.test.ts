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
    expect(editor).toContain("staffComposerRail");
    expect(editor).not.toContain("staffEditorChrome");
    expect(editor).toContain("useUnsavedChangesGuard");
    expect(editor).toContain("formSaveStatus");
    expect(editor).toContain("EditorTimelinePreview");
    expect(editor).toContain("TimelineStageEditor");
    expect(editor).not.toContain("window.confirm");
  });

  it("keeps timeline accordion behaviour in the editor island", () => {
    const accordion = readFileSync(
      "app/(staff)/(clinic-portal)/guides/timeline-stage-editor.tsx",
      "utf8"
    );

    expect(accordion).toContain("aria-expanded");
    expect(accordion).toContain("aria-controls");
    expect(accordion).toContain("onOpenKeyChange(open ? null : stage.key)");
    expect(accordion).toContain("onOpenKeyChange(key)");
    expect(accordion).toContain("Add stage");
    expect(accordion).toContain("staffStageAlert");
    expect(accordion).toContain("stageIssueMessage");
    expect(accordion).toContain("Move up");
    expect(accordion).toContain("Move down");
  });

  it("reuses the patient GuideTimeline for the live preview", () => {
    const preview = readFileSync(
      "app/(staff)/(clinic-portal)/guides/editor-timeline-preview.tsx",
      "utf8"
    );

    expect(preview).toContain("GuideTimeline");
    expect(preview).toContain("compact");
    expect(preview).toContain("Patient timeline preview");
    expect(preview).toContain("editorStagesToComposed");
  });
});
