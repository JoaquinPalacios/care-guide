import { test } from "@playwright/test";

import { expectOneH1 } from "./helpers/assertions";
import { marketingUrl } from "./helpers/origins";

test.use({
  video: { mode: "on", size: { width: 1440, height: 900 } },
  viewport: { width: 1440, height: 900 },
});

test("records full-page marketing scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(marketingUrl("/"), { waitUntil: "load" });
  await expectOneH1(page, "Aftercare that still feels like your clinic.");
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  for (let y = 0; y < height; y += 80) {
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(40);
  }
  await page.mouse.wheel(0, -520);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(400);
});
