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
    expect(toSafeLogoSrc("/clinic-branding/clinic_demo_rivers/logo.webp")).toBe(
      "/clinic-branding/clinic_demo_rivers/logo.webp"
    );
  });

  it("does not ship a fake filesystem or in-form upload while storage is unconfigured", () => {
    const form = readFileSync(
      "app/(staff)/(clinic-portal)/practice/practice-settings-form.tsx",
      "utf8"
    );
    const schema = readFileSync(
      "lib/clinic-portal/practice-settings-schema.ts",
      "utf8"
    );
    const adapter = readFileSync(
      "lib/clinic-assets/supabase-clinic-asset-storage.ts",
      "utf8"
    );

    expect(form).toContain("production object storage");
    expect(form).toContain("Current logo preview");
    expect(form).not.toContain('type="file"');
    expect(form).not.toContain("public/uploads");
    expect(form).toContain('type="hidden"');
    expect(schema).toContain("toSafeLogoSrc");
    expect(schema).not.toContain("base64");
    expect(adapter).toContain("createClient");
    expect(adapter).not.toContain("fs.writeFile");
  });
});
