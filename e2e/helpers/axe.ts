import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function setPortalColorScheme(
  page: Page,
  scheme: "light" | "dark"
): Promise<void> {
  await page.emulateMedia({ colorScheme: scheme });
  await page.evaluate((mode) => {
    try {
      window.localStorage.setItem("aftercare-guide-portal-theme", mode);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    document.documentElement.setAttribute("data-theme-mode", mode);
  }, scheme);
}

export async function expectNoSeriousAxeViolations(
  page: Page,
  options: { exclude?: string | string[] } = {}
): Promise<void> {
  let builder = new AxeBuilder({ page });
  const exclude = options.exclude;
  if (exclude) {
    for (const selector of Array.isArray(exclude) ? exclude : [exclude]) {
      builder = builder.exclude(selector);
    }
  }
  const results = await builder.analyze();
  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious"
  );

  expect(
    blocking,
    blocking
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
            .map(
              (node) => `  ${node.target.join(" ")} — ${node.failureSummary}`
            )
            .join("\n")}`
      )
      .join("\n\n")
  ).toEqual([]);
}

export async function expectNoSeriousAxeViolationsLightAndDark(
  page: Page
): Promise<void> {
  await setPortalColorScheme(page, "light");
  await expectNoSeriousAxeViolations(page);
  await setPortalColorScheme(page, "dark");
  await expectNoSeriousAxeViolations(page);
  await setPortalColorScheme(page, "light");
}
