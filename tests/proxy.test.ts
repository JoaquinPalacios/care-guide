import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { config, proxy } from "@/proxy";

function requestFor(
  url: string,
  headers?: Record<string, string>
): NextRequest {
  const parsed = new URL(url);
  return new NextRequest(url, {
    headers: {
      host: parsed.host,
      ...headers,
    },
  });
}

function rewrittenUrl(response: Response): URL | null {
  const rewrite =
    response.headers.get("x-middleware-rewrite") ??
    response.headers.get("x-nextjs-rewrite");
  return rewrite ? new URL(rewrite) : null;
}

describe("proxy", () => {
  const previousRoot = process.env.CARE_GUIDE_ROOT_DOMAIN;

  beforeEach(() => {
    process.env.CARE_GUIDE_ROOT_DOMAIN = "localhost";
  });

  afterEach(() => {
    if (previousRoot === undefined) {
      delete process.env.CARE_GUIDE_ROOT_DOMAIN;
    } else {
      process.env.CARE_GUIDE_ROOT_DOMAIN = previousRoot;
    }
  });

  it("rewrites a tenant host to /_sites/<slug>/...", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/extraction")
    );
    const rewritten = rewrittenUrl(response);
    expect(rewritten?.pathname).toBe("/_sites/demodental/extraction");
  });

  it("preserves the query string on tenant rewrites", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/extraction?ref=qr")
    );
    const rewritten = rewrittenUrl(response);
    expect(rewritten?.pathname).toBe("/_sites/demodental/extraction");
    expect(rewritten?.search).toBe("?ref=qr");
  });

  it("lets the apex staff host pass through", () => {
    const response = proxy(requestFor("http://localhost:3000/dashboard"));
    expect(response.status).toBe(200);
    expect(rewrittenUrl(response)).toBeNull();
  });

  it("lets the app staff host pass through", () => {
    const response = proxy(requestFor("http://app.localhost:3000/login"));
    expect(response.status).toBe(200);
    expect(rewrittenUrl(response)).toBeNull();
  });

  it("blocks direct /_sites access on the staff host", () => {
    const response = proxy(
      requestFor("http://localhost:3000/_sites/demodental/extraction")
    );
    expect(response.status).toBe(404);
    expect(rewrittenUrl(response)).toBeNull();
  });

  it("blocks /_sites on a tenant host without revealing the namespace", () => {
    const response = proxy(
      requestFor(
        "http://demodental.localhost:3000/_sites/demodental/extraction"
      )
    );
    expect(response.status).toBe(404);
    expect(rewrittenUrl(response)).toBeNull();
    expect(response.headers.get("location")).toBeNull();
  });

  it("blocks tenant /login", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/login")
    );
    expect(response.status).toBe(404);
  });

  it("blocks tenant /dashboard", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/dashboard")
    );
    expect(response.status).toBe(404);
  });

  it("blocks tenant /display/<token>", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/display/abc123")
    );
    expect(response.status).toBe(404);
  });

  it("blocks tenant /session and /sessions paths", () => {
    expect(
      proxy(requestFor("http://demodental.localhost:3000/sessions/new")).status
    ).toBe(404);
    expect(
      proxy(requestFor("http://demodental.localhost:3000/session/abc/control"))
        .status
    ).toBe(404);
  });

  it("blocks encoded /_sites access", () => {
    const response = proxy(
      requestFor("http://localhost:3000/%5Fsites/demodental/extraction")
    );
    expect(response.status).toBe(404);
  });

  it("blocks tenant staff routes after resolving parent-path segments", () => {
    expect(
      proxy(requestFor("http://demodental.localhost:3000/../../../dashboard"))
        .status
    ).toBe(404);
    expect(
      proxy(requestFor("http://demodental.localhost:3000/extraction/../login"))
        .status
    ).toBe(404);
  });

  it("rewrites tenant paths after resolving parent-path segments", () => {
    const response = proxy(
      requestFor("http://demodental.localhost:3000/foo/../extraction")
    );
    expect(rewrittenUrl(response)?.pathname).toBe(
      "/_sites/demodental/extraction"
    );
  });

  it("does not trust a forged tenant header", () => {
    const response = proxy(
      requestFor("http://unknown.localhost:3000/extraction", {
        "x-care-guide-tenant": "demodental",
        "x-tenant": "demodental",
      })
    );
    const rewritten = rewrittenUrl(response);
    expect(rewritten?.pathname).toBe("/_sites/unknown/extraction");
  });

  it("returns 404 for unrelated and suffix-spoof hosts", () => {
    expect(proxy(requestFor("http://evil.example/extraction")).status).toBe(
      404
    );
    expect(
      proxy(requestFor("http://demodental.localhost.evil.example/extraction"))
        .status
    ).toBe(404);
  });

  it("excludes framework static assets from the matcher", () => {
    const matchers = Array.isArray(config.matcher)
      ? config.matcher
      : [config.matcher];
    const source = matchers
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .join(" ");
    expect(source).toContain("_next/static");
    expect(source).toContain("_next/image");
    expect(source).toContain("favicon.ico");
  });
});
