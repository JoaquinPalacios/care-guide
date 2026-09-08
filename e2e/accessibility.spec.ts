import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import {
  DEMO_TENANT_SLUG,
  HARBOR_TENANT_SLUG,
  marketingUrl,
  tenantUrl,
} from "./helpers/origins";

const HOME = tenantUrl(DEMO_TENANT_SLUG, "/");
const EXTRACTION = tenantUrl(DEMO_TENANT_SLUG, "/extraction");
const HARBOR_HOME = tenantUrl(HARBOR_TENANT_SLUG, "/");

test.describe("patient accessibility", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`tenant home has no serious axe violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(HOME, { waitUntil: "load" });
      await expectNoSeriousAxeViolations(page);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: /Change colour theme/ })
      ).toBeVisible();
      await expect(page.getByRole("radio", { name: "System" })).toHaveCount(0);
    });
  }

  for (const colorScheme of ["light", "dark"] as const) {
    test(`extraction timeline has no serious axe violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(EXTRACTION, { waitUntil: "load" });
      await expectNoSeriousAxeViolations(page);
      await expect(page.getByText("First few hours")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Recovery guide" })
      ).toBeVisible();
    });
  }

  test("harbor tenant does not expose a patient theme control", async ({
    page,
  }) => {
    await page.goto(HARBOR_HOME, { waitUntil: "load" });
    await expectNoSeriousAxeViolations(page);
    await expect(
      page.getByRole("button", { name: /Change colour theme/ })
    ).toHaveCount(0);
  });
});

test.describe("marketing accessibility", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`root homepage has no serious axe violations in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(marketingUrl("/"), { waitUntil: "load" });
      await expect(
        page.getByRole("heading", {
          name: "Aftercare that still feels like your clinic.",
        })
      ).toBeVisible();
      await expectNoSeriousAxeViolations(page, {
        exclude: "[data-mk-pending]",
      });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: /Change colour theme/ })
      ).toBeVisible();

      await page.setViewportSize({ width: 390, height: 844 });
      await expectNoSeriousAxeViolations(page, {
        exclude: "[data-mk-pending]",
      });
    });
  }
});
