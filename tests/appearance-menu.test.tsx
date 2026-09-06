import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { AppearanceMenu } from "@/lib/branding/appearance-menu";

describe("AppearanceMenu", () => {
  it("renders a compact labelled trigger instead of a segmented control", () => {
    const html = renderToStaticMarkup(
      <AppearanceMenu storageKey="test-theme" classPrefix="mtc" />
    );

    expect(html).toContain("Change colour theme");
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain("System");
    expect(html).toContain("Light");
    expect(html).toContain("Dark");
    expect(html).not.toContain('type="radio"');
    expect(html).not.toContain("<fieldset");
    expect(html).not.toContain("System | Light | Dark");
  });
});
