import { expect, test } from "@playwright/test";

import { expectOneH1 } from "./helpers/assertions";
import { DEMO_TENANT_SLUG, marketingUrl, tenantUrl } from "./helpers/origins";

test.describe("marketing homepage", () => {
  test("presents the product and links to the demo tenant", async ({
    page,
  }) => {
    const response = await page.goto(marketingUrl("/"), { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    expect(page.url()).toBe(marketingUrl("/"));
    expect(page.url()).not.toContain("/_marketing");
    await expectOneH1(page, "Aftercare that still feels like your clinic.");
    await expect(
      page.getByRole("heading", {
        name: "From approved guidance to a page patients keep",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Select guides" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View the clinic demo" }).first()
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/"));
    await expect(
      page.getByRole("heading", { name: "Internal staff workspace" })
    ).toHaveCount(0);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop.png",
      fullPage: true,
    });
  });

  test("captures light and dark marketing screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop-light.png",
      fullPage: true,
    });

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload({ waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop-dark.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload({ waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-mobile-light.png",
      fullPage: true,
    });

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload({ waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-mobile-dark.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload({ waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-1280-light.png",
      fullPage: true,
    });

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload({ waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-1280-dark.png",
      fullPage: true,
    });
  });
});
