import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { toSafeLogoSrc } from "@/lib/aftercare/safe-href";

describe("logo upload infrastructure", () => {
  it("keeps the current same-origin logo path contract", () => {
    expect(toSafeLogoSrc("/demo/riverside-mark.svg")).toBe(
      "/demo/riverside-mark.svg"
    );
    expect(toSafeLogoSrc("/branding/logo.png")).toBe("/branding/logo.png");
    expect(toSafeLogoSrc("/branding/logo.webp")).toBe("/branding/logo.webp");
  });

  it("documents the production object-storage blocker instead of a fake upload", () => {
    const form = readFileSync(
      "app/(staff)/(clinic-portal)/practice/practice-settings-form.tsx",
      "utf8"
    );
    const schema = readFileSync(
      "lib/clinic-portal/practice-settings-schema.ts",
      "utf8"
    );

    expect(form).toContain("Upload logo — coming before launch");
    expect(form).toContain("production object storage");
    expect(form).not.toContain('type="file"');
    expect(form).toContain('type="hidden"');
    expect(schema).toContain("toSafeLogoSrc");
    expect(schema).not.toContain("base64");
  });
});
