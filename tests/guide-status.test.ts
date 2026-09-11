import { describe, expect, it } from "vitest";

import {
  clinicGuideDestructiveAction,
  clinicGuideStatusLabel,
  clinicGuideStatusPills,
} from "@/lib/clinic-portal/guide-status";

describe("clinic guide status tokens", () => {
  it("exposes text-based pills for list, editor, and preview", () => {
    expect(clinicGuideStatusPills("draft")).toEqual([{ label: "Draft" }]);
    expect(clinicGuideStatusPills("published")).toEqual([
      { label: "Published" },
    ]);
    expect(clinicGuideStatusPills("published_draft_changes")).toEqual([
      { label: "Published" },
      { label: "Draft changes" },
    ]);
    expect(clinicGuideStatusLabel("published_draft_changes")).toBe(
      "Published · Draft changes"
    );
  });

  it("offers delete only for never-published drafts and discard only for draft changes", () => {
    expect(clinicGuideDestructiveAction("draft")).toBe("delete_draft");
    expect(clinicGuideDestructiveAction("published_draft_changes")).toBe(
      "discard_draft"
    );
    expect(clinicGuideDestructiveAction("published")).toBeNull();
    expect(clinicGuideDestructiveAction("published_disabled")).toBeNull();
  });
});
