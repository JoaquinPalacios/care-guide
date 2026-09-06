import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GuideDocument } from "@/app/(aftercare)/components/guide-document";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

function section(
  overrides: Partial<ComposedGuideSection> &
    Pick<ComposedGuideSection, "key" | "kind" | "title">
): ComposedGuideSection {
  return {
    body: `${overrides.key} body`,
    periodLabel: null,
    provenance: "canonical",
    ...overrides,
  };
}

describe("GuideDocument timeline rendering", () => {
  it("renders period labels in order without patient-specific fields", () => {
    const html = renderToStaticMarkup(
      <GuideDocument
        sections={[
          section({
            key: "introduction",
            kind: "INTRODUCTION",
            title: "About this guide",
            body: "Short summary.",
          }),
          section({
            key: "hours",
            kind: "RECOVERY_TIMELINE",
            title: "Immediate care",
            periodLabel: "First 4 hours",
            body: "Keep the site still.",
          }),
          section({
            key: "week-two",
            kind: "RECOVERY_TIMELINE",
            title: "Later healing",
            periodLabel: "Week 2+",
            body: "Check in if unsure.",
          }),
        ]}
      />
    );

    expect(html).toContain("Recovery timeline");
    expect(html).toContain("First 4 hours");
    expect(html).toContain("Week 2+");
    expect(html.indexOf("First 4 hours")).toBeLessThan(html.indexOf("Week 2+"));
    expect(html).toContain("<ol");
    expect(html).not.toContain("patient name");
    expect(html).not.toContain("PIN");
    expect(html).not.toContain("plan ID");
    expect(html).not.toContain("QR Rx");
  });

  it("still renders a guide that has no timeline sections", () => {
    const html = renderToStaticMarkup(
      <GuideDocument
        sections={[
          section({
            key: "introduction",
            kind: "INTRODUCTION",
            title: "About this guide",
            body: "No timeline here.",
          }),
        ]}
      />
    );

    expect(html).toContain("About this guide");
    expect(html).not.toContain("Recovery timeline");
    expect(html).not.toContain("<ol");
  });
});
