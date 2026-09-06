import { expect, test } from "@playwright/test";

import { expectOneH1 } from "./helpers/assertions";
import { DEMO_TENANT_SLUG, marketingUrl, tenantUrl } from "./helpers/origins";

test.describe("marketing homepage", () => {
  test("presents the product and links to the demo tenant", async ({
    page,
  }) => {
    const response = await page.goto(marketingUrl("/"), { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    expect(page.url()).toBe(marketingUrl("/"));
    expect(page.url()).not.toContain("/_marketing");
    await expectOneH1(
      page,
      "Post-operative instructions patients can actually follow"
    );
    await expect(
      page.getByRole("heading", {
        name: "From the chair to a page patients keep",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Select procedures" })
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
});
