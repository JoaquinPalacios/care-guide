import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { expectGenericNotFound, expectOneH1 } from "./helpers/assertions";
import { expectNoHorizontalOverflow } from "./helpers/layout";
import { measurePageAssets, expectNoTailwind } from "./helpers/assets";
import {
  DEMO_TENANT_SLUG,
  marketingUrl,
  staffUrl,
  tenantUrl,
} from "./helpers/origins";

async function showMarketingScheme(
  page: import("@playwright/test").Page,
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

test.describe("marketing conversion routes", () => {
  test("pricing and contact resolve on the platform host", async ({ page }) => {
    const pricing = await page.goto(marketingUrl("/pricing"), {
      waitUntil: "load",
    });
    expect(pricing?.status()).toBe(200);
    expect(page.url()).toBe(marketingUrl("/pricing"));
    expect(page.url()).not.toContain("/_marketing");
    await expectOneH1(page, "Simple plans for clinic-branded aftercare.");
    await expect(page.getByText("A$79")).toBeVisible();
    await expect(page.getByText("A$149")).toBeVisible();
    await expect(page.getByText("Custom pricing")).toBeVisible();
    await expect(page.getByText("Recommended")).toBeVisible();
    await expect(page.getByText("Coming after launch")).toBeVisible();
    await page.locator("#later-heading").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("listitem", { name: "Patient check-ins" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Request a demo" }).first()
    ).toHaveAttribute("href", "/contact");
    await expect(page.locator("form")).toHaveCount(0);

    const contact = await page.goto(marketingUrl("/contact"), {
      waitUntil: "load",
    });
    expect(contact?.status()).toBe(200);
    expect(page.url()).toBe(marketingUrl("/contact"));
    await expectOneH1(
      page,
      "Bring your aftercare online without losing your clinic's identity."
    );
    await expect(
      page.getByRole("link", { name: "View the clinic demo" })
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/"));
    await expect(
      page.getByRole("link", { name: "See pricing" })
    ).toHaveAttribute("href", "/pricing");
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByText("Thanks, we received")).toHaveCount(0);

    const robots = await page.goto(marketingUrl("/robots.txt"), {
      waitUntil: "domcontentloaded",
    });
    expect(robots?.status()).toBe(200);
    const robotsBody = await robots?.text();
    expect(robotsBody).toContain("Allow: /pricing");
    expect(robotsBody).toContain("Disallow: /_marketing");
    expect(robotsBody).toContain("Disallow: /_sites");

    const sitemap = await page.goto(marketingUrl("/sitemap.xml"), {
      waitUntil: "domcontentloaded",
    });
    expect(sitemap?.status()).toBe(200);
    const sitemapBody = await sitemap?.text();
    expect(sitemapBody).toContain("/pricing");
    expect(sitemapBody).toContain("/contact");
    expect(sitemapBody).not.toContain("/_marketing");
    expect(sitemapBody).not.toContain("/_sites");
  });

  test("desktop nav includes pricing, contact, staff, and theme", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    const headerNav = page.getByRole("navigation", { name: "Marketing" });
    const footerNav = page.getByRole("navigation", { name: "Footer" });

    await expect(
      headerNav.getByRole("link", { name: "How it works" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Clinic preview" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Pricing" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Contact" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Staff sign in" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Change colour theme/ })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /site menu/i })).toBeHidden();

    await expect(
      footerNav.getByRole("link", { name: "Pricing" })
    ).toBeVisible();
    await expect(
      footerNav.getByRole("link", { name: "Contact" })
    ).toBeVisible();
    await expect(
      footerNav.getByRole("link", { name: "Staff sign in" })
    ).toBeVisible();
    await expect(
      footerNav.getByRole("link", { name: "Early access" })
    ).toHaveCount(0);
  });

  test("mobile menu exposes real pricing and contact routes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    const headerNav = page.getByRole("navigation", { name: "Marketing" });

    await expect(
      headerNav.getByRole("link", { name: "Aftercare Guide" })
    ).toHaveCount(0);
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Aftercare Guide" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Staff sign in" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Change colour theme/ })
    ).toBeVisible();
    await expect(headerNav.getByRole("link", { name: "Pricing" })).toHaveCount(
      0
    );

    const menu = page.getByRole("button", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(
      headerNav.getByRole("link", { name: "Pricing" })
    ).toBeVisible();
    await expect(
      headerNav.getByRole("link", { name: "Contact" })
    ).toBeVisible();

    await headerNav.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(marketingUrl("/pricing"));
    await expectOneH1(page, "Simple plans for clinic-branded aftercare.");

    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(marketingUrl("/contact"), { waitUntil: "load" });
    const contactMenu = page.getByRole("button", { name: "Site menu" });
    await contactMenu.click();
    await expect(
      page.getByRole("link", { name: "Contact", exact: true }).first()
    ).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(contactMenu).toHaveAttribute("aria-expanded", "false");
    await expectNoHorizontalOverflow(page);
  });

  test("homepage conversion CTAs resolve", async ({ page }) => {
    await page.goto(marketingUrl("/"), { waitUntil: "load" });
    await expect(
      page.getByRole("link", { name: "View the clinic demo" }).first()
    ).toHaveAttribute("href", tenantUrl(DEMO_TENANT_SLUG, "/"));
    await expect(
      page.getByRole("link", { name: "See how it works" })
    ).toHaveAttribute("href", "#how-it-works");
    await expect(
      page.getByRole("link", { name: "Request a demo" }).first()
    ).toHaveAttribute("href", "/contact");

    await page.getByRole("link", { name: "Request a demo" }).first().click();
    await expect(page).toHaveURL(marketingUrl("/contact"));
    await page.getByRole("link", { name: "See pricing" }).click();
    await expect(page).toHaveURL(marketingUrl("/pricing"));
    await page.getByRole("link", { name: "Request a demo" }).first().click();
    await expect(page).toHaveURL(marketingUrl("/contact"));
  });

  test("tenant and staff hosts do not serve platform sales pages", async ({
    page,
  }) => {
    for (const pathname of ["/pricing", "/contact"] as const) {
      const tenant = await page.goto(tenantUrl(DEMO_TENANT_SLUG, pathname), {
        waitUntil: "domcontentloaded",
      });
      expect(tenant?.status(), `tenant ${pathname}`).toBe(404);
      await expectGenericNotFound(page);
      await expect(page.getByText("A$79")).toHaveCount(0);
      await expect(page.getByText("Request a demo")).toHaveCount(0);

      const staff = await page.goto(staffUrl(pathname), {
        waitUntil: "domcontentloaded",
      });
      expect(staff?.status(), `staff ${pathname}`).toBe(404);
      await expect(
        page.getByRole("heading", { name: "Internal staff workspace" })
      ).toHaveCount(0);
    }

    const appHome = await page.goto(staffUrl("/"), { waitUntil: "load" });
    expect(appHome?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Internal staff workspace" })
    ).toBeVisible();
  });

  test("metadata titles match the public routes", async ({ page }) => {
    await page.goto(marketingUrl("/"), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(
      /Aftercare Guide — Branded patient aftercare/
    );

    await page.goto(marketingUrl("/pricing"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveTitle(/Pricing — Aftercare Guide/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /A\$79/
    );

    await page.goto(marketingUrl("/contact"), {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveTitle(/Contact — Aftercare Guide/);
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`pricing and contact have no serious axe violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({
        colorScheme,
        reducedMotion: "reduce",
      });
      for (const pathname of ["/", "/pricing", "/contact"] as const) {
        await page.goto(marketingUrl(pathname), { waitUntil: "load" });
        await showMarketingScheme(page, colorScheme);
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-mk-motion", "reduce");
        });
        await expect(page.locator("h1")).toHaveCount(1);
        await expectNoSeriousAxeViolations(page, {
          exclude: ["[data-mk-pending]", "[data-mk-pending] *"],
        });
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(marketingUrl("/pricing"), { waitUntil: "load" });
      await showMarketingScheme(page, colorScheme);
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-mk-motion", "reduce");
      });
      await expectNoSeriousAxeViolations(page, {
        exclude: ["[data-mk-pending]", "[data-mk-pending] *"],
      });
    });
  }

  test("pricing and contact stay server-first without Tailwind", async ({
    page,
  }, testInfo) => {
    const pricing = await measurePageAssets(page, marketingUrl("/pricing"));
    const contact = await measurePageAssets(page, marketingUrl("/contact"));
    expectNoTailwind(pricing.css);
    expectNoTailwind(contact.css);

    testInfo.attach("marketing-conversion-performance.json", {
      contentType: "application/json",
      body: JSON.stringify(
        {
          pricing: {
            cssRaw: pricing.css.reduce((sum, asset) => sum + asset.raw, 0),
            jsRaw: pricing.js.reduce((sum, asset) => sum + asset.raw, 0),
            jsUrls: pricing.js.map((asset) => asset.url),
          },
          contact: {
            cssRaw: contact.css.reduce((sum, asset) => sum + asset.raw, 0),
            jsRaw: contact.js.reduce((sum, asset) => sum + asset.raw, 0),
            jsUrls: contact.js.map((asset) => asset.url),
          },
        },
        null,
        2
      ),
    });
  });
});
