import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { expectNoHorizontalOverflow } from "./helpers/layout";
import { marketingUrl } from "./helpers/origins";

async function waitForPhoneFrame(page: Page): Promise<void> {
  const frame = page.locator('[class*="phoneFrame"]');
  await expect(frame).toHaveCount(1);
  await expect
    .poll(async () =>
      frame.evaluate((element) => {
        return (
          element instanceof HTMLImageElement &&
          element.complete &&
          element.naturalWidth > 0
        );
      })
    )
    .toBe(true);
}

async function waitForHeroReveal(page: Page): Promise<void> {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        if (
          document.documentElement.getAttribute("data-mk-motion") !== "enhance"
        ) {
          return true;
        }

        const reveals = [
          ...document.querySelectorAll<HTMLElement>(
            '[data-mk-chapter="hero"] .mkReveal'
          ),
        ];
        return (
          reveals.length > 0 &&
          reveals.every((element) => getComputedStyle(element).opacity === "1")
        );
      })
    )
    .toBe(true);
  await waitForPhoneFrame(page);
}

async function showMarketingScheme(
  page: Page,
  scheme: "light" | "dark"
): Promise<void> {
  await page.emulateMedia({ colorScheme: scheme });
  await page.evaluate((mode) => {
    try {
      window.localStorage.setItem("aftercare-guide-marketing-theme", mode);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    document.documentElement.setAttribute("data-theme-mode", mode);
  }, scheme);
}

async function showStaticScheme(
  page: Page,
  scheme: "light" | "dark"
): Promise<void> {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.evaluate((mode) => {
    try {
      window.localStorage.setItem("aftercare-guide-marketing-theme", mode);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.documentElement.setAttribute("data-mk-motion", "reduce");
  }, scheme);
}

async function scrollSectionIntoView(
  page: Page,
  selector: string
): Promise<void> {
  await page.evaluate((target) => {
    document.querySelector(target)?.scrollIntoView({
      block: "start",
      behavior: "instant",
    });
  }, selector);
  await expect
    .poll(async () => {
      const box = await page
        .locator(selector)
        .locator("h2, h3")
        .first()
        .boundingBox();
      return box?.y ?? -1;
    })
    .toBeGreaterThan(48);
}

async function waitForSectionReveal(root: Locator): Promise<void> {
  await expect
    .poll(async () =>
      root.evaluate((element) => {
        if (
          document.documentElement.getAttribute("data-mk-motion") !== "enhance"
        ) {
          return true;
        }
        const reveals = [...element.querySelectorAll<HTMLElement>(".mkReveal")];
        return (
          reveals.length > 0 &&
          reveals.every((node) => getComputedStyle(node).opacity === "1")
        );
      })
    )
    .toBe(true);
}

async function openThemeMenu(page: Page) {
  const trigger = page.getByRole("button", { name: /Change colour theme/ });
  await trigger.click();
  const menu = page.getByRole("menu", { name: "Colour theme" });
  await expect(menu).toBeVisible();
  return { trigger, menu };
}

test.describe("Phase 1F.10 premium storytelling", () => {
  test("theme popover is compact, anchored, and labelled in light and dark", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);

    const { trigger, menu } = await openThemeMenu(page);
    await expect(
      page.getByRole("menuitemradio", { name: "System" })
    ).toHaveAttribute("aria-checked", "true");

    const lightMetrics = await page.evaluate(() => {
      const button = document.querySelector<HTMLElement>(".mtcBtn");
      const popover = document.querySelector<HTMLElement>(".mtcMenu");
      const selected = popover?.querySelector<HTMLElement>(
        '[aria-checked="true"]'
      );
      if (!button || !popover || !selected) {
        return null;
      }
      const triggerBox = button.getBoundingClientRect();
      const menuBox = popover.getBoundingClientRect();
      const selectedBg = getComputedStyle(selected).backgroundColor;
      return {
        width: Math.round(menuBox.width),
        height: Math.round(menuBox.height),
        rowHeight: Math.round(selected.getBoundingClientRect().height),
        gap: Math.round(menuBox.top - triggerBox.bottom),
        rightDelta: Math.round(Math.abs(menuBox.right - triggerBox.right)),
        radius: getComputedStyle(popover).borderRadius,
        selectedBg,
        insideViewport:
          menuBox.left >= 0 && menuBox.right <= window.innerWidth + 1,
      };
    });

    expect(lightMetrics).not.toBeNull();
    expect(lightMetrics!.width).toBeGreaterThanOrEqual(152);
    expect(lightMetrics!.width).toBeLessThanOrEqual(176);
    expect(lightMetrics!.rowHeight).toBeGreaterThanOrEqual(36);
    expect(lightMetrics!.rowHeight).toBeLessThanOrEqual(42);
    expect(lightMetrics!.gap).toBeGreaterThanOrEqual(4);
    expect(lightMetrics!.gap).toBeLessThanOrEqual(18);
    expect(lightMetrics!.rightDelta).toBeLessThanOrEqual(12);
    expect(lightMetrics!.insideViewport).toBe(true);
    expect(lightMetrics!.selectedBg).not.toMatch(/rgb\(\s*0,\s*0,\s*0/);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-theme-popover-1440-light.png",
    });

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    await showMarketingScheme(page, "dark");
    await trigger.click();
    await expect(
      page.getByRole("menu", { name: "Colour theme" })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-theme-popover-1440-dark.png",
    });

    await page.locator("body").click({ position: { x: 24, y: 240 } });
    await expect(page.getByRole("menu", { name: "Colour theme" })).toHaveCount(
      0
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await showMarketingScheme(page, "light");
    await trigger.click();
    const mobileMenu = page.getByRole("menu", { name: "Colour theme" });
    await expect(mobileMenu).toBeVisible();
    const mobileBox = await mobileMenu.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.x).toBeGreaterThanOrEqual(0);
    expect(mobileBox!.x + mobileBox!.width).toBeLessThanOrEqual(391);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-theme-popover-390-light.png",
    });
  });

  test("how-it-works is a connected semantic journey on desktop and mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);

    const section = page.locator("#how-it-works");
    await scrollSectionIntoView(page, "#how-it-works");
    await waitForSectionReveal(section);
    const steps = section.getByRole("listitem");
    await expect(steps).toHaveCount(4);
    await expect(section.locator("ol")).toHaveCount(1);
    await expect(
      section.getByRole("heading", { name: "Select guides" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Apply clinic brand" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Share a durable link" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Patient revisits anytime" })
    ).toBeVisible();
    await expect(section.getByText("Step 1")).toBeVisible();
    await expect(section.locator("[data-mk-process-rail]")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(section.getByRole("progressbar")).toHaveCount(0);
    await expect(section.getByRole("tab")).toHaveCount(0);

    const desktopLayout = await section.evaluate((root) => {
      const list = root.querySelector("ol");
      const items = [...root.querySelectorAll("li")];
      const rail = root.querySelector("[data-mk-process-rail]");
      const cards = [
        ...root.querySelectorAll(
          '[data-mk-process-card] [class*="processCard"]'
        ),
      ];
      if (!list || !rail || items.length !== 4) {
        return null;
      }
      const listStyles = getComputedStyle(list);
      const railBox = rail.getBoundingClientRect();
      const first = items[0].getBoundingClientRect();
      const second = items[1].getBoundingClientRect();
      const cardCursor = cards[0]
        ? getComputedStyle(cards[0]).cursor
        : "unknown";
      return {
        columns: listStyles.gridTemplateColumns.split(" ").length,
        horizontal: second.left > first.right - 8,
        railWidth: Math.round(railBox.width),
        railHeight: Math.round(railBox.height),
        cardCursor,
      };
    });

    expect(desktopLayout).not.toBeNull();
    expect(desktopLayout!.columns).toBe(4);
    expect(desktopLayout!.horizontal).toBe(true);
    expect(desktopLayout!.railWidth).toBeGreaterThan(desktopLayout!.railHeight);
    expect(desktopLayout!.cardCursor).not.toBe("pointer");

    const firstCard = section.locator("[data-mk-process-card]").first();
    const restTransform = await firstCard.evaluate(
      (element) => getComputedStyle(element).transform
    );
    await firstCard.hover();
    const hoverTransform = await firstCard.evaluate(
      (element) => getComputedStyle(element).transform
    );
    expect(hoverTransform).toBe(restTransform);

    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-process-1440-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-process-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, "#how-it-works");
    await waitForSectionReveal(section);
    const mobileLayout = await section.evaluate((root) => {
      const items = [...root.querySelectorAll("li")];
      const rail = root.querySelector("[data-mk-process-rail]");
      if (items.length !== 4 || !rail) {
        return null;
      }
      const first = items[0].getBoundingClientRect();
      const second = items[1].getBoundingClientRect();
      const railBox = rail.getBoundingClientRect();
      return {
        stacked: second.top > first.bottom - 8,
        railHeight: Math.round(railBox.height),
        railWidth: Math.round(railBox.width),
      };
    });
    expect(mobileLayout).not.toBeNull();
    expect(mobileLayout!.stacked).toBe(true);
    expect(mobileLayout!.railHeight).toBeGreaterThan(mobileLayout!.railWidth);
    await expectNoHorizontalOverflow(page);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f10-process-390-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f10-process-390-dark.png",
    });
  });

  test("why-clinics uses an asymmetric bento with product-native previews", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);

    const section = page.locator('[aria-labelledby="why-heading"]');
    await scrollSectionIntoView(page, '[aria-labelledby="why-heading"]');
    await waitForSectionReveal(section);
    const cards = section.locator("[data-mk-bento-card]");
    await expect(cards).toHaveCount(6);
    await expect(
      section.getByRole("heading", { name: "Clinic-first presence" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Controlled customisation" })
    ).toBeVisible();
    await expect(
      section.getByText("Riverside Dental", { exact: true })
    ).toBeVisible();
    await expect(
      section.getByText("riverside.[your-domain]/extraction")
    ).toBeVisible();
    await expect(section.getByText("Call the practice →")).toBeVisible();
    await expect(section.getByText("Dental Implant")).toBeVisible();
    await expect(section.getByText("Root Canal")).toBeVisible();
    await expect(
      section.getByRole("link", { name: "Tooth Extraction" })
    ).toHaveCount(0);
    await expect(
      section.getByRole("heading", { name: "Tooth Extraction" })
    ).toHaveCount(0);

    const desktopSpans = await section.evaluate((root) => {
      const nodes = [
        ...root.querySelectorAll<HTMLElement>("[data-mk-bento-card]"),
      ];
      const unique = new Set(
        nodes.map((node) => Math.round(node.getBoundingClientRect().width))
      );
      const cursors = nodes.map((node) => getComputedStyle(node).cursor);
      const columns = getComputedStyle(
        root.querySelector("[data-mk-bento]") as HTMLElement
      ).gridTemplateColumns.split(" ").length;
      return {
        uniqueWidths: unique.size,
        columns,
        pointerCards: cursors.filter((cursor) => cursor === "pointer").length,
      };
    });
    expect(desktopSpans.columns).toBe(6);
    expect(desktopSpans.uniqueWidths).toBeGreaterThanOrEqual(3);
    expect(desktopSpans.pointerCards).toBe(0);

    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-bento-1440-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f10-bento-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, '[aria-labelledby="why-heading"]');
    await waitForSectionReveal(section);
    const mobileSpans = await section.evaluate((root) => {
      const grid = root.querySelector("[data-mk-bento]");
      const nodes = [
        ...root.querySelectorAll<HTMLElement>("[data-mk-bento-card]"),
      ];
      if (!grid) {
        return null;
      }
      const widths = nodes.map((node) =>
        Math.round(node.getBoundingClientRect().width)
      );
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        minWidth: Math.min(...widths),
        maxWidth: Math.max(...widths),
      };
    });
    expect(mobileSpans).not.toBeNull();
    expect(mobileSpans!.columns).toBeLessThanOrEqual(2);
    expect(mobileSpans!.minWidth).toBeGreaterThan(140);
    await expectNoHorizontalOverflow(page);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f10-bento-390-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f10-bento-390-dark.png",
    });
  });

  test("keeps the approved hero composition unchanged", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);

    const rhythm = await page.evaluate(() => {
      const heading = document.getElementById("marketing-hero");
      const section = heading?.closest("section");
      const header = document.querySelector("header");
      const eyebrow = section?.querySelector('[class*="heroEyebrow"]');
      const lower = section?.querySelector('[class*="heroLower"]');
      const phone = section?.querySelector('[class*="phoneShell"]');
      const wave = document.querySelector(".mkWave");
      if (!heading || !section || !header || !eyebrow || !lower || !phone) {
        return null;
      }
      const headerBox = header.getBoundingClientRect();
      const eyebrowBox = eyebrow.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const lowerBox = lower.getBoundingClientRect();
      const phoneBox = phone.getBoundingClientRect();
      const waveBox = wave?.getBoundingClientRect();
      return {
        navbarToEyebrow: Math.round(eyebrowBox.top - headerBox.bottom),
        eyebrowToHeading: Math.round(headingBox.top - eyebrowBox.bottom),
        headingToLower: Math.round(lowerBox.top - headingBox.bottom),
        phoneWidth: Math.round(phoneBox.width),
        separatorFlush: Boolean(
          waveBox &&
          Math.abs(waveBox.bottom - section.getBoundingClientRect().bottom) <= 2
        ),
      };
    });

    expect(rhythm).not.toBeNull();
    expect(rhythm!.navbarToEyebrow).toBeGreaterThanOrEqual(72);
    expect(rhythm!.navbarToEyebrow).toBeLessThanOrEqual(110);
    expect(rhythm!.eyebrowToHeading).toBeGreaterThanOrEqual(18);
    expect(rhythm!.eyebrowToHeading).toBeLessThanOrEqual(36);
    expect(rhythm!.headingToLower).toBeGreaterThanOrEqual(52);
    expect(rhythm!.headingToLower).toBeLessThanOrEqual(96);
    expect(rhythm!.phoneWidth).toBeGreaterThanOrEqual(220);
    expect(rhythm!.phoneWidth).toBeLessThanOrEqual(320);
    expect(rhythm!.separatorFlush).toBe(true);
    await expect(
      page.getByRole("heading", {
        name: "Aftercare that still feels like your clinic.",
      })
    ).toBeVisible();
    await expect(page.getByText("Aftercare platform").first()).toBeVisible();
  });

  test("marketing storytelling remains accessible in light and dark", async ({
    page,
  }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(marketingUrl("/"), { waitUntil: "load" });
      await showMarketingScheme(page, scheme);
      await waitForHeroReveal(page);
      await page.locator("#how-it-works").scrollIntoViewIfNeeded();
      await expectNoSeriousAxeViolations(page, {
        exclude: "[data-mk-pending]",
      });
      await page.getByRole("button", { name: /Change colour theme/ }).click();
      await expect(
        page.getByRole("menu", { name: "Colour theme" })
      ).toBeVisible();
      await expectNoSeriousAxeViolations(page, {
        exclude: "[data-mk-pending]",
      });
      await page.keyboard.press("Escape");
    }
  });
});
