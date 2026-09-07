import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function hexLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const value =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw.slice(0, 6);
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
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
    expect(styles).toContain("var(--cg-recovery-surface)");
    expect(styles).not.toContain("tailwind");
    expect(styles).not.toContain("--tw-");
    expect(styles).toMatch(/\.guideLink\s*\{[^}]*box-shadow/);
    expect(styles).not.toMatch(/\.timelineItem\s*\{[^}]*box-shadow/);
    expect(styles).not.toMatch(/\.timelineItem\s*\{[^}]*border-radius/);
  });

  it("reduces marketing to four chapter surfaces", () => {
    const page = read("app/(marketing)/%5Fmarketing/page.tsx");
    const styles = read("app/(marketing)/marketing.module.css");

    expect(page).toContain("marketingBase");
    expect(page).toContain("marketingSoft");
    expect(page).toContain("marketingShowcase");
    expect(page).toContain("marketingClosing");
    expect(page).not.toContain("surfaceBase");
    expect(page).not.toContain("surfaceSubtle");
    expect(page).not.toContain("surfaceContrast");
    expect(page).not.toContain("surfaceBrand");
    expect(styles).toContain(".marketingBase");
    expect(styles).toContain(".marketingSoft");
    expect(styles).toContain(".marketingShowcase");
    expect(styles).toContain(".marketingClosing");
    expect(styles).not.toContain(".surfaceBase");
    expect(styles).not.toContain(".surfaceSubtle");
    expect(styles).not.toContain(".surfaceContrast");
    expect(styles).not.toContain(".surfaceBrand");
  });

  it("gives the light marketing hero a warm-white foundation and a 42/58 product row", () => {
    const tokens = read("app/(marketing)/marketing.css");
    const styles = read("app/(marketing)/marketing.module.css");
    const wave = read("app/(marketing)/components/marketing-wave.tsx");
    const preview = read(
      "app/(marketing)/components/marketing-product-preview.tsx"
    );

    const hero = tokens.match(
      /--mk-hero:\s*light-dark\((#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\)/
    );
    expect(hero).not.toBeNull();
    expect(hexLuminance(hero![1])).toBeGreaterThan(0.85);
    expect(hexLuminance(hero![2])).toBeLessThan(0.12);

    expect(styles).not.toMatch(
      /\.marketingBase[^{]*\{[^}]*color:\s*var\(--mk-on-dark\)/
    );
    expect(styles).toContain("0.42fr 0.58fr");
    expect(styles).not.toContain("100vh");
    expect(styles).not.toContain("perspective");
    expect(styles).not.toContain("rotateY");
    expect(wave).toContain('aria-hidden="true"');
    expect(wave).toContain('focusable="false"');
    expect(preview).not.toMatch(/['"]use client['"]/);
    expect(preview).toContain('aria-hidden="true"');
    expect(preview).not.toContain("<img");
    expect(preview).not.toContain("<button");
    expect(preview).not.toContain("<a ");
  });

  it("keeps patient Client Components isolated to theme control and marketing Motion to marketing", () => {
    const allowedPatientClient = new Set([
      "app/(aftercare)/components/patient-theme-control.tsx",
    ]);
    const allowedMarketingClient = new Set([
      "app/(marketing)/components/marketing-theme-control.tsx",
      "app/(marketing)/components/marketing-experience.tsx",
      "app/(marketing)/components/marketing-motion-features.ts",
    ]);
    const files = walk("app/(aftercare)").filter((path) =>
      /\.(ts|tsx|css)$/.test(path)
    );

    expect(files.length).toBeGreaterThan(5);

    for (const file of files) {
      const source = read(file);
      if (!allowedPatientClient.has(file)) {
        expect(source, file).not.toMatch(/['"]use client['"]/);
      }
      expect(source, file).not.toContain("tailwindcss");
      expect(source, file).not.toContain("styled-components");
      expect(source, file).not.toContain("@emotion");
      expect(source, file).not.toMatch(/from ["']motion(\/|$)/);
      expect(source, file).not.toContain("framer-motion");
    }

    const marketingFiles = walk("app/(marketing)").filter((path) =>
      /\.(ts|tsx|css)$/.test(path)
    );
    expect(marketingFiles.length).toBeGreaterThan(2);
    for (const file of marketingFiles) {
      const source = read(file);
      if (!allowedMarketingClient.has(file)) {
        expect(source, file).not.toMatch(/['"]use client['"]/);
      }
      expect(source, file).not.toContain("tailwindcss");
      expect(source, file).not.toContain("styled-components");
      expect(source, file).not.toContain("@emotion");
      expect(source, file).not.toContain("framer-motion");
    }

    expect(
      read("app/(aftercare)/components/patient-theme-control.tsx")
    ).toMatch(/['"]use client['"]/);
    expect(
      read("app/(marketing)/components/marketing-theme-control.tsx")
    ).toMatch(/['"]use client['"]/);
    expect(read("app/(marketing)/components/marketing-experience.tsx")).toMatch(
      /['"]use client['"]/
    );
    expect(read("app/(aftercare)/components/guide-list.tsx")).not.toMatch(
      /['"]use client['"]/
    );
    expect(read("app/(marketing)/%5Fmarketing/page.tsx")).toContain(
      "MarketingRevealHero"
    );
    expect(read("app/(marketing)/%5Fmarketing/page.tsx")).not.toMatch(
      /import \{[^}]*\bMarketingReveal\b[^}]*\} from/
    );
  });
});
