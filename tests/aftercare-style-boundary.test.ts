import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

describe("aftercare style boundary", () => {
  it("keeps Tailwind in the staff stylesheet only", () => {
    const staffCss = read("app/(staff)/staff.css");
    const aftercareCss = read("app/(aftercare)/aftercare.css");

    expect(staffCss).toContain('@import "tailwindcss"');
    expect(aftercareCss).not.toContain("tailwindcss");
    expect(aftercareCss).not.toContain("@theme");

    const marketingCss = read("app/(marketing)/marketing.css");
    expect(marketingCss).not.toContain("tailwindcss");
    expect(marketingCss).not.toContain("@theme");
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

  it("does not import Tailwind from the marketing root layout", () => {
    const layout = read("app/(marketing)/layout.tsx");

    expect(layout).toContain("./marketing.css");
    expect(layout).not.toContain("staff.css");
    expect(layout).not.toContain("aftercare.css");
    expect(layout).not.toContain("tailwind");
    expect(layout).not.toMatch(/['"]use client['"]/);
  });

  it("applies semantic CSS variables in the tenant layout on the server", () => {
    const layout = read("app/(aftercare)/%5Fsites/[tenant]/layout.tsx");

    expect(layout).not.toMatch(/['"]use client['"]/);
    expect(layout).toContain("resolveAftercareTheme");
    expect(layout).toContain("serializeAftercareThemeCss");
    expect(layout).not.toContain("ThemeProvider");
    expect(layout).not.toContain("localStorage");
    expect(layout).not.toContain("useContext");
  });

  it("styles patient components with CSS Modules and semantic tokens", () => {
    const styles = read("app/(aftercare)/patient.module.css");
    const header = read("app/(aftercare)/components/practice-header.tsx");

    expect(header).not.toMatch(/['"]use client['"]/);
    expect(header).toContain("patient.module.css");
    expect(header).not.toContain('className="');
    expect(styles).toContain("var(--cg-brand)");
    expect(styles).toContain("var(--cg-on-brand)");
    expect(styles).toContain("var(--cg-warning)");
    expect(styles).toContain("var(--cg-emergency)");
    expect(styles).toContain("var(--cg-radius)");
    expect(styles).not.toContain("tailwind");
    expect(styles).not.toContain("--tw-");
  });

  it("keeps optional Client Components isolated to theme controls", () => {
    const allowedClient = new Set([
      "app/(aftercare)/components/patient-theme-control.tsx",
      "app/(marketing)/components/marketing-theme-control.tsx",
    ]);
    const files = walk("app/(aftercare)").filter((path) =>
      /\.(ts|tsx|css)$/.test(path)
    );

    expect(files.length).toBeGreaterThan(5);

    for (const file of files) {
      const source = read(file);
      if (!allowedClient.has(file)) {
        expect(source, file).not.toMatch(/['"]use client['"]/);
      }
      expect(source, file).not.toContain("tailwindcss");
      expect(source, file).not.toContain("styled-components");
      expect(source, file).not.toContain("@emotion");
    }

    const marketingFiles = walk("app/(marketing)").filter((path) =>
      /\.(ts|tsx|css)$/.test(path)
    );
    expect(marketingFiles.length).toBeGreaterThan(2);
    for (const file of marketingFiles) {
      const source = read(file);
      if (!allowedClient.has(file)) {
        expect(source, file).not.toMatch(/['"]use client['"]/);
      }
      expect(source, file).not.toContain("tailwindcss");
      expect(source, file).not.toContain("styled-components");
      expect(source, file).not.toContain("@emotion");
    }

    expect(
      read("app/(aftercare)/components/patient-theme-control.tsx")
    ).toMatch(/['"]use client['"]/);
    expect(
      read("app/(marketing)/components/marketing-theme-control.tsx")
    ).toMatch(/['"]use client['"]/);
  });
});
