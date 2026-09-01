import { expect, test } from "@playwright/test";

import {
  expectNoLoginUi,
  expectOneH1,
  expectPublicTenantUrl,
  tabUntil,
} from "./helpers/assertions";
import {
  expectHeadingDoesNotOverflow,
  expectNoHorizontalOverflow,
  expectUsableTapTarget,
} from "./helpers/layout";
import { DEMO_TENANT_SLUG, tenantUrl } from "./helpers/origins";

const HOME = tenantUrl(DEMO_TENANT_SLUG, "/");
const EXTRACTION = tenantUrl(DEMO_TENANT_SLUG, "/extraction");

test.describe("tenant homepage and guide", () => {
  test("renders the branded demodental homepage without login UI", async ({
    page,
  }, testInfo) => {
    testInfo.annotations.push({
      type: "video",
      description: "Phase 1E homepage smoke",
    });
    const response = await page.goto(HOME, { waitUntil: "load" });

    expect(response?.status()).toBe(200);
    await expectPublicTenantUrl(page, HOME);
    await expect(
      page.getByRole("link", { name: "Riverside Dental Demo", exact: true })
    ).toBeVisible();
    await expectOneH1(page, "Aftercare guides");
    await expect(
      page.getByRole("link", { name: "Tooth Extraction" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Call Riverside Dental Demo/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Book an appointment" })
    ).toBeVisible();
    await expect(page.getByText("Powered by Care Guide")).toBeVisible();
    await expect(
      page.getByText("Demo aftercare content — not clinical advice.")
    ).toBeVisible();
    await expectNoLoginUi(page);
    await page.screenshot({
      path: "test-results/artifacts/tenant-home-desktop.png",
      fullPage: true,
    });
  });

  test("follows Tooth Extraction to the composed public guide", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "load" });
    await page.getByRole("link", { name: "Tooth Extraction" }).click();

    await expectPublicTenantUrl(page, EXTRACTION);
    await expectOneH1(page, "Tooth Extraction");
    await expect(
      page.getByText("This sample “Tooth Extraction” guide exists", {
        exact: false,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "The first day at Riverside Dental Demo",
      })
    ).toBeVisible();
    await expect(
      page.getByText("Practice override: Riverside Dental Demo asks patients", {
        exact: false,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Weekend contact (Riverside demo)" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Warning signs (demo)" })
    ).toBeVisible();
    await expect(page.locator("text=Important.")).toHaveCount(1);
    await expect(page.getByText("If you need urgent help")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Call Riverside Dental Demo/ })
    ).toBeVisible();
    await expect(page.getByText("Riverside Dental Demo").first()).toBeVisible();
    await expectNoLoginUi(page);
    await page.screenshot({
      path: "test-results/artifacts/extraction-desktop.png",
      fullPage: true,
    });
  });

  test("keeps native anchors and a sensible keyboard sequence", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "load" });

    const brand = await tabUntil(
      page,
      (href, text) => href === "/" && text.includes("Riverside Dental Demo")
    );
    expect(brand.href).toBe("/");

    const extraction = await tabUntil(
      page,
      (href, text) =>
        href === "/extraction" && text.includes("Tooth Extraction")
    );
    expect(extraction.href).toBe("/extraction");

    await page.keyboard.press("Enter");
    await expectPublicTenantUrl(page, EXTRACTION);
    await expectOneH1(page, "Tooth Extraction");

    await tabUntil(page, (href) => href === "/");
    await tabUntil(page, (href, text) =>
      Boolean(
        href?.startsWith("tel:") && text.includes("Call Riverside Dental Demo")
      )
    );
    await tabUntil(page, (href, text) =>
      Boolean(
        href?.startsWith("https://") && text.includes("Book an appointment")
      )
    );
  });

  test("exposes noindex metadata and a public hostname title", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "load" });
    await expect(page).toHaveTitle("Riverside Dental Demo Aftercare");
    const homeRobots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(homeRobots).toMatch(/noindex/i);
    expect(homeRobots).toMatch(/nofollow/i);

    await page.goto(EXTRACTION, { waitUntil: "load" });
    await expect(page).toHaveTitle("Tooth Extraction · Riverside Dental Demo");
    const guideRobots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(guideRobots).toMatch(/noindex/i);
    const html = await page.content();
    expect(html).not.toContain("/_sites/");
  });
});

test.describe("mobile viewport", () => {
  for (const viewport of [
    { name: "390", width: 390, height: 844 },
    { name: "360", width: 360, height: 800 },
  ] as const) {
    test(`fits the patient pages at ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(HOME, { waitUntil: "load" });
      await expectNoHorizontalOverflow(page);
      await expectHeadingDoesNotOverflow(page.locator("h1"));
      await expectUsableTapTarget(
        page.getByRole("link", { name: "Tooth Extraction" })
      );
      await expectUsableTapTarget(
        page.getByRole("link", { name: /Call Riverside Dental Demo/ })
      );
      if (viewport.width === 390) {
        await page.screenshot({
          path: "test-results/artifacts/tenant-home-mobile.png",
          fullPage: true,
        });
      }

      await page.goto(EXTRACTION, { waitUntil: "load" });
      await expectNoHorizontalOverflow(page);
      await expectHeadingDoesNotOverflow(page.locator("h1"));
      await expectUsableTapTarget(
        page.getByRole("link", { name: /Call Riverside Dental Demo/ })
      );
      await expect(
        page.locator("section").filter({ hasText: "Contact this practice" })
      ).toBeVisible();
      const contactOverflow = await page
        .locator("section")
        .filter({ hasText: "Contact this practice" })
        .evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(contactOverflow).toBeLessThanOrEqual(1);
      if (viewport.width === 390) {
        await page.screenshot({
          path: "test-results/artifacts/extraction-mobile.png",
          fullPage: true,
        });
      }
    });
  }
});
