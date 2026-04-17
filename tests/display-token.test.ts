import { describe, expect, it } from "vitest";

import { generateDisplayToken } from "@/lib/sessions/display-token";

describe("generateDisplayToken", () => {
  it("returns a URL-safe base64url string of the expected length", () => {
    const token = generateDisplayToken();

    // 32 bytes base64url-encoded without padding -> 43 characters.
    expect(token).toHaveLength(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("returns different tokens across successive calls", () => {
    const tokens = new Set(
      Array.from({ length: 10 }, () => generateDisplayToken())
    );

    expect(tokens.size).toBe(10);
  });
});
