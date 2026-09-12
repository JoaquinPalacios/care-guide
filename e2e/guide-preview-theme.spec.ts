import { expect, test } from "@playwright/test";

import { setPortalColorScheme } from "./helpers/axe";
import { staffUrl } from "./helpers/origins";
import { signInAsLocalAdmin } from "./helpers/staff-auth";

test.describe("authenticated patient preview theme", () => {
  test("clinic default label names System and does not leak portal theme", async ({
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
    await page.emulateMedia({ colorScheme: "light" });
    await expect(appearance).toHaveValue("default");
    await expect(appearance.locator("option[value='default']")).toHaveText(
      "Clinic default (System)"
    );
    await expect(appearance.locator("option[value='light']")).toHaveText(
      "Light"
    );
    await expect(appearance.locator("option[value='dark']")).toHaveText("Dark");
    await expect(patient).toHaveAttribute("data-patient-theme", "system");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-portal-light-clinic-system-os-light.png",
    });

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(patient).toHaveAttribute("data-patient-theme", "system");
    await expect
      .poll(async () =>
        patient.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light dark");
    await expect
      .poll(async () =>
        toolbar.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-portal-light-clinic-system-os-dark.png",
    });

    await appearance.selectOption("light");
    await expect(patient).toHaveAttribute("data-patient-theme", "light");
    await expect
      .poll(async () =>
        patient.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light");
    await expect
      .poll(async () =>
        toolbar.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("light");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-explicit-light.png",
    });

    await setPortalColorScheme(page, "dark");
    await appearance.selectOption("light");
    await expect(patient).toHaveAttribute("data-patient-theme", "light");
    await expect
      .poll(async () =>
        toolbar.evaluate((element) => getComputedStyle(element).colorScheme)
      )
      .toBe("dark");
    await page.screenshot({
      path: "test-results/artifacts/phase-2a.5-preview-portal-dark-patient-light.png",
    });
  });
});
