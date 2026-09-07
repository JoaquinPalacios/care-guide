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

    expect(html).toContain("Recovery guide");
    expect(html).not.toContain("Recovery timeline");
    expect(html).toContain("First 4 hours");
    expect(html).toContain("Week 2+");
    expect(html.indexOf("First 4 hours")).toBeLessThan(html.indexOf("Week 2+"));
    expect(html).toContain("<ol");
    expect(html.match(/<ol\b/g)).toHaveLength(1);
    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html).not.toContain("<article");
    expect(html).not.toContain("patient name");
    expect(html).not.toContain("PIN");
    expect(html).not.toContain("plan ID");
    expect(html).not.toContain("QR Rx");
  });

  it("keeps consecutive stages in one journey instead of per-stage cards", () => {
    const html = renderToStaticMarkup(
      <GuideDocument
        sections={[
          section({
            key: "hours",
            kind: "RECOVERY_TIMELINE",
            title: "Immediate care",
            periodLabel: "First 4 hours",
          }),
          section({
            key: "day",
            kind: "RECOVERY_TIMELINE",
            title: "Protect the site",
            periodLabel: "Today",
          }),
        ]}
      />
    );

    expect(html.match(/<section\b/g)).toHaveLength(1);
    expect(html).not.toContain("<article");
    expect(html.match(/<ol\b/g)).toHaveLength(1);
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
    expect(html).not.toContain("Recovery guide");
    expect(html).not.toContain("Recovery timeline");
    expect(html).not.toContain("<ol");
  });

  it("renders standard sections as plain headings without card wrappers", () => {
    const html = renderToStaticMarkup(
      <GuideDocument
        sections={[
          section({
            key: "introduction",
            kind: "INTRODUCTION",
            title: "About this guide",
            body: "Plain introduction.",
          }),
          section({
            key: "normal",
            kind: "WHAT_IS_NORMAL",
            title: "What is normal",
            body: "Expected recovery notes.",
          }),
        ]}
      />
    );

    expect(html).toContain("About this guide");
    expect(html).toContain("What is normal");
    expect(html).not.toContain("<article");
    expect(html.match(/<section\b/g)).toHaveLength(2);
  });
});
