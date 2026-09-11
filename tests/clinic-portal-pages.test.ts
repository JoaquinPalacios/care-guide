import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("clinic portal pages", () => {
  it("scopes overview and guides to the authenticated clinic membership", () => {
    const overview = readFileSync(
      "app/(staff)/(clinic-portal)/dashboard/page.tsx",
      "utf8"
    );
    const guides = readFileSync(
      "app/(staff)/(clinic-portal)/guides/page.tsx",
      "utf8"
    );
    const listItem = readFileSync(
      "app/(staff)/(clinic-portal)/guides/guide-list-item.tsx",
      "utf8"
    );
    const layout = readFileSync(
      "app/(staff)/(clinic-portal)/layout.tsx",
      "utf8"
    );

    expect(overview).toContain("requireStaffSession");
    expect(overview).toContain("clinicMembership.clinic.id");
    expect(overview).not.toContain("searchParams");
    expect(overview).not.toContain("listInProgressSessions");
    expect(overview).not.toContain("ProcedureSession");
    expect(overview).not.toContain("Start a new session");
    expect(overview).not.toContain("Wisdom Teeth");
    expect(guides).toContain("requireStaffSession");
    expect(guides).toContain("clinicMembership.clinic.id");
    expect(guides).not.toContain("searchParams");
    expect(guides).toContain("Create guide");
    expect(guides).not.toContain("Add guide");
    expect(guides).not.toContain("Duplicate");
    expect(listItem).toContain("StatusPills");
    expect(listItem).toContain("MoreActionsMenu");
    expect(listItem).toContain("Delete draft");
    expect(listItem).toContain("Discard draft changes");
    expect(layout).toContain("clinicMembershipRoleLabel");
    expect(layout).toContain("requireStaffSession");
    expect(layout).toContain("clinicMembership.clinic.id");
  });

  it("keeps parked chairside procedure routes without linking them from the portal", () => {
    const chrome = readFileSync(
      "app/(staff)/components/portal-chrome.tsx",
      "utf8"
    );
    const procedures = readFileSync(
      "app/(staff)/dashboard/procedures/page.tsx",
      "utf8"
    );

    expect(chrome).toContain("Overview");
    expect(chrome).toContain("Guides");
    expect(chrome).toContain("Practice");
    expect(chrome).toContain("View patient site");
    expect(chrome).toContain("PortalAppearanceControl");
    expect(chrome).not.toContain("/sessions");
    expect(chrome).not.toContain("Analytics");
    expect(chrome).not.toContain("Check-ins");
    expect(chrome).not.toContain("/dashboard/procedures");
    expect(procedures).toContain("requireStaffSession");
    expect(procedures).toContain("Procedure templates");
  });

  it("refreshes staff login copy to Aftercare Guide", () => {
    const login = readFileSync("app/(staff)/login/page.tsx", "utf8");
    expect(login).toContain("PRODUCT_NAME");
    expect(login).toContain("Staff sign in");
    expect(login).not.toContain("Care Guide");
  });

  it("keeps Practice and operator mutations behind server-side role guards", () => {
    const practice = readFileSync(
      "app/(staff)/(clinic-portal)/practice/page.tsx",
      "utf8"
    );
    const practiceActions = readFileSync(
      "app/(staff)/(clinic-portal)/practice/actions.ts",
      "utf8"
    );
    const guideActions = readFileSync(
      "app/(staff)/(clinic-portal)/guides/actions.ts",
      "utf8"
    );
    const operatorPage = readFileSync(
      "app/(staff)/(operator)/operator/clinics/page.tsx",
      "utf8"
    );
    const operatorActions = readFileSync(
      "app/(staff)/(operator)/operator/actions.ts",
      "utf8"
    );
    const preview = readFileSync(
      "app/(staff)/(guide-preview)/guides/[guideId]/preview/page.tsx",
      "utf8"
    );

    expect(practice).toContain("requireClinicAdmin");
    expect(practice).not.toContain("searchParams");
    expect(practiceActions).toContain("requireClinicAdmin");
    expect(practiceActions).toContain("clinicMembership.clinic.id");
    expect(practiceActions).not.toContain('formData.get("clinicId")');
    expect(guideActions).toContain("requireClinicAdmin");
    expect(guideActions).not.toContain('formData.get("clinicId")');
    expect(guideActions).toContain("deleteUnpublishedPracticeGuide");
    expect(guideActions).toContain("discardPracticeGuideDraft");
    expect(operatorPage).toContain("requirePlatformOperator");
    expect(operatorActions).toContain("requirePlatformOperator");
    expect(preview).toContain("requireStaffSession");
    expect(preview).toContain("PatientPage");
    expect(preview).toContain("GuideDocument");
    expect(preview).toContain("StaffPreviewToolbar");
    expect(preview).not.toContain("Wisdom Teeth");
  });
});
