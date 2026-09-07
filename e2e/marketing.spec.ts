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

      await page.screenshot({
        path: `test-results/artifacts/phase-1f6-hero-${shot.width}-${shot.scheme}.png`,
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
      path: "test-results/artifacts/phase-1f6-hero-360-light.png",
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload({ waitUntil: "load" });
    await waitForHeroReveal(page);
    const composition = await page.evaluate(() => {
      const heading = document.getElementById("marketing-hero");
      const section = heading?.closest("section");
      const inner = section?.querySelector('[class*="inner"]');
      const titleBlock = section?.querySelector('[class*="heroTitleBlock"]');
      const eyebrow = section?.querySelector('[class*="heroEyebrow"]');
      const support = section?.querySelector('[class*="heroSupport"]');
      const stage = section?.querySelector('[class*="deviceStage"]');
      const wave = document.querySelector(".mkWave");
      if (!heading || !inner || !titleBlock || !eyebrow || !support || !stage) {
        return null;
      }

      const headingBox = heading.getBoundingClientRect();
      const innerBox = inner.getBoundingClientRect();
      const eyebrowBox = eyebrow.getBoundingClientRect();
      const supportBox = support.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
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
        separatorInView: Boolean(
          waveBox && waveBox.top < window.innerHeight && waveBox.bottom > 0
        ),
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
  });
});
