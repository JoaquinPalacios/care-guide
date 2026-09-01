import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./helpers/axe";
import { DEMO_TENANT_SLUG, tenantUrl } from "./helpers/origins";

const HOME = tenantUrl(DEMO_TENANT_SLUG, "/");
const EXTRACTION = tenantUrl(DEMO_TENANT_SLUG, "/extraction");

test.describe("patient accessibility", () => {
  test("tenant home has no serious or critical axe violations", async ({
    page,
  }) => {
    await page.goto(HOME, { waitUntil: "load" });
    await expectNoSeriousAxeViolations(page);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(
      page.locator('img[src="/demo/riverside-mark.svg"]')
    ).toHaveAttribute("alt", "");
    await expect(
      page.getByRole("link", { name: "Tooth Extraction" })
    ).toBeVisible();
  });

  test("extraction guide has no serious or critical axe violations", async ({
    page,
  }) => {
    await page.goto(EXTRACTION, { waitUntil: "load" });
    await expectNoSeriousAxeViolations(page);

    const headingTags = await page
      .locator("h1, h2, h3")
      .evaluateAll((nodes) => nodes.map((node) => node.tagName.toLowerCase()));
    expect(headingTags[0]).toBe("h1");
    expect(headingTags.slice(1).every((tag) => tag !== "h1")).toBe(true);
    expect(headingTags).toContain("h2");

    await expect(page.locator("text=Important.")).toHaveCount(1);
    await expect(page.getByText("If you need urgent help")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Call Riverside Dental Demo/ })
    ).toBeVisible();
  });
});
