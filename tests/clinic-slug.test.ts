import { describe, expect, it } from "vitest";

import { isValidCareGuideSlug } from "@/lib/aftercare/slug";

describe("isValidCareGuideSlug", () => {
  it.each(["demodental", "riverside-dental", "a1b", "ab-cd-12"])(
    "accepts %s",
    (slug) => {
      expect(isValidCareGuideSlug(slug)).toBe(true);
    }
  );

  it.each([
    "ab",
    "a".repeat(33),
    "DemoDental",
    "-leading",
    "trailing-",
    "double--hyphen",
    "has_underscore",
    "has space",
    "",
  ])("rejects %s", (slug) => {
    expect(isValidCareGuideSlug(slug)).toBe(false);
  });
});
