import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      host: "demodental.localhost:3000",
      "x-forwarded-proto": "http",
    }),
}));

import {
  AFTERCARE_ROBOTS,
  publicTenantCanonicalUrl,
} from "@/lib/aftercare/tenant-metadata";

describe("tenant metadata helpers", () => {
  it("builds a public hostname canonical URL", async () => {
    await expect(publicTenantCanonicalUrl("/")).resolves.toBe(
      "http://demodental.localhost:3000/"
    );
    await expect(publicTenantCanonicalUrl("/extraction")).resolves.toBe(
      "http://demodental.localhost:3000/extraction"
    );
  });

  it("never emits an internal /_sites canonical URL", async () => {
    await expect(
      publicTenantCanonicalUrl("/_sites/demodental/extraction")
    ).resolves.toBeUndefined();
    expect(AFTERCARE_ROBOTS).toEqual({ index: false, follow: false });
  });
});
