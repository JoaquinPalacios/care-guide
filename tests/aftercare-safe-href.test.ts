import { describe, expect, it } from "vitest";

import {
  toSafeHttpHref,
  toSafeLogoSrc,
  toTelHref,
} from "@/lib/aftercare/safe-href";

describe("toSafeHttpHref", () => {
  it("accepts http and https URLs", () => {
    expect(toSafeHttpHref("https://www.example.com/book")).toBe(
      "https://www.example.com/book"
    );
    expect(toSafeHttpHref("http://example.test/contact")).toBe(
      "http://example.test/contact"
    );
  });

  it("rejects unsafe schemes and malformed values", () => {
    expect(toSafeHttpHref("javascript:alert(1)")).toBeNull();
    expect(toSafeHttpHref("data:text/html,hi")).toBeNull();
    expect(toSafeHttpHref("file:///etc/passwd")).toBeNull();
    expect(toSafeHttpHref("ftp://example.test/x")).toBeNull();
    expect(toSafeHttpHref("not a url")).toBeNull();
    expect(toSafeHttpHref("")).toBeNull();
    expect(toSafeHttpHref(null)).toBeNull();
    expect(toSafeHttpHref("/relative/path")).toBeNull();
  });

  it("rejects URLs with embedded credentials", () => {
    expect(toSafeHttpHref("https://user:pass@example.test/book")).toBeNull();
  });
});

describe("toTelHref", () => {
  it("builds a tel link from a formatted phone number", () => {
    expect(toTelHref("02 5550 0100")).toBe("tel:0255500100");
    expect(toTelHref("+61 2 5550 0100")).toBe("tel:+61255500100");
  });

  it("omits invalid or empty phone values", () => {
    expect(toTelHref("call us")).toBeNull();
    expect(toTelHref("123")).toBeNull();
    expect(toTelHref("")).toBeNull();
    expect(toTelHref(null)).toBeNull();
  });
});

describe("toSafeLogoSrc", () => {
  it("accepts same-origin image paths", () => {
    expect(toSafeLogoSrc("/demo/riverside-mark.svg")).toBe(
      "/demo/riverside-mark.svg"
    );
    expect(toSafeLogoSrc("/branding/logo.png")).toBe("/branding/logo.png");
  });

  it("rejects external, traversal, and non-image values", () => {
    expect(toSafeLogoSrc("https://evil.test/logo.png")).toBeNull();
    expect(toSafeLogoSrc("//evil.test/logo.png")).toBeNull();
    expect(toSafeLogoSrc("/../secret.svg")).toBeNull();
    expect(toSafeLogoSrc("/demo/riverside-mark.svg.txt")).toBeNull();
    expect(toSafeLogoSrc("javascript:alert(1)")).toBeNull();
    expect(toSafeLogoSrc("")).toBeNull();
    expect(toSafeLogoSrc(null)).toBeNull();
  });
});
