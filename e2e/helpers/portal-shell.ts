import { expect, type Page } from "@playwright/test";

export const PORTAL_OVERFLOW_VIEWPORTS = [
  { label: "1728x877", width: 1728, height: 877 },
  { label: "1440x900", width: 1440, height: 900 },
  { label: "1280x800", width: 1280, height: 800 },
  { label: "1100x800", width: 1100, height: 800 },
  { label: "1024x768", width: 1024, height: 768 },
  { label: "900x800", width: 900, height: 800 },
  { label: "devtools-docked-1328x877", width: 1328, height: 877 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "390x844", width: 390, height: 844 },
  { label: "360x800", width: 360, height: 800 },
] as const;

export const DESKTOP_SHELL_VIEWPORTS = [
  { label: "1728x877", width: 1728, height: 877 },
  { label: "1440x900", width: 1440, height: 900 },
  { label: "1280x800", width: 1280, height: 800 },
  { label: "1100x800", width: 1100, height: 800 },
  { label: "1024x768", width: 1024, height: 768 },
] as const;

export const EDITOR_BREAKPOINT_RESIZE_STEPS = [
  { label: "wide-1280", width: 1280, height: 800 },
  { label: "narrow-desktop-1100", width: 1100, height: 800 },
  { label: "tablet-900", width: 900, height: 800 },
  { label: "tablet-768", width: 768, height: 1024 },
  { label: "restore-1280", width: 1280, height: 800 },
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
  content: ShellBoxMetrics;
  editorPage: ShellBoxMetrics;
  ancestors: ShellBoxMetrics[];
  landmarkMains: number;
  editorColumns: string;
  windowScrollY: number;
  innerHeight: number;
  sidebarTop: number;
  sidebarBottom: number;
  sidebarFound: boolean;
  scrollerScrollTop: number;
  scrollerClientHeight: number;
  scrollerScrollHeight: number;
}

const ANCESTOR_SELECTORS = [
  "html",
  "body",
  ".staffAppShell",
  ".staffAppMain",
  ".staffAppScroller",
  ".staffAppContent",
  ".staffEditorPage",
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
    const editorLayout = document.querySelector(".staffEditorLayout");
    const editorColumns =
      editorLayout instanceof HTMLElement
        ? getComputedStyle(editorLayout).gridTemplateColumns
        : "";

    const sidebar = document.querySelector(".staffAppSidebar");
    const sidebarRect =
      sidebar instanceof HTMLElement ? sidebar.getBoundingClientRect() : null;
    const scrollerEl = document.querySelector(".staffAppScroller");

    return {
      html: bySelector.html,
      staffMain: bySelector[".staffAppMain"],
      scroller: bySelector[".staffAppScroller"],
      content: bySelector[".staffAppContent"],
      editorPage: bySelector[".staffEditorPage"],
      ancestors,
      landmarkMains: document.querySelectorAll("main").length,
      editorColumns,
      windowScrollY: window.scrollY,
      innerHeight: window.innerHeight,
      sidebarFound: Boolean(sidebarRect),
      sidebarTop: sidebarRect ? round(sidebarRect.top) : 0,
      sidebarBottom: sidebarRect ? round(sidebarRect.bottom) : 0,
      scrollerScrollTop:
        scrollerEl instanceof HTMLElement ? scrollerEl.scrollTop : 0,
      scrollerClientHeight:
        scrollerEl instanceof HTMLElement ? scrollerEl.clientHeight : 0,
      scrollerScrollHeight:
        scrollerEl instanceof HTMLElement ? scrollerEl.scrollHeight : 0,
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
    `${viewportLabel} ${route} mains=${report.landmarkMains} editorColumns=${report.editorColumns || "n/a"} windowScrollY=${report.windowScrollY} sidebar=${report.sidebarTop}/${report.sidebarBottom} inner=${report.innerHeight} scrollerTop=${report.scrollerScrollTop} scroller=${report.scrollerClientHeight}/${report.scrollerScrollHeight}`,
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
  expect(report.content.found, `staff content missing ${detail}`).toBe(true);
  expect(
    report.content.scrollWidth,
    `staff content overflow ${detail}`
  ).toBeLessThanOrEqual(report.content.clientWidth + 1);
  if (report.editorPage.found) {
    expect(
      report.editorPage.scrollWidth,
      `staff editor overflow ${detail}`
    ).toBeLessThanOrEqual(report.editorPage.clientWidth + 1);
  }

  return report;
}

export async function expectDesktopStaffScrollContainment(
  page: Page,
  viewportLabel: string,
  route: string,
  options: { requireOverflow?: boolean } = {}
): Promise<PortalShellReport> {
  const requireOverflow = options.requireOverflow ?? true;
  await page.locator(".staffAppScroller").evaluate((node) => {
    node.scrollTop = 0;
  });
  const before = await expectNoPortalShellOverflow(
    page,
    `${viewportLabel} before`,
    route
  );
  const detail = formatPortalShellReport(viewportLabel, route, before);

  expect(before.windowScrollY, `document already scrolled ${detail}`).toBe(0);
  expect(before.sidebarFound, `sidebar missing ${detail}`).toBe(true);
  expect(before.sidebarTop, `sidebar top ${detail}`).toBe(0);
  expect(
    Math.abs(before.sidebarBottom - before.innerHeight),
    `sidebar bottom ${detail}`
  ).toBeLessThanOrEqual(2);

  const canScroll =
    before.scrollerScrollHeight > before.scrollerClientHeight + 40;
  if (requireOverflow) {
    expect(
      before.scrollerScrollHeight,
      `content is not taller than the scroller ${detail}`
    ).toBeGreaterThan(before.scrollerClientHeight + 40);
  }
  if (!canScroll) {
    return before;
  }

  await page.locator(".staffAppScroller").evaluate((node) => {
    node.scrollTop = Math.min(900, Math.max(node.scrollHeight / 2, 400));
  });

  const after = await expectNoPortalShellOverflow(
    page,
    `${viewportLabel} after`,
    route
  );
  const afterDetail = formatPortalShellReport(
    `${viewportLabel} after-scroll`,
    route,
    after
  );

  expect(
    after.scrollerScrollTop,
    `scroller did not move ${afterDetail}`
  ).toBeGreaterThan(0);
  expect(after.windowScrollY, `document scrolled ${afterDetail}`).toBe(0);
  expect(
    after.sidebarFound,
    `sidebar missing after scroll ${afterDetail}`
  ).toBe(true);
  expect(after.sidebarTop, `sidebar top after scroll ${afterDetail}`).toBe(0);
  expect(
    Math.abs(after.sidebarBottom - after.innerHeight),
    `sidebar bottom after scroll ${afterDetail}`
  ).toBeLessThanOrEqual(2);

  return after;
}
