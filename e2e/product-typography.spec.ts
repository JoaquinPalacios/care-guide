import { expect, test, type Page } from "@playwright/test";

import { DEMO_TENANT_SLUG, marketingUrl, tenantUrl } from "./helpers/origins";
import { signInAsLocalAdmin } from "./helpers/staff-auth";

async function primaryFontFamily(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).fontFamily);
}

test.describe("product typography", () => {
  test("marketing, staff, patient, and print resolve Geist as the primary family", async ({
    page,
  }) => {
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await expect
      .poll(async () => primaryFontFamily(page, "h1"))
      .toMatch(/geist/i);
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-font-marketing.png",
    });

    await signInAsLocalAdmin(page);
    await expect
      .poll(async () => primaryFontFamily(page, "h1"))
      .toMatch(/geist/i);
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-font-staff.png",
    });

    await page.goto(tenantUrl(DEMO_TENANT_SLUG, "/extraction"), {
      waitUntil: "load",
    });
    await expect
      .poll(async () => primaryFontFamily(page, "h1"))
      .toMatch(/geist/i);
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-font-patient.png",
    });

    await page.goto(tenantUrl(DEMO_TENANT_SLUG, "/extraction/print"), {
      waitUntil: "load",
    });
    await page.emulateMedia({ media: "print" });
    await expect
      .poll(async () => primaryFontFamily(page, "h1"))
      .toMatch(/geist/i);
  });
});
