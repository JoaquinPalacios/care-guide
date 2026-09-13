import { describe, expect, it } from "vitest";

import { apexPublicUrl, labeledPublicUrl } from "@/lib/tenancy/public-url";

describe("labeledPublicUrl", () => {
  it("builds a demo tenant URL from the local marketing host", () => {
    expect(
      labeledPublicUrl({
        requestHost: "localhost:3000",
        rootDomain: "localhost",
        label: "demodental",
        protocol: "http",
      })
    ).toBe("http://demodental.localhost:3000/");
  });

  it("builds a staff login URL from the local marketing host", () => {
    expect(
      labeledPublicUrl({
        requestHost: "localhost:3000",
        rootDomain: "localhost",
        label: "app",
        protocol: "http",
        pathname: "/login",
      })
    ).toBe("http://app.localhost:3000/login");
  });

  it("builds production-shaped sibling hosts without a port", () => {
    expect(
      labeledPublicUrl({
        requestHost: "example.com",
        rootDomain: "example.com",
        label: "demodental",
        protocol: "https",
      })
    ).toBe("https://demodental.example.com/");
  });

  it("rejects unrelated or malformed hosts", () => {
    expect(
      labeledPublicUrl({
        requestHost: "evil.example",
        rootDomain: "localhost",
        label: "demodental",
      })
    ).toBeNull();
    expect(
      labeledPublicUrl({
        requestHost: "localhost:abc",
        rootDomain: "localhost",
        label: "demodental",
      })
    ).toBeNull();
    expect(
      labeledPublicUrl({
        requestHost: "localhost:3000",
        rootDomain: "localhost",
        label: "foo.bar",
      })
    ).toBeNull();
  });

  it("builds the marketing apex from staff and marketing hosts", () => {
    expect(
      apexPublicUrl({
        requestHost: "app.localhost:3000",
        rootDomain: "localhost",
        protocol: "http",
      })
    ).toBe("http://localhost:3000/");
    expect(
      apexPublicUrl({
        requestHost: "localhost:3000",
        rootDomain: "localhost",
        protocol: "http",
      })
    ).toBe("http://localhost:3000/");
    expect(
      apexPublicUrl({
        requestHost: "app.example.com",
        rootDomain: "example.com",
        protocol: "https",
      })
    ).toBe("https://example.com/");
  });
});
