import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("guide editor accordion and live preview", () => {
  it("uses exclusive accordion headers and opens a newly added stage", () => {
    const accordion = readFileSync(
      "app/(staff)/(clinic-portal)/guides/timeline-accordion.tsx",
      "utf8"
    );
    const editor = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-editor.tsx",
      "utf8"
    );

    expect(accordion).toContain("aria-expanded");
    expect(accordion).toContain("aria-controls");
    expect(accordion).toContain("Needs attention");
    expect(accordion).toContain("staffAccordionTrigger");
    expect(editor).toContain("setExpandedStageKey(key)");
    expect(editor).toContain("Add stage");
    expect(editor).not.toContain('from "motion');
    expect(editor).not.toContain("from 'motion");
  });

  it("reuses the presentational patient timeline list for the live preview", () => {
    const preview = readFileSync(
      "app/(staff)/(clinic-portal)/guides/editor-live-preview.tsx",
      "utf8"
    );
    const list = readFileSync(
      "app/(aftercare)/components/recovery-timeline-list.tsx",
      "utf8"
    );
    const patient = readFileSync(
      "app/(aftercare)/components/guide-timeline.tsx",
      "utf8"
    );

    expect(preview).toContain("RecoveryTimelineList");
    expect(preview).toContain("editorStagesToPreviewSections");
    expect(preview).toContain("Live patient timeline");
    expect(patient).toContain("RecoveryTimelineList");
    expect(list).not.toContain("patient.module.css");
    expect(preview).not.toContain("patient.module.css");
  });
});
