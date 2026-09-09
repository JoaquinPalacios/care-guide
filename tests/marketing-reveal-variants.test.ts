import { describe, expect, it } from "vitest";

import {
  delayedRevealItemVariants,
  HERO_PREVIEW_VARIANTS,
  REVEAL_EASE,
  REVEAL_ITEM_DURATION,
  REVEAL_STAGGER,
  REVEAL_VIEWPORT,
  REVEAL_Y,
  heroContainerVariants,
  revealContainerVariants,
  revealItemVariants,
} from "@/lib/marketing/reveal-variants";

describe("marketing reveal variants", () => {
  it("keeps shared timing restrained and uses per-item delays for sections", () => {
    expect(REVEAL_STAGGER).toBeGreaterThanOrEqual(0.07);
    expect(REVEAL_STAGGER).toBeLessThanOrEqual(0.1);
    expect(revealContainerVariants.visible).toEqual({});
    expect(REVEAL_ITEM_DURATION).toBeGreaterThanOrEqual(0.48);
    expect(REVEAL_ITEM_DURATION).toBeLessThanOrEqual(0.58);
    expect(REVEAL_EASE).toBe("easeOut");
    const delayed = delayedRevealItemVariants.visible(0.07);
    expect(delayed.transition.delay).toBe(0.07);
    expect(delayed.transition.duration).toBe(REVEAL_ITEM_DURATION);
  });

  it("moves items a small distance rather than a theatrical drop", () => {
    const hidden = revealItemVariants.hidden;
    const visible = revealItemVariants.visible;

    expect(hidden.opacity).toBe(0);
    expect(hidden.transform).toBe(`translateY(${REVEAL_Y}px)`);
    expect(REVEAL_Y).toBeLessThanOrEqual(18);
    expect(visible.opacity).toBe(1);
    expect(visible.transform).toBe("translateY(0px)");
    expect(visible.transition.duration).toBe(REVEAL_ITEM_DURATION);
    expect(visible.transition.type).toBe("tween");
  });

  it("gives the hero preview a restrained scale-in without bounce", () => {
    const hidden = HERO_PREVIEW_VARIANTS.hidden;
    const visible = HERO_PREVIEW_VARIANTS.visible;

    expect(hidden.transform).toContain("translateY(20px)");
    expect(hidden.transform).toContain("scale(0.985)");
    expect(visible.transform).toBe("translateY(0px) scale(1)");
    expect(visible.transition.ease).toBe(REVEAL_EASE);
    expect(visible.transition.type).toBe("tween");
  });

  it("triggers once, before the section is fully centered", () => {
    expect(REVEAL_VIEWPORT.once).toBe(true);
    expect(REVEAL_VIEWPORT.amount).toBeGreaterThanOrEqual(0.15);
    expect(REVEAL_VIEWPORT.amount).toBeLessThanOrEqual(0.25);
    expect(REVEAL_VIEWPORT.margin).toMatch(/-\d+%/);
  });

  it("keeps the hero stagger while later sections orchestrate with explicit delays", () => {
    expect(typeof heroContainerVariants.visible.transition.delayChildren).toBe(
      "function"
    );
    expect(revealContainerVariants.visible).toEqual({});
  });
});
