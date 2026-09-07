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

export function relativeLuminance(rgb: string): number {
  const match = rgb.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!match) {
    return -1;
  }

  const [red, green, blue] = match.slice(1).map((value) => Number(value) / 255);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
