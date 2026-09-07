import { expect, test, type Page } from "@playwright/test";

import { expectOneH1 } from "./helpers/assertions";
import {
  expectNoHorizontalOverflow,
  relativeLuminance,
} from "./helpers/layout";
import { DEMO_TENANT_SLUG, marketingUrl, tenantUrl } from "./helpers/origins";

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

test.describe("marketing homepage", () => {
  test("presents the product and links to the demo tenant", async ({
    page,
  }) => {
    const response = await page.goto(marketingUrl("/"), { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    expect(page.url()).toBe(marketingUrl("/"));
    expect(page.url()).not.toContain("/_marketing");
    await expectOneH1(page, "Aftercare that still feels like your clinic.");
    await expect(page.getByText("Aftercare platform").first()).toBeVisible();
    await expect(
      page
        .getByRole("contentinfo")
        .getByText("Aftercare Guide", { exact: true })
    ).toBeVisible();
    await page
      .getByRole("heading", {
        name: "From approved guidance to a page patients keep",
      })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", {
        name: "From approved guidance to a page patients keep",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Select guides" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View the clinic demo" }).first()
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/"));
    await expect(
      page.getByRole("heading", { name: "Internal staff workspace" })
    ).toHaveCount(0);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop.png",
      fullPage: true,
    });
  });

  test("captures light and dark marketing screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop-light.png",
      fullPage: true,
    });

    await showMarketingScheme(page, "dark");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-desktop-dark.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-mobile-light.png",
      fullPage: true,
    });

    await showMarketingScheme(page, "dark");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-mobile-dark.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-1280-light.png",
      fullPage: true,
    });

    await showMarketingScheme(page, "dark");
    await waitForHeroReveal(page);
    await page.screenshot({
      path: "test-results/artifacts/marketing-home-1280-dark.png",
      fullPage: true,
    });
  });

  test("composes a centered premium hero with a single phone product proof", async ({
    page,
  }) => {
    const shots = [
      { width: 1440, height: 900, scheme: "light" },
      { width: 1440, height: 900, scheme: "dark" },
      { width: 1280, height: 800, scheme: "light" },
      { width: 1280, height: 800, scheme: "dark" },
      { width: 390, height: 844, scheme: "light" },
      { width: 390, height: 844, scheme: "dark" },
    ] as const;

    for (const shot of shots) {
      await page.setViewportSize({ width: shot.width, height: shot.height });
      await page.goto(marketingUrl("/"), { waitUntil: "load" });
      await showMarketingScheme(page, shot.scheme);
      await waitForHeroReveal(page);

      const hero = page.locator('[data-mk-chapter="hero"]');
      const colors = await hero.evaluate((element) => {
        const styles = getComputedStyle(element);
        const canvas =
          styles.backgroundColor === "rgba(0, 0, 0, 0)" ||
          styles.backgroundColor === "transparent"
            ? getComputedStyle(document.body).backgroundColor
            : styles.backgroundColor;
        return { color: styles.color, background: canvas };
      });
      const ink = relativeLuminance(colors.color);
      const canvas = relativeLuminance(colors.background);

      if (shot.scheme === "light") {
        expect(ink, `${shot.scheme} hero ink`).toBeLessThan(0.35);
        expect(canvas, `${shot.scheme} hero canvas`).toBeGreaterThan(0.85);
      } else {
        expect(ink, `${shot.scheme} hero ink`).toBeGreaterThan(0.7);
        expect(canvas, `${shot.scheme} hero canvas`).toBeLessThan(0.15);
      }

      await expect(hero.locator('[class*="deviceStage"]')).toHaveAttribute(
        "aria-hidden",
        "true"
      );
      await expect(hero.locator('[class*="desktopPreview"]')).toHaveCount(0);
      await expect(
        hero.locator('[class*="deviceStage"]').getByText("Recovery guide")
      ).toBeVisible();
      await expect(
        hero.locator('[class*="deviceStage"]').getByText("Tooth Extraction")
      ).toBeVisible();
      await expect(
        hero.locator('[class*="deviceStage"]').getByText("Healing check")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Tooth Extraction" })
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Tooth Extraction" })
      ).toHaveCount(0);

      const primary = page
        .getByRole("link", { name: "View the clinic demo" })
        .first();
      const primaryBg = await primary.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      );
      expect(primaryBg).not.toMatch(/rgb\(\s*15\s*,\s*118\s*,\s*110/);

      if (shot.width === 1440 && shot.scheme === "light") {
        const desktopRhythm = await page.evaluate(() => {
          const heading = document.getElementById("marketing-hero");
          const section = heading?.closest("section");
          const header = document.querySelector("header");
          const eyebrow = section?.querySelector('[class*="heroEyebrow"]');
          const lower = section?.querySelector('[class*="heroLower"]');
          const phone = section?.querySelector('[class*="phoneShell"]');
          if (!heading || !section || !header || !eyebrow || !lower || !phone) {
            return null;
          }
          const headerBox = header.getBoundingClientRect();
          const eyebrowBox = eyebrow.getBoundingClientRect();
          const headingBox = heading.getBoundingClientRect();
          const lowerBox = lower.getBoundingClientRect();
          const sectionBox = section.getBoundingClientRect();
          const phoneBox = phone.getBoundingClientRect();
          return {
            navbarToEyebrow: Math.round(eyebrowBox.top - headerBox.bottom),
            eyebrowToHeading: Math.round(headingBox.top - eyebrowBox.bottom),
            headingToLower: Math.round(lowerBox.top - headingBox.bottom),
            heroHeight: Math.round(sectionBox.height),
            heroBottom: Math.round(sectionBox.bottom),
            viewport: window.innerHeight,
            phoneWidth: Math.round(phoneBox.width),
          };
        });

        expect(desktopRhythm).not.toBeNull();
        expect(desktopRhythm!.navbarToEyebrow).toBeGreaterThanOrEqual(72);
        expect(desktopRhythm!.navbarToEyebrow).toBeLessThanOrEqual(110);
        expect(desktopRhythm!.eyebrowToHeading).toBeGreaterThanOrEqual(18);
        expect(desktopRhythm!.eyebrowToHeading).toBeLessThanOrEqual(36);
        expect(desktopRhythm!.headingToLower).toBeGreaterThanOrEqual(60);
        expect(desktopRhythm!.headingToLower).toBeLessThanOrEqual(96);
        expect(desktopRhythm!.heroHeight).toBeGreaterThanOrEqual(720);
        expect(desktopRhythm!.heroHeight).toBeLessThanOrEqual(840);
        expect(desktopRhythm!.heroBottom).toBeLessThanOrEqual(
          desktopRhythm!.viewport
        );
        expect(desktopRhythm!.phoneWidth).toBeGreaterThanOrEqual(280);
        expect(desktopRhythm!.phoneWidth).toBeLessThanOrEqual(320);
      }

      await page.screenshot({
        path: `test-results/artifacts/phase-1f7-hero-${shot.width}-${shot.scheme}.png`,
      });
      await expectNoHorizontalOverflow(page);
    }

    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload({ waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f7-hero-360-light.png",
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload({ waitUntil: "load" });
    await waitForHeroReveal(page);
    const composition = await page.evaluate(() => {
      const heading = document.getElementById("marketing-hero");
      const section = heading?.closest("section");
      const header = document.querySelector("header");
      const inner = section?.querySelector('[class*="inner"]');
      const titleBlock = section?.querySelector('[class*="heroTitleBlock"]');
      const eyebrow = section?.querySelector('[class*="heroEyebrow"]');
      const support = section?.querySelector('[class*="heroSupport"]');
      const lower = section?.querySelector('[class*="heroLower"]');
      const stage = section?.querySelector('[class*="deviceStage"]');
      const phone = section?.querySelector('[class*="phoneShell"]');
      const wave = document.querySelector(".mkWave");
      if (
        !heading ||
        !section ||
        !header ||
        !inner ||
        !titleBlock ||
        !eyebrow ||
        !support ||
        !lower ||
        !stage ||
        !phone
      ) {
        return null;
      }

      const headingBox = heading.getBoundingClientRect();
      const sectionBox = section.getBoundingClientRect();
      const headerBox = header.getBoundingClientRect();
      const innerBox = inner.getBoundingClientRect();
      const eyebrowBox = eyebrow.getBoundingClientRect();
      const supportBox = support.getBoundingClientRect();
      const lowerBox = lower.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
      const phoneBox = phone.getBoundingClientRect();
      const innerCenter = innerBox.left + innerBox.width / 2;
      const waveBox = wave?.getBoundingClientRect();
      return {
        headingCentered:
          Math.abs(headingBox.left + headingBox.width / 2 - innerCenter) < 24,
        eyebrowCentered:
          Math.abs(eyebrowBox.left + eyebrowBox.width / 2 - innerCenter) < 24,
        stacked: stageBox.top - supportBox.bottom > 24,
        stageOnRight: stageBox.left > supportBox.right - 8,
        hasGradientStroke: Boolean(wave?.querySelector("linearGradient")),
        hasGlow: Boolean(wave?.querySelector("feGaussianBlur")),
        navbarToEyebrow: Math.round(eyebrowBox.top - headerBox.bottom),
        eyebrowToHeading: Math.round(headingBox.top - eyebrowBox.bottom),
        headingToLower: Math.round(lowerBox.top - headingBox.bottom),
        heroHeight: Math.round(sectionBox.height),
        heroBottom: Math.round(sectionBox.bottom),
        waveBottom: waveBox ? Math.round(waveBox.bottom) : 0,
        separatorFlush: Boolean(
          waveBox && Math.abs(waveBox.bottom - sectionBox.bottom) <= 2
        ),
        separatorInView: Boolean(
          waveBox && waveBox.top < window.innerHeight && waveBox.bottom > 0
        ),
        clipsViewport: sectionBox.bottom > window.innerHeight + 1,
        phoneWidth: Math.round(phoneBox.width),
      };
    });

    expect(composition).not.toBeNull();
    expect(composition!.headingCentered).toBe(true);
    expect(composition!.eyebrowCentered).toBe(true);
    expect(composition!.stacked).toBe(false);
    expect(composition!.stageOnRight).toBe(true);
    expect(composition!.hasGradientStroke).toBe(true);
    expect(composition!.hasGlow).toBe(true);
    expect(composition!.separatorInView).toBe(true);
    expect(composition!.separatorFlush).toBe(true);
    expect(composition!.clipsViewport).toBe(false);
    expect(composition!.navbarToEyebrow).toBeGreaterThanOrEqual(64);
    expect(composition!.eyebrowToHeading).toBeGreaterThanOrEqual(16);
    expect(composition!.headingToLower).toBeGreaterThanOrEqual(48);
    expect(composition!.phoneWidth).toBeGreaterThanOrEqual(260);
    expect(composition!.phoneWidth).toBeLessThanOrEqual(320);
  });

  test("reveals sections on scroll without breaking anchors or overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await page.screenshot({
      path: "test-results/artifacts/marketing-hero-static-light.png",
    });

    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", {
        name: "From approved guidance to a page patients keep",
      })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/marketing-mid-scroll-light.png",
    });

    await page.locator("#preview").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", {
        name: "See a branded aftercare home, not a staff console",
      })
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/artifacts/marketing-showcase-light.png",
    });

    await page.getByRole("link", { name: "Early access" }).first().click();
    await expect(page).toHaveURL(/#early-access$/);
    await expect(
      page.getByRole("heading", {
        name: "Talk to us about a design-partner clinic",
      })
    ).toBeVisible();

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
      );
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps marketing copy readable when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await expectOneH1(page, "Aftercare that still feels like your clinic.");
    await expect(page.getByText("Aftercare platform").first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "From approved guidance to a page patients keep",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "One product, many practice identities",
      })
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "data-mk-motion",
      "reduce"
    );

    const trigger = page.getByRole("button", { name: /Change colour theme/ });
    await trigger.click();
    await page.getByRole("menuitemradio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-mode",
      "dark"
    );

    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.reload({ waitUntil: "load" });
    const primary = page
      .getByRole("link", { name: "View the clinic demo" })
      .first();
    await primary.hover();
    const reducedHover = await primary.evaluate(
      (element) => getComputedStyle(element).transform
    );
    expect(reducedHover).toBe("none");
  });

  test("marketing CTAs, nav, and theme control expose hover, focus, and active states", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await showMarketingScheme(page, "light");
    await waitForHeroReveal(page);

    const primary = page
      .getByRole("link", { name: "View the clinic demo" })
      .first();
    const secondary = page
      .getByRole("link", { name: "See how it works" })
      .first();
    const theme = page.getByRole("button", { name: /Change colour theme/ });
    const howItWorks = page
      .getByRole("navigation", { name: "Marketing" })
      .getByRole("link", { name: "How it works" });

    const restPrimary = await primary.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow,
        background: styles.backgroundColor,
      };
    });

    await primary.hover();
    const hoverPrimary = await primary.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow,
        background: styles.backgroundColor,
      };
    });
    expect(hoverPrimary.transform).not.toBe("none");
    expect(hoverPrimary.boxShadow).not.toBe(restPrimary.boxShadow);
    expect(hoverPrimary.background).not.toBe(restPrimary.background);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f7-primary-hover.png",
    });

    await secondary.hover();
    const hoverSecondary = await secondary.evaluate(
      (element) => getComputedStyle(element).transform
    );
    expect(hoverSecondary).not.toBe("none");
    await page.screenshot({
      path: "test-results/artifacts/phase-1f7-secondary-hover.png",
    });

    const navRestColor = await howItWorks.evaluate(
      (element) => getComputedStyle(element).color
    );
    await howItWorks.hover();
    await expect
      .poll(async () =>
        howItWorks.evaluate((element) => getComputedStyle(element).color)
      )
      .not.toBe(navRestColor);

    const focusedNames: string[] = [];
    await page.locator("body").click({ position: { x: 8, y: 8 } });
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement)) {
          return "";
        }
        return (
          active.getAttribute("aria-label") ||
          active.textContent?.trim().slice(0, 48) ||
          active.tagName
        );
      });
      if (label) {
        focusedNames.push(label);
      }
      const focusedControl = await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active instanceof HTMLAnchorElement ||
          active instanceof HTMLButtonElement
        );
      });
      if (focusedControl) {
        const outline = await page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) {
            return 0;
          }
          return Number.parseFloat(getComputedStyle(active).outlineWidth);
        });
        expect(outline, `focus outline for ${label}`).toBeGreaterThanOrEqual(2);
      }
    }

    expect(focusedNames.join(" ")).toMatch(/How it works/);
    expect(focusedNames.join(" ")).toMatch(/View the clinic demo/);
    expect(focusedNames.join(" ")).toMatch(/See how it works|Change colour/);

    await primary.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const primaryFocus = await primary.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        outlineWidth: Number.parseFloat(styles.outlineWidth),
        outlineStyle: styles.outlineStyle,
        isActive: document.activeElement === element,
      };
    });
    expect(primaryFocus.isActive).toBe(true);
    expect(primaryFocus.outlineStyle).not.toBe("none");
    expect(primaryFocus.outlineWidth).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f7-primary-focus.png",
    });

    await theme.focus();
    const themeFocus = await theme.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth)
    );
    expect(themeFocus).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      path: "test-results/artifacts/phase-1f7-theme-focus.png",
    });
  });
});
