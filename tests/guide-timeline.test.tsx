import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GuideTimeline } from "@/app/(aftercare)/components/guide-timeline";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

const STAGES: ComposedGuideSection[] = [
  {
    key: "immediate-care",
    kind: "RECOVERY_TIMELINE",
    title: "Immediate care",
    body: "Keep the site still.",
    periodLabel: "First few hours",
    provenance: "canonical",
  },
  {
    key: "first-24-hours",
    kind: "RECOVERY_TIMELINE",
    title: "Protect the healing site",
    body: "Leave the site undisturbed today.",
    periodLabel: "Today / first 24 hours",
    provenance: "canonical",
  },
  {
    key: "days-2-3",
    kind: "RECOVERY_TIMELINE",
    title: "Continue gentle care",
    body: "Swelling should ease.",
    periodLabel: "Days 2–3",
    provenance: "canonical",
  },
];

describe("GuideTimeline", () => {
  it("renders subtle separators between stages but not after the last", () => {
    const html = renderToStaticMarkup(
      <GuideTimeline
        sections={STAGES}
        stageStatusByKey={{
          "immediate-care": "earlier",
          "first-24-hours": "current",
          "days-2-3": "upcoming",
        }}
      />
    );

    const separators = html.match(/data-timeline-separator/g) ?? [];
    const stages = html.match(/data-timeline-stage/g) ?? [];

    expect(stages).toHaveLength(3);
    expect(separators).toHaveLength(2);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("timelineRail");
    expect(html).toContain("Earlier");
    expect(html).toContain("Current");
    expect(html).toContain("Upcoming");
    expect(html.lastIndexOf("data-timeline-separator")).toBeLessThan(
      html.lastIndexOf("data-timeline-stage")
    );
  });

  it("keeps earlier / current / upcoming semantics without calling stages completed", () => {
    const html = renderToStaticMarkup(
      <GuideTimeline
        sections={STAGES}
        stageStatusByKey={{
          "immediate-care": "earlier",
          "first-24-hours": "current",
          "days-2-3": "upcoming",
        }}
      />
    );

    expect(html).not.toContain("Completed");
    expect(html).toContain('data-status="earlier"');
    expect(html).toContain('data-status="current"');
    expect(html).toContain('data-status="upcoming"');
  });
});
