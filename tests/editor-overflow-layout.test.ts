import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("guide editor overflow layout", () => {
  it("owns the editor grid in CSS and switches on content width, not viewport lg", () => {
    const css = readFileSync("app/(staff)/staff.css", "utf8");
    const editor = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-editor.tsx",
      "utf8"
    );

    expect(css).toContain("container: staff-editor / inline-size");
    expect(css).toContain("@container staff-editor (min-width: 56rem)");
    expect(css).toContain(
      "grid-template-columns: minmax(0, 1.55fr) minmax(0, 1.05fr)"
    );
    for (const block of css.split("@media (min-width: 1024px)").slice(1)) {
      const untilNextAtRule = block.split("@")[0];
      expect(untilNextAtRule).not.toContain(".staffEditorLayout");
    }
    expect(editor).toContain('className="staffEditorPage staffGuideEditor"');
    expect(editor).not.toContain("lg:grid");
    expect(editor).not.toContain("mx-auto flex w-full min-w-0 max-w-6xl");
    expect(css).not.toContain("overflow-x: hidden");
  });
});
