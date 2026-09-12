import { expect, test } from "@playwright/test";

import { setPortalColorScheme } from "./helpers/axe";
import {
  EDITOR_BREAKPOINT_RESIZE_STEPS,
  PORTAL_OVERFLOW_VIEWPORTS,
  expectNoPortalShellOverflow,
} from "./helpers/portal-shell";
import { staffUrl } from "./helpers/origins";
import {
  signInAsLocalAdmin,
  signInAsLocalOperator,
} from "./helpers/staff-auth";

test.describe("portal shell overflow contract", () => {
  test("clinic portal routes stay within the shell at core viewports", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    const editorHref = await page
      .getByRole("link", { name: "Edit" })
      .first()
      .getAttribute("href");
    expect(editorHref).toBeTruthy();

    const routes = [
      { name: "Overview", path: "/dashboard" },
      { name: "Guides", path: "/guides" },
      { name: "Guide editor", path: editorHref! },
      { name: "Practice", path: "/practice" },
    ];

    for (const route of routes) {
      await page.goto(staffUrl(route.path), { waitUntil: "load" });
      await setPortalColorScheme(page, "light");
      for (const viewport of PORTAL_OVERFLOW_VIEWPORTS) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await expectNoPortalShellOverflow(
          page,
          `light ${viewport.label}`,
          route.path
        );
      }

      if (route.path === "/practice") {
        await page.setViewportSize({ width: 1728, height: 877 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-practice-1728.png",
        });
        await page.setViewportSize({ width: 360, height: 800 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-practice-360.png",
        });
      }
      if (route.path === "/dashboard") {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-overview-1440.png",
        });
      }
      if (route.name === "Guide editor") {
        await page.setViewportSize({ width: 1728, height: 877 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-1728.png",
        });
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-1280.png",
        });
        await page.setViewportSize({ width: 1100, height: 800 });
        const collapsed = await expectNoPortalShellOverflow(
          page,
          "light 1100x800 collapse",
          route.path
        );
        expect(
          collapsed.editorColumns === "none" ||
            !collapsed.editorColumns.includes(" ")
        ).toBe(true);
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-1100.png",
        });
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-1024.png",
        });
        await page.setViewportSize({ width: 900, height: 800 });
        await expectNoPortalShellOverflow(
          page,
          "light 900x800 collapse",
          route.path
        );
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-900.png",
        });
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-768.png",
        });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-guide-editor-1440.png",
        });
      }

      if (route.path === "/dashboard" || route.path === "/practice") {
        await page.setViewportSize({ width: 1440, height: 900 });
        await setPortalColorScheme(page, "dark");
        await expectNoPortalShellOverflow(page, "dark 1440x900", route.path);
        await page.setViewportSize({ width: 360, height: 800 });
        await expectNoPortalShellOverflow(page, "dark 360x800", route.path);
      }
    }
  });

  test("operator routes stay within the shell at core viewports", async ({
    page,
  }) => {
    await signInAsLocalOperator(page);
    await expect(
      page.getByRole("heading", { name: "All Clinics" })
    ).toBeVisible();
    const clinicHref = await page
      .getByRole("link", { name: /Riverside Dental Demo/i })
      .first()
      .getAttribute("href");
    expect(clinicHref).toBeTruthy();

    const routes = [
      { name: "Operator All Clinics", path: "/operator/clinics" },
      { name: "Operator clinic detail", path: clinicHref! },
    ];

    for (const route of routes) {
      await page.goto(staffUrl(route.path), { waitUntil: "load" });
      await setPortalColorScheme(page, "light");
      for (const viewport of PORTAL_OVERFLOW_VIEWPORTS) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await expectNoPortalShellOverflow(
          page,
          `light ${viewport.label}`,
          route.path
        );
      }

      await page.setViewportSize({ width: 1440, height: 900 });
      await setPortalColorScheme(page, "dark");
      await expectNoPortalShellOverflow(page, "dark 1440x900", route.path);
      if (route.path === "/operator/clinics") {
        await page.setViewportSize({ width: 1440, height: 900 });
        await setPortalColorScheme(page, "light");
        await page.screenshot({
          path: "test-results/artifacts/phase-2a.5-operator-clinics-1440.png",
        });
      }
    }
  });

  test("guide editor collapses columns while resizing through the content breakpoint", async ({
    page,
  }) => {
    await signInAsLocalAdmin(page);
    await page.goto(staffUrl("/guides"), { waitUntil: "load" });
    const editorHref = await page
      .getByRole("link", { name: "Edit" })
      .first()
      .getAttribute("href");
    expect(editorHref).toBeTruthy();
    await page.goto(staffUrl(editorHref!), { waitUntil: "load" });
    await setPortalColorScheme(page, "light");

    for (const viewport of EDITOR_BREAKPOINT_RESIZE_STEPS) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      const report = await expectNoPortalShellOverflow(
        page,
        `resize ${viewport.label}`,
        editorHref!
      );
      if (viewport.width <= 1100) {
        expect(
          report.editorColumns === "none" ||
            !report.editorColumns.includes(" "),
          `${viewport.label} should be one column: ${report.editorColumns}`
        ).toBe(true);
      }
    }
  });
});
