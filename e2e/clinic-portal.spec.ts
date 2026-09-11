import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { expectNoHorizontalOverflow } from "./helpers/layout";
import { DEMO_TENANT_SLUG, staffUrl, tenantUrl } from "./helpers/origins";
import {
  signInAsLocalAdmin,
  signInAsLocalOperator,
  signInAsLocalStaff,
} from "./helpers/staff-auth";

test.describe("clinic portal", () => {
  test("unauthenticated dashboard and guides redirect to login", async ({
    page,
  }) => {
    for (const pathname of ["/dashboard", "/guides", "/practice"] as const) {
      await page.goto(staffUrl(pathname), { waitUntil: "load" });
      await expect(page).toHaveURL(/\/login/);
      await expect(
        page.getByRole("heading", { name: "Staff sign in" })
      ).toBeVisible();
      await expect(page.getByText("Aftercare Guide").first()).toBeVisible();
      await expect(page.getByText("Care Guide", { exact: true })).toHaveCount(
        0
      );
    }
  });

  test("login and overview show the aftercare portal, not chairside", async ({
    page,
  }) => {
    await page.goto(staffUrl("/login"), { waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/staff-login-1440.png",
    });
    await expectNoSeriousAxeViolations(page);

    await signInAsLocalAdmin(page);
    await expect(
      page.getByRole("heading", { name: "Riverside Dental Demo" })
    ).toBeVisible();
    await expect(
      page.getByText("Manage your clinic's patient aftercare.")
    ).toBeVisible();
    await expect(page.getByText("Published guides")).toBeVisible();
    await expect(page.getByText("Draft guides")).toBeVisible();
    await expect(page.getByText("Clinic setup")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View patient site/ }).first()
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/"));
    await expect(page.getByText("In-progress sessions")).toHaveCount(0);
    await expect(page.getByText("Start a new session")).toHaveCount(0);
    await expect(page.getByText("Procedure templates")).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Clinic portal" })
    ).toBeVisible();
    await expect(
      page.locator("aside").getByText("Clinic admin", { exact: true })
    ).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: "test-results/artifacts/staff-dashboard-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.setViewportSize({ width: 768, height: 1024 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-dashboard-tablet.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("button", { name: "Clinic portal menu" })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-dashboard-mobile.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.setViewportSize({ width: 360, height: 800 });
    await expectNoHorizontalOverflow(page);
  });

  test("guides lists real clinic guides with working preview links", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.getByRole("link", { name: "Guides" }).click();
    await expect(page).toHaveURL(staffUrl("/guides"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Guides"
    );
    await expect(
      page.getByText("Tooth Extraction", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("/extraction")).toBeVisible();
    await expect(
      page.getByText("Published", { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText("Wisdom Teeth")).toHaveCount(0);
    await expect(page.getByText("Root Canal")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Create guide" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add guide" })).toHaveCount(
      0
    );
    await expect(
      page.getByRole("link", { name: "Edit" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Preview" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View patient guide/ })
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/extraction"));
    await expect(page.getByText("Harbor Family Dental")).toHaveCount(0);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: "test-results/artifacts/staff-guides-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });

  test("parked chairside routes remain directly reachable", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    const procedures = await page.goto(staffUrl("/dashboard/procedures"), {
      waitUntil: "load",
    });
    expect(procedures?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Procedure templates" })
    ).toBeVisible();

    const newSession = await page.goto(staffUrl("/sessions/new"), {
      waitUntil: "load",
    });
    expect(newSession?.status()).toBe(200);
    await expect(page.getByText("Start a new session")).toBeVisible();
  });

  test("password visibility toggle does not submit the form", async ({
    page,
  }) => {
    await page.goto(staffUrl("/login"), { waitUntil: "load" });
    const password = page.locator("#password");
    await password.fill("LocalOnly123!");
    await expect(password).toHaveAttribute("type", "password");
    await page.screenshot({
      path: "test-results/artifacts/staff-login-password-hidden.png",
    });

    await page.getByRole("button", { name: "Show password" }).click();
    await expect(page).toHaveURL(staffUrl("/login"));
    await expect(password).toHaveAttribute("type", "text");
    await expect(
      page.getByRole("button", { name: "Hide password" })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-login-password-shown.png",
    });
    await expectNoSeriousAxeViolations(page);
  });

  test("admin can open Practice, create-guide, editor, and draft preview", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.getByRole("link", { name: "Practice" }).click();
    await expect(page).toHaveURL(staffUrl("/practice"));
    await expect(
      page.getByRole("heading", { name: "Riverside Dental Demo" })
    ).toBeVisible();
    await expect(
      page.getByLabel("Primary brand colour", { exact: true })
    ).toBeVisible();
    await expect(page.locator('input[type="color"]')).toHaveCount(3);
    await expect(
      page
        .getByRole("button", { name: "Save changes" })
        .filter({ visible: true })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-practice-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-practice-mobile.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 360, height: 800 });
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(staffUrl("/guides/new"), { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Create guide" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Start from a template" })
    ).toBeVisible();
    await expect(page.getByText("Tooth Extraction")).toBeVisible();
    await expect(page.getByText("Already in your guides")).toBeVisible();
    await expect(page.getByText("Wisdom Teeth")).toHaveCount(0);
    await page.screenshot({
      path: "test-results/artifacts/staff-create-guide-1440.png",
      fullPage: true,
    });

    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save draft" }).filter({ visible: true })
    ).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: "Publish guide" })
        .filter({ visible: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cancel" }).filter({ visible: true })
    ).toBeVisible();
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add stage" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Patient timeline preview" })
    ).toBeVisible();
    await expect(page.locator("[data-editor-preview]")).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-1280.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-tablet.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 360, height: 800 });
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("link", { name: "Preview" }).first().click();
    await expect(page).toHaveURL(/\/guides\/.+\/preview/);
    await expect(
      page.getByText("Draft preview", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to guide" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit guide" })).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-preview-toolbar-1440.png",
    });
    await page.getByRole("link", { name: "Back to guide" }).click();
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
  });

  test("clinic staff cannot mutate guides or open Practice", async ({
    page,
  }) => {
    await signInAsLocalStaff(page);
    await expect(
      page
        .getByRole("navigation", { name: "Clinic portal" })
        .getByRole("link", {
          name: "Practice",
        })
    ).toHaveCount(0);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await expect(page.getByRole("link", { name: "Create guide" })).toHaveCount(
      0
    );
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
    await page.getByRole("link", { name: "Preview" }).first().click();
    await expect(page).toHaveURL(/\/guides\/.+\/preview/);
    await expect(
      page.getByRole("link", { name: "Back to guides" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit guide" })).toHaveCount(0);
    await page.getByRole("link", { name: "Back to guides" }).click();
    await expect(page).toHaveURL(staffUrl("/guides"));
    const practice = await page.goto(staffUrl("/practice"), {
      waitUntil: "load",
    });
    expect(practice?.status()).toBe(404);
    const operator = await page.goto(staffUrl("/operator/clinics"), {
      waitUntil: "load",
    });
    expect(operator?.status()).toBe(404);
  });

  test("clinic admin cannot open All Clinics", async ({ page }) => {
    await signInAsLocalAdmin(page);
    const operator = await page.goto(staffUrl("/operator/clinics"), {
      waitUntil: "load",
    });
    expect(operator?.status()).toBe(404);
  });
});

test.describe("platform operator", () => {
  test("operator sees All Clinics and clinic detail", async ({ page }) => {
    await page.goto(staffUrl("/operator/clinics"), { waitUntil: "load" });
    await expect(page).toHaveURL(/\/login/);

    await signInAsLocalOperator(page);
    await expect(page).toHaveURL(staffUrl("/operator/clinics"));
    await expect(
      page.getByRole("heading", { name: "All Clinics" })
    ).toBeVisible();
    await expect(
      page.getByText("Platform operator", { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Riverside Dental Demo")).toBeVisible();
    await expect(page.getByText("demodental")).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/operator-clinics-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.getByRole("link", { name: "Riverside Dental Demo" }).click();
    await expect(
      page.getByRole("heading", { name: "Riverside Dental Demo" })
    ).toBeVisible();
    await expect(page.getByText("demodental")).toBeVisible();
    await expect(page.getByText("Tooth Extraction")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", {
        name: "All Clinics",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to all clinics" })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/operator-clinic-detail-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
    await page.getByRole("link", { name: "Back to all clinics" }).click();
    await expect(page).toHaveURL(staffUrl("/operator/clinics"));
  });
});

test.describe("clinic portal UX polish", () => {
  test("guide editor cancel, dirty confirmation, and publish confirmation", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-clean-1440.png",
      fullPage: true,
    });

    await page
      .getByRole("button", { name: "Cancel" })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(staffUrl("/guides"));
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("link", { name: "Edit" }).first().click();
    const introduction = page.getByLabel("Short introduction");
    await introduction.fill(`${await introduction.inputValue()} `);
    await expect(page.locator("[data-save-state=unsaved]")).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-unsaved-1440.png",
      fullPage: true,
    });

    await page
      .getByRole("button", { name: "Cancel" })
      .filter({ visible: true })
      .click();
    const discardDialog = page.getByRole("dialog", {
      name: "Discard unsaved changes?",
    });
    await expect(discardDialog).toBeVisible();
    await expect(
      discardDialog.getByText("Your latest changes haven't been saved.")
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-cancel-dialog-1440.png",
    });
    await discardDialog.getByRole("button", { name: "Keep editing" }).click();
    await expect(discardDialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
    await expect(page.locator("[data-save-state=unsaved]")).toBeVisible();

    await page
      .getByRole("button", { name: "Cancel" })
      .filter({ visible: true })
      .click();
    await page.getByRole("button", { name: "Discard changes" }).click();
    await expect(page).toHaveURL(staffUrl("/guides"));

    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await page
      .getByRole("button", { name: "Publish guide" })
      .filter({ visible: true })
      .click();
    const publishDialog = page.getByRole("dialog", {
      name: "Publish this guide?",
    });
    await expect(publishDialog).toBeVisible();
    await expect(
      publishDialog.getByText(
        "Patients using the public guide will see this version."
      )
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-publish-dialog-1440.png",
    });
    await publishDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(publishDialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
  });

  test("saving a draft marks the editor clean until the next edit", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides/new"), { waitUntil: "load" });
    const slug = `ux-polish-${Date.now()}`;
    await page.getByLabel("Guide title").fill("UX polish draft");
    await page.getByLabel("Public slug").fill(slug);
    await page.getByRole("button", { name: "Create custom guide" }).click();
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await page.getByLabel("Short introduction").fill("Draft only copy.");
    await expect(page.locator("[data-save-state=unsaved]")).toBeVisible();
    await page
      .getByRole("button", { name: "Save draft" })
      .filter({ visible: true })
      .click();
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await expect(
      page.getByText(
        "Draft saved. The public guide is unchanged until you publish."
      )
    ).toBeVisible();
    await page
      .getByLabel("Short introduction")
      .fill("Draft only copy, edited.");
    await expect(page.locator("[data-save-state=unsaved]")).toBeVisible();
  });

  test("portal appearance is a sidebar preference separate from patient theme", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    const appearance = page.locator("aside").getByRole("button", {
      name: /Appearance, colour theme currently/,
    });
    await expect(appearance).toBeVisible();
    await appearance.click();
    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-mode",
      "dark"
    );
    await page.screenshot({
      path: "test-results/artifacts/staff-sidebar-dark-1440.png",
    });

    await page.reload({ waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-mode",
      "dark"
    );

    await page
      .locator("aside")
      .getByRole("button", {
        name: /Appearance, colour theme currently/,
      })
      .click();
    await page.getByRole("radio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-mode",
      "light"
    );
    await page.screenshot({
      path: "test-results/artifacts/staff-sidebar-light-1440.png",
    });

    await page.goto(staffUrl("/practice"), { waitUntil: "load" });
    await expect(page.getByLabel("Default appearance")).toHaveValue("SYSTEM");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Clinic portal menu" }).click();
    await expect(
      page.getByRole("button", { name: /Appearance, colour theme currently/ })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-mobile-nav-appearance-390.png",
    });
  });

  test("practice page has section hierarchy and save-state copy", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/practice"), { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Practice identity" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Branding" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Emergency / urgent help" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Patient presentation" })
    ).toBeVisible();
    await expect(page.locator("[data-save-state=saved]")).toBeVisible();
    await expect(
      page.getByText("Upload logo — coming before launch")
    ).toBeVisible();
    await expect(page.locator('input[type="color"]')).toHaveCount(3);
    await page.getByLabel("Display name").fill("Riverside Dental Demo ");
    await expect(page.locator("[data-save-state=unsaved]")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page
      .getByRole("navigation", { name: "Practice sections" })
      .getByRole("link", { name: "Emergency" })
      .click();
    await expect(
      page
        .getByRole("navigation", { name: "Practice sections" })
        .getByRole("link", { name: "Emergency" })
    ).toHaveAttribute("aria-current", "true");
    await page.screenshot({
      path: "test-results/artifacts/staff-practice-sections-1440.png",
      fullPage: true,
    });
    await page.getByRole("link", { name: "Guides" }).click();
    await expect(
      page.getByRole("dialog", { name: "Discard unsaved changes?" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Discard changes" }).click();
    await expect(page).toHaveURL(staffUrl("/guides"));
  });

  test("never-published drafts can be deleted from More actions", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides/new"), { waitUntil: "load" });
    const slug = `draft-delete-${Date.now()}`;
    await page.getByLabel("Guide title").fill("Temporary draft");
    await page.getByLabel("Public slug").fill(slug);
    await page.getByRole("button", { name: "Create custom guide" }).click();
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
    await page
      .getByRole("button", { name: "Cancel" })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(staffUrl("/guides"));
    const row = page.locator("li").filter({ hasText: "Temporary draft" });
    await expect(row.getByText("Draft", { exact: true })).toBeVisible();
    await row.getByRole("button", { name: "More actions" }).click();
    await row.getByRole("menuitem", { name: "Delete draft" }).click();
    const dialog = page.getByRole("dialog", {
      name: "Delete this draft guide?",
    });
    await expect(dialog).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guides-delete-dialog-1440.png",
    });
    await dialog.getByRole("button", { name: "Delete draft" }).click();
    await expect(page.getByText("Temporary draft")).toHaveCount(0);
  });

  test("timeline accordion opens one stage and live preview follows titles", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Edit" }).first().click();
    const firstStage = page.locator("[data-stage-key]").first();
    const secondStage = page.locator("[data-stage-key]").nth(1);
    await expect(firstStage).toHaveAttribute("data-open", "true");
    await secondStage.getByRole("button").first().click();
    await expect(secondStage).toHaveAttribute("data-open", "true");
    await expect(firstStage).toHaveAttribute("data-open", "false");
    await page.getByRole("button", { name: "Add stage" }).click();
    const newest = page.locator("[data-stage-key]").last();
    await expect(newest).toHaveAttribute("data-open", "true");
    await expect(newest.getByText("New stage")).toBeVisible();
    await expect(page.locator("[data-editor-preview]")).toContainText(
      "New stage"
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-accordion-1440.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-mobile.png",
      fullPage: true,
    });
  });

  test("clinic staff sees the staff role and cannot delete drafts", async ({
    page,
  }) => {
    await signInAsLocalStaff(page);
    await expect(
      page.locator("aside").getByText("Clinic staff", { exact: true })
    ).toBeVisible();
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await expect(
      page.getByRole("button", { name: "More actions" })
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
  });

  test("desktop sidebar stays viewport-fixed while the page scrolls", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(staffUrl("/practice"), { waitUntil: "load" });
    const sidebar = page.locator("aside").first();
    const before = await sidebar.boundingBox();
    await page.locator(".staffPortalMain").evaluate((node) => {
      node.scrollTop = 800;
    });
    const after = await sidebar.boundingBox();
    expect(before?.y).toBeCloseTo(after?.y ?? -1, 0);
    expect(before?.height).toBeGreaterThan(700);
    await page.screenshot({
      path: "test-results/artifacts/staff-practice-fixed-sidebar-1440.png",
      fullPage: true,
    });
  });

  test("public patient guide has no staff preview chrome", async ({ page }) => {
    await page.goto(tenantUrl(DEMO_TENANT_SLUG, "/extraction"), {
      waitUntil: "load",
    });
    await expect(
      page.getByRole("heading", { name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(page.getByText("Draft preview", { exact: true })).toHaveCount(
      0
    );
    await expect(page.getByRole("link", { name: "Back to guide" })).toHaveCount(
      0
    );
    await expect(page.getByRole("link", { name: "Edit guide" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Back to staff" })).toHaveCount(
      0
    );
  });
});
