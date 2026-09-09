import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { PatientDemoExperience } from "@/app/(aftercare)/components/patient-demo-experience";
import { readFileSync } from "node:fs";

describe("PatientDemoExperience", () => {
  it("starts on Today with Timeline navigation and Print / Save PDF", () => {
    const html = renderToStaticMarkup(
      <PatientDemoExperience
        printHref="/extraction/print"
        today={<p>Today panel</p>}
        timeline={<p>Timeline panel</p>}
      />
    );

    expect(html).toContain("Today");
    expect(html).toContain("Timeline");
    expect(html).toContain('href="/extraction/print"');
    expect(html).toContain("Print / Save PDF");
    expect(html).toContain('aria-label="Print / Save PDF"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('data-demo-view="today"');
    expect(html).toContain("Today panel");
    expect(html).not.toContain("Check-in");
    expect(html).not.toContain("How are you feeling today?");
    expect(html).not.toContain("Care Plan");
    expect(html).not.toContain("fetch(");
    expect(html).not.toContain("localStorage");
  });

  it("does not keep Check-in client or storage code in the island", () => {
    const source = readFileSync(
      "app/(aftercare)/components/patient-demo-experience.tsx",
      "utf8"
    );

    expect(source).not.toMatch(/Check-in/);
    expect(source).not.toMatch(/checkIn/);
    expect(source).not.toMatch(/localStorage/);
    expect(source).not.toMatch(/sessionStorage/);
    expect(source).not.toMatch(/\bfetch\(/);
    expect(source).toContain("Print / Save PDF");
  });
});
