import { test } from "@playwright/test";

import { expectOneH1, expectPublicTenantUrl } from "./helpers/assertions";
import { DEMO_TENANT_SLUG, tenantUrl } from "./helpers/origins";

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
