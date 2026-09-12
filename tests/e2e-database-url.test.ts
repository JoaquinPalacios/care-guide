import { describe, expect, it } from "vitest";

import { deriveE2eDatabaseUrl } from "../e2e/helpers/database";

describe("e2e database isolation", () => {
  it("derives a dedicated e2e database instead of reusing the development database", () => {
    expect(
      deriveE2eDatabaseUrl(
        "postgresql://postgres:postgres@localhost:5432/care_guide?schema=public"
      )
    ).toContain("/care_guide_e2e");
    expect(
      deriveE2eDatabaseUrl(
        "postgresql://postgres:postgres@localhost:5432/care_guide?schema=public"
      )
    ).not.toMatch(/\/care_guide(\?|$)/);
  });
});
