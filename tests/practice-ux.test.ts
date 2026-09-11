import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("practice configuration polish", () => {
  it("tracks the active section and respects reduced motion", () => {
    const nav = readFileSync(
      "app/(staff)/(clinic-portal)/practice/practice-section-nav.tsx",
      "utf8"
    );

    expect(nav).toContain("IntersectionObserver");
    expect(nav).toContain("prefers-reduced-motion");
    expect(nav).toContain('behavior: reduce ? "auto" : "smooth"');
    expect(nav).toContain('aria-current={current ? "true" : undefined}');
  });

  it("uses one colour picker plus hex input and native selects with chevron space", () => {
    const color = readFileSync(
      "app/(staff)/components/color-field.tsx",
      "utf8"
    );
    const form = readFileSync(
      "app/(staff)/(clinic-portal)/practice/practice-settings-form.tsx",
      "utf8"
    );
    const css = readFileSync("app/(staff)/staff.css", "utf8");

    expect(color).toContain('type="color"');
    expect(color).toContain("staffColorPicker");
    expect(color).not.toContain("aria-hidden");
    expect(form).toContain("staffSelect");
    expect(form).toContain("PracticeSectionNav");
    expect(form).toContain("staffPracticeForm");
    expect(form).toContain("staffPracticeGrid3");
    expect(css).toContain("padding-right: 2.75rem");
    expect(css).toContain(".staffColorPicker");
    expect(css).toContain("minmax(0, 1fr)");
  });
});
