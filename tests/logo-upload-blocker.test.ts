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
    expect(toSafeLogoSrc("/clinic-branding/clinic_demo_rivers/logo.svg")).toBe(
      "/clinic-branding/clinic_demo_rivers/logo.svg"
    );
  });

  it("does not ship a filesystem upload or inline SVG injection", () => {
    const field = readFileSync(
      "app/(staff)/(clinic-portal)/practice/practice-logo-field.tsx",
      "utf8"
    );
    const header = readFileSync(
      "app/(aftercare)/components/practice-header.tsx",
      "utf8"
    );
    const adapter = readFileSync(
      "lib/clinic-assets/supabase-clinic-asset-storage.ts",
      "utf8"
    );
    const sanitizer = readFileSync(
      "lib/clinic-assets/sanitize-clinic-logo-svg.ts",
      "utf8"
    );

    const fieldText = field.replace(/\s+/g, " ");

    expect(field).toContain('type="file"');
    expect(fieldText).toContain("clinic object storage is not configured");
    expect(field).not.toContain("public/uploads");
    expect(field).not.toContain("coming before launch");
    expect(header).toContain("<img");
    expect(header).not.toContain("dangerouslySetInnerHTML");
    expect(adapter).toContain("createClient");
    expect(adapter).not.toContain("fs.writeFile");
    expect(sanitizer).toContain("server-only");
    expect(sanitizer).toContain("dompurify");
    expect(sanitizer).not.toContain("dangerouslySetInnerHTML");
  });
});
