import { describe, expect, it } from "vitest";

import {
  clinicGuideDestructiveAction,
  clinicGuideStatusLabel,
  clinicGuideStatusPills,
} from "@/lib/clinic-portal/guide-status";

describe("guide status pills", () => {
  it("splits published drafts into distinct Published and Draft changes pills", () => {
    expect(clinicGuideStatusPills("published_draft_changes")).toEqual([
      { label: "Published", tone: "published" },
      { label: "Draft changes", tone: "changes" },
    ]);
    expect(clinicGuideStatusLabel("published_draft_changes")).toBe(
      "Published · Draft changes"
    );
    expect(clinicGuideStatusPills("draft")).toEqual([
      { label: "Draft", tone: "draft" },
    ]);
    expect(clinicGuideStatusPills("published")).toEqual([
      { label: "Published", tone: "published" },
    ]);
  });

  it("only offers delete for never-published drafts and discard for published draft changes", () => {
    expect(clinicGuideDestructiveAction("draft")).toBe("delete_draft");
    expect(clinicGuideDestructiveAction("published_draft_changes")).toBe(
      "discard_draft_changes"
    );
    expect(clinicGuideDestructiveAction("published")).toBeNull();
    expect(clinicGuideDestructiveAction("published_disabled")).toBeNull();
  });
});
