import { expect, test } from "@playwright/test";

import { setPortalColorScheme } from "./helpers/axe";
import { staffUrl } from "./helpers/origins";
import { signInAsLocalAdmin } from "./helpers/staff-auth";

test.describe("authenticated patient preview theme", () => {
  test("defaults to Follow portal and keeps Clinic default as an explicit choice", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Preview" }).first().click();
    await expect(page).toHaveURL(/\/guides\/.+\/preview/);

    const appearance = page.getByLabel("Patient preview appearance");
    const patient = page.locator(".aftercareTheme");
    const toolbar = page.locator(".staffPreviewToolbar");

    await setPortalColorScheme(page, "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(appearance).toHaveValue("portal");
    await expect(appearance.locator("option[value='portal']")).toHaveText(
      "Follow portal (Light)"
    );
    await expect(appearance.locator("option[value='clinic']")).toHaveText(
      "Clinic default (System)"
    );
    await expect(patient).toHaveAttribute("data-patient-theme", "portal");
    await expect
      .poll(async () =>
        patient.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-follow-portal-light.png",
    });

    await setPortalColorScheme(page, "dark");
    await expect(appearance.locator("option[value='portal']")).toHaveText(
      "Follow portal (Dark)"
    );
    await expect(patient).toHaveAttribute("data-patient-theme", "portal");
    await expect
      .poll(async () =>
        patient.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("dark");
    await expect
      .poll(async () =>
        toolbar.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("dark");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-follow-portal-dark.png",
    });

    await setPortalColorScheme(page, "light");
    await appearance.selectOption("clinic");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(patient).toHaveAttribute("data-patient-theme", "system");
    await expect
      .poll(async () =>
        patient.evaluate((element) => {
          const bg = getComputedStyle(element).backgroundColor;
          const match = bg.match(
            /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/
          );
          if (!match) {
            return -1;
          }
          const [r, g, b] = match.slice(1).map((value) => Number(value) / 255);
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        })
      )
      .toBeLessThan(0.4);
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-clinic-default-system-os-dark.png",
    });

    await appearance.selectOption("light");
    await expect(patient).toHaveAttribute("data-patient-theme", "light");
    await expect
      .poll(async () =>
        patient.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light");

    await setPortalColorScheme(page, "dark");
    await appearance.selectOption("dark");
    await expect(patient).toHaveAttribute("data-patient-theme", "dark");
    await expect
      .poll(async () =>
        toolbar.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("dark");
  });

  test("editor live preview defaults to Follow portal", async ({ page }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(page).toHaveURL(/\/guides\/.+\/edit/);
    const appearance = page
      .locator("[data-live-preview]")
      .getByLabel("Patient preview appearance");
    await setPortalColorScheme(page, "light");
    await expect(appearance).toHaveValue("portal");
    await expect(appearance.locator("option[value='portal']")).toHaveText(
      "Follow portal (Light)"
    );
  });
});
