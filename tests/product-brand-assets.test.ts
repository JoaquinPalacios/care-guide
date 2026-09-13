import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  PRODUCT_ANDROID_CHROME_192_SRC,
  PRODUCT_ANDROID_CHROME_512_SRC,
  PRODUCT_APPLE_TOUCH_ICON_SRC,
  PRODUCT_FAVICON_16_SRC,
  PRODUCT_FAVICON_32_SRC,
  PRODUCT_FAVICON_ICO_SRC,
  PRODUCT_ISOLOGO_SRC,
  PRODUCT_LOGO_SRC,
  PRODUCT_WEB_MANIFEST_SRC,
} from "@/lib/branding/product-assets";
import { PRODUCT_HEAD_METADATA, PRODUCT_ICONS } from "@/lib/seo/icons";

function publicPath(src: string): string {
  return `public${src}`;
}

describe("product brand assets", () => {
  it("keeps the logo, isologo, and favicon pack on disk", () => {
    const files = [
      PRODUCT_ISOLOGO_SRC,
      PRODUCT_LOGO_SRC,
      PRODUCT_FAVICON_ICO_SRC,
      PRODUCT_FAVICON_16_SRC,
      PRODUCT_FAVICON_32_SRC,
      PRODUCT_APPLE_TOUCH_ICON_SRC,
      PRODUCT_ANDROID_CHROME_192_SRC,
      PRODUCT_ANDROID_CHROME_512_SRC,
      PRODUCT_WEB_MANIFEST_SRC,
      "/favicon.ico",
    ];

    expect(
      files.map((src) => publicPath(src)).filter((path) => !existsSync(path))
    ).toEqual([]);
    expect(existsSync("app/favicon.ico")).toBe(true);
    expect(existsSync("app/icon.png")).toBe(true);
    expect(existsSync("app/apple-icon.png")).toBe(true);
  });

  it("wires the favicon pack, apple icon, and the web manifest", () => {
    const icons = PRODUCT_ICONS as {
      icon: { url: string }[];
      apple: { url: string }[];
    };

    expect(icons.icon.map((icon) => icon.url)).toEqual([
      PRODUCT_FAVICON_ICO_SRC,
      PRODUCT_FAVICON_16_SRC,
      PRODUCT_FAVICON_32_SRC,
      PRODUCT_ANDROID_CHROME_192_SRC,
      PRODUCT_ANDROID_CHROME_512_SRC,
    ]);
    expect(icons.apple.map((icon) => icon.url)).toEqual([
      PRODUCT_APPLE_TOUCH_ICON_SRC,
    ]);
    expect(PRODUCT_HEAD_METADATA.manifest).toBe(PRODUCT_WEB_MANIFEST_SRC);
  });

  it("names the installed web manifest River Aftercare and points at favicon PNGs", () => {
    const manifest = JSON.parse(
      readFileSync(publicPath(PRODUCT_WEB_MANIFEST_SRC), "utf8")
    ) as {
      name: string;
      icons: { src: string }[];
    };

    expect(manifest.name).toBe("River Aftercare");
    expect(manifest.icons.map((icon) => icon.src)).toEqual([
      PRODUCT_ANDROID_CHROME_192_SRC,
      PRODUCT_ANDROID_CHROME_512_SRC,
    ]);
  });
});
