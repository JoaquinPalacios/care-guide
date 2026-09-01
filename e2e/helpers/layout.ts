import { expect, type Locator, type Page } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
    };
  });

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

export async function expectUsableTapTarget(locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, "tap target should be visible").not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
}

export async function expectHeadingDoesNotOverflow(
  locator: Locator
): Promise<void> {
  const overflow = await locator.evaluate((element) => {
    return element.scrollWidth - element.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}
