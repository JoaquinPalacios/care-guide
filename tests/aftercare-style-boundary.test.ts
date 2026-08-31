import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("aftercare style boundary", () => {
  it("keeps Tailwind in the staff stylesheet only", () => {
    const staffCss = read("app/(staff)/staff.css");
    const aftercareCss = read("app/(aftercare)/aftercare.css");

    expect(staffCss).toContain('@import "tailwindcss"');
    expect(aftercareCss).not.toContain("tailwindcss");
    expect(aftercareCss).not.toContain("@theme");
  });

  it("loads Tailwind from the staff root layout", () => {
    const layout = read("app/(staff)/layout.tsx");

    expect(layout).toContain("./staff.css");
    expect(layout).not.toContain("aftercare.css");
  });

  it("does not import Tailwind from the aftercare root layout", () => {
    const layout = read("app/(aftercare)/layout.tsx");

    expect(layout).toContain("./aftercare.css");
    expect(layout).not.toContain("staff.css");
    expect(layout).not.toContain("tailwind");
    expect(layout).not.toContain("next/font");
    expect(layout).not.toMatch(/['"]use client['"]/);
  });

  it("applies semantic CSS variables in the tenant layout on the server", () => {
    const layout = read("app/(aftercare)/%5Fsites/[tenant]/layout.tsx");

    expect(layout).not.toMatch(/['"]use client['"]/);
    expect(layout).toContain("resolveAftercareTheme");
    expect(layout).toContain("toAftercareThemeStyle");
    expect(layout).not.toContain("ThemeProvider");
    expect(layout).not.toContain("localStorage");
    expect(layout).not.toContain("useContext");
  });

  it("styles the tenant proof with a CSS Module rather than Tailwind", () => {
    const component = read("app/(aftercare)/practice-brand-proof.tsx");
    const styles = read("app/(aftercare)/practice-brand-proof.module.css");

    expect(component).not.toMatch(/['"]use client['"]/);
    expect(component).toContain("practice-brand-proof.module.css");
    expect(component).not.toContain('className="');
    expect(styles).toContain("var(--cg-brand)");
    expect(styles).toContain("var(--cg-on-brand)");
    expect(styles).not.toContain("tailwind");
  });
});
