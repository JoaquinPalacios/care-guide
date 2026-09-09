import { describe, expect, it } from "vitest";

import {
  MARKETING_DESKTOP_MIN_PX,
  MARKETING_TABLET_MIN_PX,
} from "@/lib/marketing/breakpoints";
import {
  MARKETING_REVEAL_DESKTOP_BOTTOM_PX,
  MARKETING_REVEAL_MOBILE_BOTTOM_PX,
  marketingRevealBottomInsetPx,
  marketingRevealMargin,
} from "@/lib/marketing/reveal-margin";

describe("marketing reveal margin", () => {
  it("uses about -80px on mobile viewports", () => {
    expect(marketingRevealBottomInsetPx(360)).toBe(
      MARKETING_REVEAL_MOBILE_BOTTOM_PX
    );
    expect(marketingRevealBottomInsetPx(390)).toBe(
      MARKETING_REVEAL_MOBILE_BOTTOM_PX
    );
    expect(marketingRevealBottomInsetPx(MARKETING_TABLET_MIN_PX - 1)).toBe(
      MARKETING_REVEAL_MOBILE_BOTTOM_PX
    );
    expect(marketingRevealMargin(390)).toBe("9999px 0px -80px 0px");
  });

  it("uses about -200px on desktop and large viewports", () => {
    expect(marketingRevealBottomInsetPx(MARKETING_DESKTOP_MIN_PX)).toBe(
      MARKETING_REVEAL_DESKTOP_BOTTOM_PX
    );
    expect(marketingRevealBottomInsetPx(1280)).toBe(
      MARKETING_REVEAL_DESKTOP_BOTTOM_PX
    );
    expect(marketingRevealBottomInsetPx(1440)).toBe(
      MARKETING_REVEAL_DESKTOP_BOTTOM_PX
    );
    expect(marketingRevealMargin(1440)).toBe("9999px 0px -200px 0px");
  });

  it("interpolates between mobile and desktop on tablet widths", () => {
    const mid =
      MARKETING_TABLET_MIN_PX +
      (MARKETING_DESKTOP_MIN_PX - MARKETING_TABLET_MIN_PX) / 2;
    const inset = marketingRevealBottomInsetPx(mid);

    expect(inset).toBeLessThan(MARKETING_REVEAL_MOBILE_BOTTOM_PX);
    expect(inset).toBeGreaterThan(MARKETING_REVEAL_DESKTOP_BOTTOM_PX);
    expect(inset).toBe(-140);
    expect(marketingRevealBottomInsetPx(MARKETING_TABLET_MIN_PX)).toBe(
      MARKETING_REVEAL_MOBILE_BOTTOM_PX
    );
  });
});
