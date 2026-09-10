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
  });

  test("guides lists real clinic guides with working preview links", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.getByRole("link", { name: "Guides" }).click();
    await expect(page).toHaveURL(staffUrl("/guides"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "My guides"
    );
    await expect(
      page.getByText("Tooth Extraction", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("/extraction")).toBeVisible();
    await expect(page.getByText("Published")).toBeVisible();
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
    await expect(
      page.getByRole("button", { name: "Save practice settings" })
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

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(staffUrl("/guides/new"), { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Create guide" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Start from a template" })
    ).toBeVisible();
    await expect(page.getByText("Tooth Extraction")).toBeVisible();
    await expect(page.getByText("Wisdom Teeth")).toHaveCount(0);
    await page.screenshot({
      path: "test-results/artifacts/staff-create-guide-1440.png",
      fullPage: true,
    });

    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(
      page.getByRole("button", { name: "Save draft" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Publish guide" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add stage" })).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);

    await page.setViewportSize({ width: 768, height: 1024 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/staff-guide-editor-tablet.png",
      fullPage: true,
    });

    await page.getByRole("link", { name: "Preview draft" }).click();
    await expect(page).toHaveURL(/\/guides\/.+\/preview/);
    await expect(page.getByText("Draft preview — not public")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tooth Extraction" })
    ).toBeVisible();
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
    await page.screenshot({
      path: "test-results/artifacts/operator-clinic-detail-1440.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });
});
