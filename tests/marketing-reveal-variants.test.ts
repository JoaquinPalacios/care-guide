import { describe, expect, it } from "vitest";

import {
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
  it("staggers section children by 70–100ms with a short ease-out", () => {
    const visible = revealContainerVariants.visible;

    expect(REVEAL_STAGGER).toBeGreaterThanOrEqual(0.07);
    expect(REVEAL_STAGGER).toBeLessThanOrEqual(0.1);
    expect(typeof visible.transition.delayChildren).toBe("function");
    expect(REVEAL_ITEM_DURATION).toBeGreaterThanOrEqual(0.5);
    expect(REVEAL_ITEM_DURATION).toBeLessThanOrEqual(0.65);
    expect(REVEAL_EASE).toBe("easeOut");
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
    expect(REVEAL_VIEWPORT.amount).toBeLessThanOrEqual(0.35);
    expect(REVEAL_VIEWPORT.margin).toMatch(/-\d+%/);
  });

  it("keeps the hero stagger in the same family as later sections", () => {
    expect(typeof heroContainerVariants.visible.transition.delayChildren).toBe(
      "function"
    );
    expect(
      typeof revealContainerVariants.visible.transition.delayChildren
    ).toBe("function");
  });
});
