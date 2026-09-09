import { test } from "@playwright/test";

import { expectOneH1, expectPublicTenantUrl } from "./helpers/assertions";
import { DEMO_TENANT_SLUG, marketingUrl, tenantUrl } from "./helpers/origins";

const HOME = tenantUrl(DEMO_TENANT_SLUG, "/");
const EXTRACTION = tenantUrl(DEMO_TENANT_SLUG, "/extraction");

test.use({
  video: { mode: "on", size: { width: 390, height: 844 } },
  viewport: { width: 390, height: 844 },
});

test("records homepage to extraction navigation", async ({ page }) => {
  await page.goto(HOME, { waitUntil: "load" });
  await page.getByRole("link", { name: "Tooth Extraction" }).click();
  await expectPublicTenantUrl(page, EXTRACTION);
  await expectOneH1(page, "Tooth Extraction");
});

test("records marketing scroll choreography", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(marketingUrl("/"), { waitUntil: "load" });
  await expectOneH1(page, "Aftercare that still feels like your clinic.");
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  for (let y = 0; y < height; y += 70) {
    await page.mouse.wheel(0, 70);
    await page.waitForTimeout(35);
  }
});
