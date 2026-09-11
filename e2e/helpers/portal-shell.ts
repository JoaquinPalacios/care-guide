import { expect, type Page } from "@playwright/test";

export const PORTAL_OVERFLOW_VIEWPORTS = [
  { label: "1728x877", width: 1728, height: 877 },
  { label: "1440x900", width: 1440, height: 900 },
  { label: "1280x800", width: 1280, height: 800 },
  { label: "1024x768", width: 1024, height: 768 },
  { label: "devtools-docked-1328x877", width: 1328, height: 877 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "390x844", width: 390, height: 844 },
  { label: "360x800", width: 360, height: 800 },
] as const;

export interface ShellBoxMetrics {
  selector: string;
  found: boolean;
  clientWidth: number;
  scrollWidth: number;
  overflowPx: number;
  rectLeft: number;
  rectRight: number;
  rectWidth: number;
  width: string;
  minWidth: string;
  maxWidth: string;
  flexBasis: string;
  flexGrow: string;
  flexShrink: string;
  overflowX: string;
  boxSizing: string;
}

export interface PortalShellReport {
  html: ShellBoxMetrics;
  staffMain: ShellBoxMetrics;
  scroller: ShellBoxMetrics;
  ancestors: ShellBoxMetrics[];
  landmarkMains: number;
}

const ANCESTOR_SELECTORS = [
  "html",
  "body",
  ".staffAppShell",
  ".staffAppMain",
  ".staffAppScroller",
  ".staffAppContent",
] as const;

export async function measurePortalShell(
  page: Page
): Promise<PortalShellReport> {
  return page.evaluate((selectors) => {
    const round = (value: number) => Math.round(value * 10) / 10;

    function metricsFor(selector: string): ShellBoxMetrics {
      const element =
        selector === "html"
          ? document.documentElement
          : selector === "body"
            ? document.body
            : document.querySelector(selector);

      if (!(element instanceof HTMLElement)) {
        return {
          selector,
          found: false,
          clientWidth: 0,
          scrollWidth: 0,
          overflowPx: 0,
          rectLeft: 0,
          rectRight: 0,
          rectWidth: 0,
          width: "",
          minWidth: "",
          maxWidth: "",
          flexBasis: "",
          flexGrow: "",
          flexShrink: "",
          overflowX: "",
          boxSizing: "",
        };
      }

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector,
        found: true,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowPx: element.scrollWidth - element.clientWidth,
        rectLeft: round(rect.left),
        rectRight: round(rect.right),
        rectWidth: round(rect.width),
        width: style.width,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        flexBasis: style.flexBasis,
        flexGrow: style.flexGrow,
        flexShrink: style.flexShrink,
        overflowX: style.overflowX,
        boxSizing: style.boxSizing,
      };
    }

    const ancestors = selectors.map((selector) => metricsFor(selector));
    const bySelector = Object.fromEntries(
      ancestors.map((box) => [box.selector, box])
    );

    return {
      html: bySelector.html,
      staffMain: bySelector[".staffAppMain"],
      scroller: bySelector[".staffAppScroller"],
      ancestors,
      landmarkMains: document.querySelectorAll("main").length,
    };
  }, ANCESTOR_SELECTORS);
}

export function formatPortalShellReport(
  viewportLabel: string,
  route: string,
  report: PortalShellReport
): string {
  const ancestorLines = report.ancestors.map((box) => {
    if (!box.found) {
      return `${box.selector}: missing`;
    }
    return `${box.selector} overflow=${box.overflowPx} client=${box.clientWidth} scroll=${box.scrollWidth} rect=${box.rectLeft}/${box.rectRight}/${box.rectWidth} width=${box.width} min=${box.minWidth} max=${box.maxWidth} flex=${box.flexGrow}/${box.flexShrink}/${box.flexBasis} overflow-x=${box.overflowX} box=${box.boxSizing}`;
  });
  return [
    `${viewportLabel} ${route} mains=${report.landmarkMains}`,
    ...ancestorLines,
  ].join("\n");
}

export async function expectNoPortalShellOverflow(
  page: Page,
  viewportLabel: string,
  route: string
): Promise<PortalShellReport> {
  const report = await measurePortalShell(page);
  const detail = formatPortalShellReport(viewportLabel, route, report);

  expect(report.landmarkMains, `landmark count ${detail}`).toBe(1);
  expect(report.html.found, `document root missing ${detail}`).toBe(true);
  expect(
    report.html.scrollWidth,
    `document overflow ${detail}`
  ).toBeLessThanOrEqual(report.html.clientWidth + 1);
  expect(report.staffMain.found, `staff main missing ${detail}`).toBe(true);
  expect(
    report.staffMain.scrollWidth,
    `staff main overflow ${detail}`
  ).toBeLessThanOrEqual(report.staffMain.clientWidth + 1);
  expect(report.scroller.found, `staff scroller missing ${detail}`).toBe(true);
  expect(
    report.scroller.scrollWidth,
    `staff scroller overflow ${detail}`
  ).toBeLessThanOrEqual(report.scroller.clientWidth + 1);

  return report;
}
