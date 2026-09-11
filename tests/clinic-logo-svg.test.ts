import { describe, expect, it } from "vitest";

import { sanitizeClinicLogoSvg } from "@/lib/clinic-assets/sanitize-clinic-logo-svg";

function encode(source: string): Uint8Array {
  return new TextEncoder().encode(source);
}

const SAFE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#155e75"/></svg>`;

describe("sanitizeClinicLogoSvg", () => {
  it("accepts a simple clinic mark and keeps it valid SVG", () => {
    const result = sanitizeClinicLogoSvg(encode(SAFE));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mimeType).toBe("image/svg+xml");
      const text = new TextDecoder().decode(result.bytes);
      expect(text).toContain("<svg");
      expect(text).toContain("viewBox");
      expect(text).not.toContain("<script");
    }
  });

  it("rejects or strips script, event handlers, foreignObject, javascript hrefs, and remote resources", () => {
    const cases = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle onload="alert(1)" r="4"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><foreignObject width="10" height="10"><p xmlns="http://www.w3.org/1999/xhtml">x</p></foreignObject></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><a href="javascript:alert(1)"><circle r="4"/></a></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><image href="https://evil.test/x.png" width="10" height="10"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><use href="https://evil.test/x.svg#a"/></svg>`,
    ];

    for (const source of cases) {
      const result = sanitizeClinicLogoSvg(encode(source));
      if (!result.ok) {
        continue;
      }
      const text = new TextDecoder().decode(result.bytes);
      expect(text, source).not.toMatch(/<script/i);
      expect(text, source).not.toMatch(/foreignObject/i);
      expect(text, source).not.toMatch(/javascript:/i);
      expect(text, source).not.toMatch(/\son[a-z]+\s*=/i);
      expect(text, source).not.toContain("evil.test");
    }
  });

  it("rejects malformed XML and missing metrics", () => {
    expect(sanitizeClinicLogoSvg(encode("<svg><")).ok).toBe(false);
    expect(
      sanitizeClinicLogoSvg(
        encode(`<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>`)
      ).ok
    ).toBe(false);
  });

  it("rejects oversized SVG payloads", () => {
    const huge = new Uint8Array(1024 * 1024 + 1);
    huge.set(new TextEncoder().encode(SAFE));
    expect(sanitizeClinicLogoSvg(huge).ok).toBe(false);
  });

  it("does not keep CSS url() references in sanitized output", () => {
    const result = sanitizeClinicLogoSvg(
      encode(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect style="fill:url(https://evil.test/x)" width="10" height="10"/></svg>`
      )
    );
    if (result.ok) {
      const text = new TextDecoder().decode(result.bytes);
      expect(text).not.toMatch(/url\s*\(/i);
      expect(text).not.toContain("evil.test");
    }
  });
});
