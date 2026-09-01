import { gzipSync, brotliCompressSync, constants } from "node:zlib";

import { expect, type Page, type Response } from "@playwright/test";

export interface AssetMeasurement {
  url: string;
  raw: number;
  gzip: number;
  brotli: number;
  body: string;
}

function measureBuffer(url: string, body: Buffer): AssetMeasurement {
  return {
    url,
    raw: body.byteLength,
    gzip: gzipSync(body, { level: 9 }).byteLength,
    brotli: brotliCompressSync(body, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).byteLength,
    body: body.toString("utf8"),
  };
}

function isCss(response: Response): boolean {
  const type = response.request().resourceType();
  const contentType = response.headers()["content-type"] ?? "";
  return type === "stylesheet" || contentType.includes("text/css");
}

function isJs(response: Response): boolean {
  const type = response.request().resourceType();
  const contentType = response.headers()["content-type"] ?? "";
  return (
    type === "script" ||
    contentType.includes("javascript") ||
    contentType.includes("ecmascript")
  );
}

export async function measurePageAssets(
  page: Page,
  url: string
): Promise<{ css: AssetMeasurement[]; js: AssetMeasurement[] }> {
  const cssBodies = new Map<string, Buffer>();
  const jsBodies = new Map<string, Buffer>();

  const onResponse = async (response: Response) => {
    if (!response.ok()) {
      return;
    }

    try {
      const body = await response.body();
      if (isCss(response)) {
        cssBodies.set(response.url(), body);
      } else if (isJs(response)) {
        jsBodies.set(response.url(), body);
      }
    } catch {
      // Ignore bodies that cannot be read (redirects, opaque).
    }
  };

  page.on("response", onResponse);

  try {
    await page.goto(url, { waitUntil: "load" });
  } finally {
    page.off("response", onResponse);
  }

  return {
    css: [...cssBodies.entries()].map(([assetUrl, body]) =>
      measureBuffer(assetUrl, body)
    ),
    js: [...jsBodies.entries()].map(([assetUrl, body]) =>
      measureBuffer(assetUrl, body)
    ),
  };
}

export function sumMetric(
  assets: AssetMeasurement[],
  key: "raw" | "gzip" | "brotli"
): number {
  return assets.reduce((total, asset) => total + asset[key], 0);
}

export function patientSpecificJs(
  assets: AssetMeasurement[]
): AssetMeasurement[] {
  return assets.filter((asset) => {
    const url = decodeURIComponent(asset.url);
    return (
      url.includes("app/(aftercare)") ||
      url.includes("app/%28aftercare%29") ||
      /patient[-.]/i.test(url)
    );
  });
}

export function expectCssWithinPhase1Budget(css: AssetMeasurement[]): void {
  const raw = sumMetric(css, "raw");
  const gzip = sumMetric(css, "gzip");
  const brotli = sumMetric(css, "brotli");

  expect(raw, `CSS raw ${raw}`).toBeLessThanOrEqual(8192);
  expect(gzip, `CSS gzip ${gzip}`).toBeLessThanOrEqual(3072);
  expect(brotli, `CSS brotli ${brotli}`).toBeLessThanOrEqual(2560);
}

export function expectNoTailwind(css: AssetMeasurement[]): void {
  for (const asset of css) {
    expect(asset.body, asset.url).not.toContain("--tw-");
    expect(asset.body, asset.url).not.toContain('@import "tailwindcss"');
    expect(asset.body, asset.url).not.toContain("practice-brand-proof");
  }
}

export function expectStaffCssHasTailwind(css: AssetMeasurement[]): void {
  const combined = css.map((asset) => asset.body).join("\n");
  expect(combined).toContain("--tw-");
}
