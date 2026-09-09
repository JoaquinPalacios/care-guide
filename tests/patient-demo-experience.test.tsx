import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { PatientDemoExperience } from "@/app/(aftercare)/components/patient-demo-experience";

describe("PatientDemoExperience", () => {
  it("renders Check-in when the demo flag is enabled", () => {
    const html = renderToStaticMarkup(
      <PatientDemoExperience
        checkInEnabled
        printHref="/extraction/print"
        today={<p>Today panel</p>}
        timeline={<p>Timeline panel</p>}
      />
    );

    expect(html).toContain("Today");
    expect(html).toContain("Timeline");
    expect(html).toContain("Check-in");
    expect(html).toContain("How are you feeling today?");
    expect(html).toContain("Demo response · Not saved");
    expect(html).toContain('href="/extraction/print"');
    expect(html).toContain("Print / Care Plan");
    expect(html).not.toContain("fetch(");
    expect(html).not.toContain("localStorage");
  });

  it("omits Check-in entirely when the flag is disabled", () => {
    const html = renderToStaticMarkup(
      <PatientDemoExperience
        checkInEnabled={false}
        printHref="/extraction/print"
        today={<p>Today panel</p>}
        timeline={<p>Timeline panel</p>}
      />
    );

    expect(html).toContain("Today");
    expect(html).toContain("Timeline");
    expect(html).not.toContain("Check-in");
    expect(html).not.toContain("How are you feeling today?");
    expect(html).toContain("Print / Care Plan");
  });

  it("starts on Today and keeps tab semantics", () => {
    const html = renderToStaticMarkup(
      <PatientDemoExperience
        checkInEnabled
        printHref="/extraction/print"
        today={<p>Today panel</p>}
        timeline={<p>Timeline panel</p>}
      />
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('data-demo-view="today"');
    expect(html).toContain("Today panel");
    expect(html).toContain("Rough");
    expect(html).toContain("Great");
    expect(html).toContain("your clinic to know?");
  });
});
