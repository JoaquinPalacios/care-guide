import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import {
  expectNoHorizontalOverflow,
  relativeLuminance,
} from "./helpers/layout";
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

test.describe("Phase 1F.11 story clarity", () => {
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
      const nodes = [
        ...root.querySelectorAll('[class*="processNode"]'),
      ] as HTMLElement[];
      const cards = [
        ...root.querySelectorAll('[class*="processCard"]'),
      ] as HTMLElement[];
      const labels = [
        ...root.querySelectorAll('[class*="processIndex"]'),
      ] as HTMLElement[];
      const titles = [...root.querySelectorAll("h3")] as HTMLElement[];
      if (!list || !rail || items.length !== 4 || nodes.length !== 4) {
        return null;
      }
      const listStyles = getComputedStyle(list);
      const railBox = rail.getBoundingClientRect();
      const first = items[0].getBoundingClientRect();
      const second = items[1].getBoundingClientRect();
      const firstNode = nodes[0].getBoundingClientRect();
      const lastNode = nodes[3].getBoundingClientRect();
      const cardHeights = cards.map((card) =>
        Math.round(card.getBoundingClientRect().height)
      );
      const labelTops = labels.map((label) =>
        Math.round(label.getBoundingClientRect().top)
      );
      const titleTops = titles.map((title) =>
        Math.round(title.getBoundingClientRect().top)
      );
      const cardCursor = cards[0]
        ? getComputedStyle(cards[0]).cursor
        : "unknown";
      const firstCenter = firstNode.left + firstNode.width / 2;
      const lastCenter = lastNode.left + lastNode.width / 2;
      return {
        columns: listStyles.gridTemplateColumns.split(" ").length,
        horizontal: second.left > first.right - 8,
        railWidth: Math.round(railBox.width),
        railHeight: Math.round(railBox.height),
        firstDelta: Math.round(firstCenter - railBox.left),
        lastDelta: Math.round(lastCenter - railBox.right),
        firstNodeOnRail: Math.abs(firstCenter - railBox.left) <= 10,
        lastNodeOnRail: Math.abs(lastCenter - railBox.right) <= 10,
        nodesOnRailY: nodes.every((node) => {
          const box = node.getBoundingClientRect();
          return (
            Math.abs(
              box.top + box.height / 2 - (railBox.top + railBox.height / 2)
            ) <= 8
          );
        }),
        cardHeightSpread: Math.max(...cardHeights) - Math.min(...cardHeights),
        labelSpread: Math.max(...labelTops) - Math.min(...labelTops),
        titleSpread: Math.max(...titleTops) - Math.min(...titleTops),
        cardCursor,
      };
    });

    expect(desktopLayout).not.toBeNull();
    expect(desktopLayout!.columns).toBe(4);
    expect(desktopLayout!.horizontal).toBe(true);
    expect(desktopLayout!.railWidth).toBeGreaterThan(desktopLayout!.railHeight);
    expect(
      desktopLayout!.firstNodeOnRail,
      `first node delta ${desktopLayout!.firstDelta}px`
    ).toBe(true);
    expect(
      desktopLayout!.lastNodeOnRail,
      `last node delta ${desktopLayout!.lastDelta}px`
    ).toBe(true);
    expect(desktopLayout!.nodesOnRailY).toBe(true);
    expect(desktopLayout!.cardHeightSpread).toBeLessThanOrEqual(2);
    expect(desktopLayout!.labelSpread).toBeLessThanOrEqual(2);
    expect(desktopLayout!.titleSpread).toBeLessThanOrEqual(2);
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

    await section.screenshot({
      path: "test-results/artifacts/phase-1f11-process-1440-light.png",
    });
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-process-1440-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f11-process-1440-dark.png",
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, "#how-it-works");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f11-process-1280-light.png",
    });
    const layout1280 = await section.evaluate((root) => {
      const cards = [
        ...root.querySelectorAll('[class*="processCard"]'),
      ] as HTMLElement[];
      const labels = [
        ...root.querySelectorAll('[class*="processIndex"]'),
      ] as HTMLElement[];
      const titles = [...root.querySelectorAll("h3")] as HTMLElement[];
      const heights = cards.map((card) =>
        Math.round(card.getBoundingClientRect().height)
      );
      const labelTops = labels.map((label) =>
        Math.round(label.getBoundingClientRect().top)
      );
      const titleTops = titles.map((title) =>
        Math.round(title.getBoundingClientRect().top)
      );
      return {
        cardHeightSpread: Math.max(...heights) - Math.min(...heights),
        labelSpread: Math.max(...labelTops) - Math.min(...labelTops),
        titleSpread: Math.max(...titleTops) - Math.min(...titleTops),
      };
    });
    expect(layout1280.cardHeightSpread).toBeLessThanOrEqual(2);
    expect(layout1280.labelSpread).toBeLessThanOrEqual(2);
    expect(layout1280.titleSpread).toBeLessThanOrEqual(2);

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, "#how-it-works");
    await waitForSectionReveal(section);
    const mobileLayout = await section.evaluate((root) => {
      const items = [...root.querySelectorAll("li")];
      const rail = root.querySelector("[data-mk-process-rail]");
      const nodes = [
        ...root.querySelectorAll('[class*="processNode"]'),
      ] as HTMLElement[];
      if (items.length !== 4 || !rail || nodes.length !== 4) {
        return null;
      }
      const first = items[0].getBoundingClientRect();
      const second = items[1].getBoundingClientRect();
      const railBox = rail.getBoundingClientRect();
      const firstNode = nodes[0].getBoundingClientRect();
      const lastNode = nodes[3].getBoundingClientRect();
      return {
        stacked: second.top > first.bottom - 8,
        railHeight: Math.round(railBox.height),
        railWidth: Math.round(railBox.width),
        firstNodeOnRail:
          Math.abs(
            firstNode.left +
              firstNode.width / 2 -
              (railBox.left + railBox.width / 2)
          ) <= 8 &&
          Math.abs(firstNode.top + firstNode.height / 2 - railBox.top) <= 8,
        lastNodeOnRail:
          Math.abs(
            lastNode.left +
              lastNode.width / 2 -
              (railBox.left + railBox.width / 2)
          ) <= 8 && lastNode.top + lastNode.height / 2 <= railBox.bottom + 8,
      };
    });
    expect(mobileLayout).not.toBeNull();
    expect(mobileLayout!.stacked).toBe(true);
    expect(mobileLayout!.railHeight).toBeGreaterThan(mobileLayout!.railWidth);
    expect(mobileLayout!.firstNodeOnRail).toBe(true);
    expect(mobileLayout!.lastNodeOnRail).toBe(true);
    await expectNoHorizontalOverflow(page);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f11-process-390-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f11-process-390-dark.png",
    });
  });

  test("why-clinics uses three benefit pillars and a customisation strip", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);

    const section = page.locator('[aria-labelledby="why-heading"]');
    await scrollSectionIntoView(page, '[aria-labelledby="why-heading"]');
    await waitForSectionReveal(section);
    const cards = section.locator("[data-mk-pillar]");
    await expect(cards).toHaveCount(3);
    await expect(section.locator("[data-mk-bento-card]")).toHaveCount(0);
    await expect(
      section.getByRole("heading", { name: "Looks like your clinic" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Built for patients" })
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Simple to operate" })
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

    const desktopLayout = await section.evaluate((root) => {
      const nodes = [...root.querySelectorAll<HTMLElement>("[data-mk-pillar]")];
      const grid = root.querySelector(
        "[data-mk-pillars] [class*='pillarGrid']"
      );
      if (!grid || nodes.length !== 3) {
        return null;
      }
      const widths = nodes.map((node) =>
        Math.round(node.getBoundingClientRect().width)
      );
      const heights = nodes.map((node) =>
        Math.round(node.getBoundingClientRect().height)
      );
      const cursors = nodes.map((node) => getComputedStyle(node).cursor);
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        widthSpread: Math.max(...widths) - Math.min(...widths),
        heightSpread: Math.max(...heights) - Math.min(...heights),
        pointerCards: cursors.filter((cursor) => cursor === "pointer").length,
      };
    });
    expect(desktopLayout).not.toBeNull();
    expect(desktopLayout!.columns).toBe(3);
    expect(desktopLayout!.widthSpread).toBeLessThanOrEqual(4);
    expect(desktopLayout!.pointerCards).toBe(0);

    const stripLayout = await section.evaluate((root) => {
      const strip = root.querySelector("[data-mk-custom-strip]");
      if (!(strip instanceof HTMLElement)) {
        return null;
      }
      const columns = getComputedStyle(strip).gridTemplateColumns.split(" ");
      const groups = [...strip.children] as HTMLElement[];
      if (groups.length !== 4) {
        return null;
      }
      const widths = groups.map((node) =>
        Math.round(node.getBoundingClientRect().width)
      );
      const centers = groups.map((node) => {
        const box = node.getBoundingClientRect();
        const stripBox = strip.getBoundingClientRect();
        return Math.abs(
          box.top + box.height / 2 - (stripBox.top + stripBox.height / 2)
        );
      });
      return {
        columns: columns.length,
        introWidest: widths[0] > widths[1] && widths[0] > widths[2],
        usesStrip: strip.getBoundingClientRect().width > 900,
        verticalBalance: Math.max(...centers) <= 12,
      };
    });
    expect(stripLayout).not.toBeNull();
    expect(stripLayout!.columns).toBe(4);
    expect(stripLayout!.introWidest).toBe(true);
    expect(stripLayout!.usesStrip).toBe(true);
    expect(stripLayout!.verticalBalance).toBe(true);
    await expect(section.getByText("Brand", { exact: true })).toBeVisible();
    await expect(section.getByText("Corners", { exact: true })).toBeVisible();
    await expect(
      section.getByText("Appearance", { exact: true })
    ).toBeVisible();

    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-pillars-1440-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-pillars-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, '[aria-labelledby="why-heading"]');
    await waitForSectionReveal(section);
    const mobileLayout = await section.evaluate((root) => {
      const grid = root.querySelector("[class*='pillarGrid']");
      const nodes = [...root.querySelectorAll<HTMLElement>("[data-mk-pillar]")];
      if (!grid || nodes.length !== 3) {
        return null;
      }
      const first = nodes[0].getBoundingClientRect();
      const second = nodes[1].getBoundingClientRect();
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        stacked: second.top > first.bottom - 8,
      };
    });
    expect(mobileLayout).not.toBeNull();
    expect(mobileLayout!.columns).toBe(1);
    expect(mobileLayout!.stacked).toBe(true);
    await expectNoHorizontalOverflow(page);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-pillars-390-light.png",
    });

    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-pillars-390-dark.png",
    });
  });

  test("problem and product stay editorial with a product equation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);

    const problem = page.locator('[aria-labelledby="problem-heading"]');
    await scrollSectionIntoView(page, '[aria-labelledby="problem-heading"]');
    await waitForSectionReveal(problem);
    await expect(
      problem.getByRole("heading", {
        name: "Patients leave with instructions. They don't always leave with clarity.",
      })
    ).toBeVisible();
    await expect(problem.getByText("01")).toBeVisible();
    await expect(problem.getByText("02")).toBeVisible();
    await expect(problem.getByText("03")).toBeVisible();
    await expect(problem.locator("ol li")).toHaveCount(3);
    await expect(
      problem.getByText("Verbal advice is easy to forget")
    ).toBeVisible();
    await expect(problem.getByText("PDFs are awkward to reopen")).toBeVisible();
    await expect(
      problem.getByText("Generic handouts weaken the clinic")
    ).toBeVisible();

    const product = page.locator('[aria-labelledby="product-heading"]');
    await expect(
      product.getByRole("heading", {
        name: "A branded patient aftercare page that stays available.",
      })
    ).toBeVisible();
    await expect(product.getByText("Approved guide")).toBeVisible();
    await expect(product.getByText("Clinic brand")).toBeVisible();
    await expect(product.locator("[data-mk-product-canvas]")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(
      product.locator("[data-mk-product-canvas]").getByText("Riverside Dental")
    ).toHaveCount(2);
    await expect(
      product.locator("[data-mk-product-canvas]").getByText("Tooth Extraction")
    ).toBeVisible();
    await expect(
      product.getByRole("link", { name: "Tooth Extraction" })
    ).toHaveCount(0);

    const problemLayout = await problem.evaluate((root) => {
      const eyebrow = root.querySelector('[class*="eyebrow"]');
      const heading = root.querySelector("h2");
      const firstItem = root.querySelector("ol li");
      if (!eyebrow || !heading || !firstItem) {
        return null;
      }
      const eyebrowBox = eyebrow.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const itemBox = firstItem.getBoundingClientRect();
      return {
        headingBelowEyebrow: headingBox.top > eyebrowBox.bottom - 2,
        itemAlignsWithHeading: Math.abs(itemBox.top - headingBox.top) <= 12,
        itemNotWithEyebrow: itemBox.top > eyebrowBox.bottom + 8,
      };
    });
    expect(problemLayout).not.toBeNull();
    expect(problemLayout!.headingBelowEyebrow).toBe(true);
    expect(problemLayout!.itemAlignsWithHeading).toBe(true);
    expect(problemLayout!.itemNotWithEyebrow).toBe(true);

    await page.screenshot({
      path: "test-results/artifacts/phase-1f12-problem-product-1440-light.png",
    });
    await showStaticScheme(page, "dark");
    await page.screenshot({
      path: "test-results/artifacts/phase-1f12-problem-product-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, '[aria-labelledby="problem-heading"]');
    await waitForSectionReveal(problem);
    const mobileProblem = await problem.evaluate((root) => {
      const heading = root.querySelector("h2");
      const firstItem = root.querySelector("ol li");
      if (!heading || !firstItem) {
        return null;
      }
      return (
        firstItem.getBoundingClientRect().top >
        heading.getBoundingClientRect().bottom - 4
      );
    });
    expect(mobileProblem).toBe(true);
    await expectNoHorizontalOverflow(page);
    await problem.screenshot({
      path: "test-results/artifacts/phase-1f12-problem-390-light.png",
    });
    await product.screenshot({
      path: "test-results/artifacts/phase-1f12-product-390-light.png",
    });
    await showStaticScheme(page, "dark");
    await problem.screenshot({
      path: "test-results/artifacts/phase-1f12-problem-390-dark.png",
    });
    await product.screenshot({
      path: "test-results/artifacts/phase-1f12-product-390-dark.png",
    });
  });

  test("light closing stays light and dark closing stays dark", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);
    await scrollSectionIntoView(page, "#early-access");

    const lightClosing = await page.evaluate(() => {
      const closing = document.querySelector('[data-mk-chapter="closing"]');
      const footer = document.querySelector("footer");
      if (
        !(closing instanceof HTMLElement) ||
        !(footer instanceof HTMLElement)
      ) {
        return null;
      }
      const closingBg = getComputedStyle(closing).backgroundColor;
      const footerBg = getComputedStyle(footer).backgroundColor;
      const heading = closing.querySelector("h2");
      const hairline = getComputedStyle(closing, "::before");
      const closingGlow = getComputedStyle(closing, "::after");
      const footerGlow = getComputedStyle(footer, "::after");
      return {
        closingBg,
        footerBg,
        headingColor: heading ? getComputedStyle(heading).color : "",
        hasBlend: Boolean(document.querySelector('[class*="blendTo"]')),
        chapterWash: document.querySelector("[data-chapter]") !== null,
        hasFooterWave: Boolean(footer.querySelector(".mkWave")),
        hairlineHeight: hairline.height,
        hairlineImage: hairline.backgroundImage,
        closingGlowImage: closingGlow.backgroundImage,
        footerGlowImage: footerGlow.backgroundImage,
        closingGlowBottom: closingGlow.bottom,
        footerGlowBottom: footerGlow.bottom,
      };
    });
    expect(lightClosing).not.toBeNull();
    expect(relativeLuminance(lightClosing!.closingBg)).toBeGreaterThan(0.7);
    expect(relativeLuminance(lightClosing!.footerBg)).toBeGreaterThan(0.7);
    expect(relativeLuminance(lightClosing!.headingColor)).toBeLessThan(0.35);
    expect(lightClosing!.hasBlend).toBe(false);
    expect(lightClosing!.chapterWash).toBe(false);
    expect(lightClosing!.hasFooterWave).toBe(false);
    expect(lightClosing!.hairlineHeight).toBe("1px");
    expect(lightClosing!.hairlineImage).toMatch(/linear-gradient/i);
    expect(lightClosing!.closingGlowImage).toMatch(/radial-gradient/i);
    expect(lightClosing!.footerGlowImage).toMatch(/radial-gradient/i);
    expect(lightClosing!.closingGlowBottom).toBe("0px");
    expect(lightClosing!.footerGlowBottom).toBe("0px");
    await page.screenshot({
      path: "test-results/artifacts/phase-1f12-closing-1440-light.png",
    });

    await showStaticScheme(page, "dark");
    const darkClosing = await page.evaluate(() => {
      const closing = document.querySelector('[data-mk-chapter="closing"]');
      const footer = document.querySelector("footer");
      if (
        !(closing instanceof HTMLElement) ||
        !(footer instanceof HTMLElement)
      ) {
        return null;
      }
      const heading = closing.querySelector("h2");
      return {
        closingBg: getComputedStyle(closing).backgroundColor,
        footerBg: getComputedStyle(footer).backgroundColor,
        headingColor: heading ? getComputedStyle(heading).color : "",
      };
    });
    expect(darkClosing).not.toBeNull();
    expect(relativeLuminance(darkClosing!.closingBg)).toBeLessThan(0.18);
    expect(relativeLuminance(darkClosing!.footerBg)).toBeLessThan(0.18);
    expect(relativeLuminance(darkClosing!.headingColor)).toBeGreaterThan(0.7);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f12-closing-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, "#early-access");
    await expectNoHorizontalOverflow(page);
    await page.locator("#early-access").screenshot({
      path: "test-results/artifacts/phase-1f12-closing-390-light.png",
    });
    await showStaticScheme(page, "dark");
    await page.locator("footer").screenshot({
      path: "test-results/artifacts/phase-1f12-closing-390-dark.png",
    });
  });

  test("nav links use a centre-out underline and buttons do not lift", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);

    const howItWorks = page
      .getByRole("navigation", { name: "Marketing" })
      .getByRole("link", { name: "How it works" });
    const underline = await howItWorks.evaluate((element) => {
      const after = getComputedStyle(element, "::after");
      const origin = after.transformOrigin.split(" ");
      const box = element.getBoundingClientRect();
      return {
        content: after.content,
        transform: after.transform,
        originX: Number.parseFloat(origin[0] ?? ""),
        originCentered:
          Math.abs(Number.parseFloat(origin[0] ?? "") - box.width / 2) <= 2,
        decoration: getComputedStyle(element).textDecorationLine,
      };
    });
    expect(underline.content).not.toBe("none");
    expect(underline.decoration === "none" || underline.decoration === "").toBe(
      true
    );
    expect(underline.originCentered).toBe(true);

    await howItWorks.hover();
    await expect
      .poll(async () =>
        howItWorks.evaluate(
          (element) => getComputedStyle(element, "::after").transform
        )
      )
      .toMatch(/matrix\(1,\s*0,\s*0,\s*1|none/);

    const hoverColors = await howItWorks.evaluate((element) => {
      const styles = getComputedStyle(element);
      const after = getComputedStyle(element, "::after");
      return {
        color: styles.color,
        underline: after.backgroundColor,
      };
    });
    expect(hoverColors.underline).toBe(hoverColors.color);

    const footerLink = page
      .getByRole("navigation", { name: "Footer" })
      .getByRole("link", { name: "Early access" });
    await footerLink.scrollIntoViewIfNeeded();
    const footerAfter = await footerLink.evaluate((element) => {
      const after = getComputedStyle(element, "::after");
      const originX = Number.parseFloat(after.transformOrigin);
      const width = element.getBoundingClientRect().width;
      return {
        centered: Math.abs(originX - width / 2) <= 2,
        underline: after.backgroundColor,
        color: getComputedStyle(element).color,
      };
    });
    expect(footerAfter.centered).toBe(true);
    expect(footerAfter.underline).toBe(footerAfter.color);

    const primary = page
      .getByRole("link", { name: "View the clinic demo" })
      .first();
    await primary.hover();
    const primaryTransform = await primary.evaluate(
      (element) => getComputedStyle(element).transform
    );
    expect(
      primaryTransform === "none" ||
        primaryTransform === "matrix(1, 0, 0, 1, 0, 0)"
    ).toBe(true);
    const secondary = page.getByRole("link", { name: "See how it works" });
    await secondary.hover();
    const secondaryTransform = await secondary.evaluate(
      (element) => getComputedStyle(element).transform
    );
    expect(
      secondaryTransform === "none" ||
        secondaryTransform === "matrix(1, 0, 0, 1, 0, 0)"
    ).toBe(true);
  });

  test("clinic preview uses a patient-home panel instead of loose copy", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showStaticScheme(page, "light");
    await waitForHeroReveal(page);

    const section = page.locator("#preview");
    await scrollSectionIntoView(page, "#preview");
    await waitForSectionReveal(section);
    await expect(
      section.getByRole("heading", {
        name: "See a branded aftercare home, not a staff console",
      })
    ).toBeVisible();
    await expect(
      section.getByRole("link", { name: "Open Riverside Dental Demo" })
    ).toBeVisible();
    await expect(section.getByText("Patient view")).toBeVisible();
    await expect(section.locator("[data-mk-patient-preview]")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    await expect(
      section.getByText("no login, no feed", { exact: false })
    ).toBeVisible();
    await expect(section.getByText("Not a login. Not a feed.")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Brand directions" })
    ).toHaveCount(0);
    await expect(page.getByText("Brand directions")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Riverside Dental Demo" })
    ).toBeVisible();
    await expect(
      section.getByRole("link", { name: "Tooth Extraction" })
    ).toHaveCount(0);
    await expect(
      section.getByRole("link", { name: "Call the practice" })
    ).toHaveCount(0);

    const desktopLayout = await section.evaluate((root) => {
      const preview = root.querySelector("[data-mk-patient-preview]");
      const caption = root.querySelector('[class*="previewCaption"]');
      const copy = root.querySelector('[class*="previewCopy"]');
      if (
        !(preview instanceof HTMLElement) ||
        !(caption instanceof HTMLElement) ||
        !(copy instanceof HTMLElement)
      ) {
        return null;
      }
      const previewBox = preview.getBoundingClientRect();
      const captionBox = caption.getBoundingClientRect();
      const copyBox = copy.getBoundingClientRect();
      return {
        previewRightOfCopy: previewBox.left > copyBox.right - 24,
        captionBelowPreview: captionBox.top > previewBox.bottom - 8,
        phoneCount: root.querySelectorAll('[class*="phoneShell"]').length,
      };
    });
    expect(desktopLayout).not.toBeNull();
    expect(desktopLayout!.previewRightOfCopy).toBe(true);
    expect(desktopLayout!.captionBelowPreview).toBe(true);
    expect(desktopLayout!.phoneCount).toBe(0);

    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-preview-1440-light.png",
    });
    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-preview-1440-dark.png",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showStaticScheme(page, "light");
    await scrollSectionIntoView(page, "#preview");
    await waitForSectionReveal(section);
    await expectNoHorizontalOverflow(page);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-preview-390-light.png",
    });
    await showStaticScheme(page, "dark");
    await waitForSectionReveal(section);
    await section.screenshot({
      path: "test-results/artifacts/phase-1f12-preview-390-dark.png",
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
    await page.locator('[data-mk-chapter="hero"]').screenshot({
      path: "test-results/artifacts/phase-1f12-hero-1440-light.png",
    });
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
