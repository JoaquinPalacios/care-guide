import { expect, type Locator, type Page } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const main =
      document.querySelector(".staffAppContent") ??
      document.querySelector(".staffAppScroller") ??
      document.querySelector(".staffPortalMain");
    return {
      rootScrollWidth: root.scrollWidth,
      rootClientWidth: root.clientWidth,
      mainScrollWidth: main?.scrollWidth ?? 0,
      mainClientWidth: main?.clientWidth ?? 0,
    };
  });

  expect(metrics.rootScrollWidth).toBeLessThanOrEqual(
    metrics.rootClientWidth + 1
  );
  if (metrics.mainClientWidth > 0) {
    expect(metrics.mainScrollWidth).toBeLessThanOrEqual(
      metrics.mainClientWidth + 1
    );
  }
}

export async function measureHorizontalOverflow(page: Page): Promise<{
  scrollWidth: number;
  clientWidth: number;
}> {
  return page.evaluate(() => {
    const main =
      document.querySelector(".staffAppContent") ??
      document.querySelector(".staffAppScroller") ??
      document.querySelector(".staffPortalMain");
    const root = document.documentElement;
    const target = main ?? root;
    return {
      scrollWidth: target.scrollWidth,
      clientWidth: target.clientWidth,
    };
  });
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
