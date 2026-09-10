import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { expectOneH1 } from "./helpers/assertions";
import { marketingUrl } from "./helpers/origins";

test.use({
  video: { mode: "on", size: { width: 1440, height: 900 } },
  viewport: { width: 1440, height: 900 },
});

test.afterEach(async ({ context }, testInfo) => {
  await context.close();
  const recorded = join(testInfo.outputDir, "video.webm");
  if (existsSync(recorded)) {
    mkdirSync("test-results/artifacts", { recursive: true });
    copyFileSync(recorded, "test-results/artifacts/homepage-scroll-1440.webm");
  }
});

test("records full-page marketing scroll", async ({ page }) => {
  mkdirSync("test-results/artifacts", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(marketingUrl("/"), { waitUntil: "load" });
  await expectOneH1(page, "Aftercare that still feels like your clinic.");
  await expect
    .poll(async () =>
      page
        .locator("h1")
        .evaluate((element) => getComputedStyle(element).opacity)
    )
    .toBe("1");
  await page.waitForTimeout(400);
  const height = await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    return document.documentElement.scrollHeight;
  });
  for (let y = 0; y < height; y += 80) {
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(90);
  }
  await page.mouse.wheel(0, -520);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(400);

  const hiddenAfterReturn = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>(".mkReveal")].filter(
        (node) => getComputedStyle(node).opacity === "0"
      ).length
  );
  expect(hiddenAfterReturn).toBe(0);
});
