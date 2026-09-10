import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { expectNoHorizontalOverflow } from "./helpers/layout";
import { DEMO_TENANT_SLUG, staffUrl, tenantUrl } from "./helpers/origins";
import { signInAsLocalAdmin } from "./helpers/staff-auth";

test.describe("clinic portal", () => {
  test("unauthenticated dashboard and guides redirect to login", async ({
    page,
  }) => {
    for (const pathname of ["/dashboard", "/guides"] as const) {
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
      "Riverside Dental Demo"
    );
    await expect(page.getByText("Tooth Extraction")).toBeVisible();
    await expect(page.getByText("/extraction")).toBeVisible();
    await expect(page.getByText("Published")).toBeVisible();
    await expect(page.getByText("Wisdom Teeth")).toHaveCount(0);
    await expect(page.getByText("Root Canal")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add guide" })).toHaveCount(
      0
    );
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
});
