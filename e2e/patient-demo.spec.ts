import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import {
  expectNoLoginUi,
  expectOneH1,
  expectPublicTenantUrl,
} from "./helpers/assertions";
import { DEMO_TENANT_SLUG, tenantUrl } from "./helpers/origins";

const HOME = tenantUrl(DEMO_TENANT_SLUG, "/");
const EXTRACTION = tenantUrl(DEMO_TENANT_SLUG, "/extraction");
const PRINT = tenantUrl(DEMO_TENANT_SLUG, "/extraction/print");

test.describe("interactive recovery demo", () => {
  test("homepage still leads into the Tooth Extraction demo", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "load" });
    await expectOneH1(page, "Riverside Dental Demo");
    await page.getByRole("link", { name: "Tooth Extraction" }).click();
    await expectPublicTenantUrl(page, EXTRACTION);
    await expect(page.getByRole("tab", { name: "Today" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(
      page.getByRole("tabpanel", { name: "Today" }).getByText("Day 1 of 7")
    ).toBeVisible();
  });

  test("Today, Timeline, Check-in, and Print stay keyboard accessible", async ({
    page,
  }) => {
    await page.goto(EXTRACTION, { waitUntil: "load" });

    const today = page.getByRole("tab", { name: "Today" });
    await today.focus();
    await expect(today).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Timeline" })).toBeFocused();
    await expect(
      page.getByRole("heading", { name: "Recovery overview" })
    ).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Check-in" })).toBeFocused();
    await expect(
      page.getByRole("heading", { name: "How are you feeling today?" })
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: "Good" })).toBeVisible();

    await page.getByRole("link", { name: "Print / Care Plan" }).click();
    await expectPublicTenantUrl(page, PRINT);
    await expect(page.getByText("SAMPLE / NOT CLINICAL ADVICE")).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
  });

  test("check-in stays local, is not persisted, and clears on refresh", async ({
    page,
  }) => {
    const networkWrites: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
        networkWrites.push(`${method} ${request.url()}`);
      }
    });

    await page.goto(EXTRACTION, { waitUntil: "load" });
    await page.getByRole("tab", { name: "Check-in" }).click();
    await page.getByRole("radio", { name: "Good" }).check();
    await page
      .getByLabel("Anything you'd like your clinic to know?")
      .fill("Demo note that must not be saved.");
    await page.getByRole("button", { name: "Save demo response" }).click();
    await expect(
      page.getByText("This demo response stays on this page only")
    ).toBeVisible();

    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));
    expect(
      [...storage.local, ...storage.session].some((key) =>
        /check-?in|feeling|demo-note/i.test(key)
      )
    ).toBe(false);
    expect(networkWrites).toEqual([]);

    await page.reload({ waitUntil: "load" });
    await page.getByRole("tab", { name: "Check-in" }).click();
    await expect(page.getByRole("radio", { name: "Good" })).not.toBeChecked();
    await expect(
      page.getByLabel("Anything you'd like your clinic to know?")
    ).toHaveValue("");
  });

  test("print view uses the resolved guide and hides interactive chrome", async ({
    page,
  }) => {
    await page.goto(PRINT, { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(page.getByText("First few hours")).toBeVisible();
    await expect(page.getByText("Leave the site undisturbed")).toBeVisible();
    await expect(page.getByText("Weekend contact")).toBeVisible();
    await expect(page.getByText("SAMPLE / NOT CLINICAL ADVICE")).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Change colour theme/ })
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "How are you feeling today?" })
    ).toHaveCount(0);
    await expectNoLoginUi(page);
    const html = await page.content();
    expect(html).not.toMatch(/date of birth|dateOfBirth/i);
    expect(html).not.toMatch(/\bPIN\b/);
    expect(html).not.toContain("patient name");

    await page.emulateMedia({ media: "print" });
    await expect(
      page.getByRole("button", { name: "Print / Save as PDF" })
    ).toBeHidden();
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`demo views have no serious axe violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(EXTRACTION, { waitUntil: "load" });
      await expectNoSeriousAxeViolations(page);
      await page.getByRole("tab", { name: "Timeline" }).click();
      await expectNoSeriousAxeViolations(page);
      await page.getByRole("tab", { name: "Check-in" }).click();
      await expectNoSeriousAxeViolations(page);
      await page.goto(PRINT, { waitUntil: "load" });
      await expectNoSeriousAxeViolations(page);
    });
  }

  test("captures prospect-ready demo screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(EXTRACTION, { waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/demo-today-desktop-light.png",
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Timeline" }).click();
    await page.screenshot({
      path: "test-results/artifacts/demo-timeline-desktop-light.png",
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Check-in" }).click();
    await page.screenshot({
      path: "test-results/artifacts/demo-checkin-desktop-light.png",
      fullPage: true,
    });

    await page.emulateMedia({ colorScheme: "dark" });
    await page.getByRole("tab", { name: "Today" }).click();
    await page.screenshot({
      path: "test-results/artifacts/demo-today-desktop-dark.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(EXTRACTION, { waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/demo-today-mobile-light.png",
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Timeline" }).click();
    await page.screenshot({
      path: "test-results/artifacts/demo-timeline-mobile-light.png",
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Check-in" }).click();
    await page.screenshot({
      path: "test-results/artifacts/demo-checkin-mobile-light.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PRINT, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.screenshot({
      path: "test-results/artifacts/demo-print-preview.png",
      fullPage: true,
    });
  });
});
