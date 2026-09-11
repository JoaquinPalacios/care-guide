import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("portal shell and role chrome", () => {
  it("fixes the desktop sidebar to the viewport and keeps a mobile drawer", () => {
    const chrome = readFileSync(
      "app/(staff)/components/portal-chrome.tsx",
      "utf8"
    );
    const css = readFileSync("app/(staff)/staff.css", "utf8");
    const layout = readFileSync(
      "app/(staff)/(clinic-portal)/layout.tsx",
      "utf8"
    );
    const operator = readFileSync("app/(staff)/(operator)/layout.tsx", "utf8");

    expect(chrome).toContain("staffPortalShell");
    expect(chrome).toContain("Clinic portal menu");
    expect(chrome).toContain("roleLabel");
    expect(css).toContain("height: 100dvh");
    expect(layout).toContain("clinicMembershipRoleLabel");
    expect(operator).toContain("PLATFORM_OPERATOR_ROLE_LABEL");
    expect(operator).toContain("staffPortalShell");
  });
});
