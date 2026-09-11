import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("clinic portal layout roles and shell", () => {
  it("renders clinic-facing role labels and a viewport-fixed desktop shell", () => {
    const layout = readFileSync(
      "app/(staff)/(clinic-portal)/layout.tsx",
      "utf8"
    );
    const operator = readFileSync("app/(staff)/(operator)/layout.tsx", "utf8");
    const chrome = readFileSync(
      "app/(staff)/components/portal-chrome.tsx",
      "utf8"
    );
    const css = readFileSync("app/(staff)/staff.css", "utf8");

    expect(layout).toContain("clinicMembershipRoleLabel");
    expect(layout).not.toContain('"Admin"');
    expect(layout).not.toContain('"Staff"');
    expect(operator).toContain("PLATFORM_OPERATOR_ROLE_LABEL");
    expect(operator).not.toContain(">Operator<");
    expect(chrome).toContain("staffAppShell");
    expect(chrome).toContain("staffAppSidebar");
    expect(css).toContain("height: 100dvh");
    expect(css).toContain(".staffAppScroller");
  });
});
