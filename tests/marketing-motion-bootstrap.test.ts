import { describe, expect, it } from "vitest";

import { marketingMotionBootstrapScript } from "@/lib/marketing/motion-bootstrap";

describe("marketing motion bootstrap", () => {
  it("opts into enhancement only when motion is allowed", () => {
    const script = marketingMotionBootstrapScript();

    expect(script).toContain("prefers-reduced-motion");
    expect(script).toContain("data-mk-motion");
    expect(script).toContain("enhance");
    expect(script).toContain("reduce");
    expect(script).not.toContain("opacity:0");
    expect(script).not.toContain("localStorage");
  });
});
