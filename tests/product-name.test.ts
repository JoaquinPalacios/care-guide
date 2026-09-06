import { describe, expect, it } from "vitest";

import { PRODUCT_ATTRIBUTION, PRODUCT_NAME } from "@/lib/branding/product-name";

describe("provisional product name", () => {
  it("uses Aftercare Guide as the visible product name", () => {
    expect(PRODUCT_NAME).toBe("Aftercare Guide");
    expect(PRODUCT_ATTRIBUTION).toBe("Powered by Aftercare Guide");
  });
});
