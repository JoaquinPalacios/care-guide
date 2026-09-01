import { describe, expect, it } from "vitest";

import { composeGuideDocument } from "@/lib/aftercare/compose-guide-document";
import type {
  CanonicalGuideSection,
  PracticeGuideAdditionInput,
  PracticeGuideOverrideInput,
} from "@/lib/aftercare/types";

function section(
  key: string,
  sortOrder: number,
  title = key
): CanonicalGuideSection {
  return {
    key,
    kind: "INTRODUCTION",
    title,
    body: `${key} body`,
    sortOrder,
  };
}

function override(
  sectionKey: string,
  title: string,
  body: string
): PracticeGuideOverrideInput {
  return { sectionKey, title, body };
}

function addition(
  key: string,
  sortOrder: number,
  insertAfterSectionKey: string | null
): PracticeGuideAdditionInput {
  return {
    key,
    kind: "CUSTOM",
    title: key,
    body: `${key} body`,
    sortOrder,
    insertAfterSectionKey,
  };
}

describe("composeGuideDocument", () => {
  it("preserves canonical section order by sortOrder", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        section("warning-signs", 3),
        section("introduction", 1),
        section("immediate-care", 2),
      ],
      overrides: [],
      additions: [],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "introduction",
      "immediate-care",
      "warning-signs",
    ]);
    expect(
      document.sections.every((item) => item.provenance === "canonical")
    ).toBe(true);
  });

  it("replaces matching canonical section content with a practice override", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        section("introduction", 1, "Intro"),
        section("immediate-care", 2, "Immediate"),
      ],
      overrides: [
        override(
          "immediate-care",
          "Riverside immediate care",
          "Call reception."
        ),
      ],
      additions: [],
    });

    expect(document.sections).toEqual([
      {
        key: "introduction",
        kind: "INTRODUCTION",
        title: "Intro",
        body: "introduction body",
        provenance: "canonical",
      },
      {
        key: "immediate-care",
        kind: "INTRODUCTION",
        title: "Riverside immediate care",
        body: "Call reception.",
        provenance: "practice_override",
      },
    ]);
  });

  it("inserts an addition immediately after the requested canonical section", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        section("introduction", 1),
        section("contact-practice", 2),
      ],
      overrides: [],
      additions: [addition("weekend-hours", 1, "introduction")],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "introduction",
      "weekend-hours",
      "contact-practice",
    ]);
    expect(document.sections[1]).toMatchObject({
      provenance: "practice_addition",
      kind: "CUSTOM",
    });
  });

  it("orders multiple additions after the same section by sortOrder then key", () => {
    const document = composeGuideDocument({
      canonicalSections: [section("introduction", 1), section("contact", 2)],
      overrides: [],
      additions: [
        addition("beta", 2, "introduction"),
        addition("alpha", 2, "introduction"),
        addition("first", 1, "introduction"),
      ],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "introduction",
      "first",
      "alpha",
      "beta",
      "contact",
    ]);
  });

  it("appends additions that have no insert target at the end", () => {
    const document = composeGuideDocument({
      canonicalSections: [section("introduction", 1), section("contact", 2)],
      overrides: [],
      additions: [addition("parking", 1, null)],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "introduction",
      "contact",
      "parking",
    ]);
  });

  it("ignores orphan overrides that do not match a canonical section", () => {
    const document = composeGuideDocument({
      canonicalSections: [section("introduction", 1)],
      overrides: [override("missing-section", "Gone", "Should not appear")],
      additions: [],
    });

    expect(document.sections).toEqual([
      {
        key: "introduction",
        kind: "INTRODUCTION",
        title: "introduction",
        body: "introduction body",
        provenance: "canonical",
      },
    ]);
  });

  it("appends additions whose insertAfterSectionKey does not exist", () => {
    const document = composeGuideDocument({
      canonicalSections: [section("introduction", 1), section("contact", 2)],
      overrides: [],
      additions: [addition("orphaned-note", 1, "does-not-exist")],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "introduction",
      "contact",
      "orphaned-note",
    ]);
    expect(document.sections[2]?.provenance).toBe("practice_addition");
  });

  it("keeps provenance distinct across canonical, override, and addition sections", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        section("introduction", 1),
        section("immediate-care", 2),
        section("contact", 3),
      ],
      overrides: [override("immediate-care", "Local care", "Local body")],
      additions: [
        addition("after-intro", 1, "introduction"),
        addition("appended", 1, null),
      ],
    });

    expect(
      document.sections.map((item) => [item.key, item.provenance])
    ).toEqual([
      ["introduction", "canonical"],
      ["after-intro", "practice_addition"],
      ["immediate-care", "practice_override"],
      ["contact", "canonical"],
      ["appended", "practice_addition"],
    ]);
  });

  it("breaks canonical sortOrder ties by key", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        section("zeta", 1),
        section("alpha", 1),
        section("mu", 1),
      ],
      overrides: [],
      additions: [],
    });

    expect(document.sections.map((item) => item.key)).toEqual([
      "alpha",
      "mu",
      "zeta",
    ]);
  });

  it("uses the last override when the same sectionKey appears twice", () => {
    const document = composeGuideDocument({
      canonicalSections: [section("introduction", 1, "Intro")],
      overrides: [
        override("introduction", "First override", "First body"),
        override("introduction", "Second override", "Second body"),
      ],
      additions: [],
    });

    expect(document.sections).toEqual([
      {
        key: "introduction",
        kind: "INTRODUCTION",
        title: "Second override",
        body: "Second body",
        provenance: "practice_override",
      },
    ]);
  });

  it("passes through empty titles and bodies without throwing", () => {
    const document = composeGuideDocument({
      canonicalSections: [
        {
          key: "empty-canonical",
          kind: "INTRODUCTION",
          title: "",
          body: "",
          sortOrder: 1,
        },
      ],
      overrides: [override("empty-canonical", "", "")],
      additions: [
        {
          key: "empty-addition",
          kind: "CUSTOM",
          title: "",
          body: "   ",
          sortOrder: 1,
          insertAfterSectionKey: "empty-canonical",
        },
      ],
    });

    expect(document.sections).toEqual([
      {
        key: "empty-canonical",
        kind: "INTRODUCTION",
        title: "",
        body: "",
        provenance: "practice_override",
      },
      {
        key: "empty-addition",
        kind: "CUSTOM",
        title: "",
        body: "   ",
        provenance: "practice_addition",
      },
    ]);
  });

  it("returns an empty document when there are no canonical sections", () => {
    const document = composeGuideDocument({
      canonicalSections: [],
      overrides: [override("missing", "Gone", "Ignored")],
      additions: [addition("orphaned", 1, "missing")],
    });

    expect(document.sections.map((item) => item.key)).toEqual(["orphaned"]);
    expect(document.sections[0]?.provenance).toBe("practice_addition");
  });
});
