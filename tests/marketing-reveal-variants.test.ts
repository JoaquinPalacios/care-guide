import { describe, expect, it } from "vitest";

import {
  cardRevealDelay,
  cardRevealItemVariants,
  CARD_REVEAL_STAGGER,
  CARD_REVEAL_STAGGER_MAX,
  delayedRevealItemVariants,
  EDITORIAL_REVEAL_STEP,
  HERO_PREVIEW_VARIANTS,
  MARKETING_REVEAL_MARGIN,
  MARKETING_REVEAL_VIEWPORT,
  REVEAL_EASE,
  REVEAL_ITEM_DURATION,
  REVEAL_STAGGER,
  REVEAL_VIEWPORT,
  REVEAL_Y,
  REVEAL_Y_CARD,
  heroContainerVariants,
  revealContainerVariants,
  revealItemVariants,
} from "@/lib/marketing/reveal-variants";

describe("marketing reveal variants", () => {
  it("keeps shared timing restrained and uses per-item delays for sections", () => {
    expect(REVEAL_STAGGER).toBeGreaterThanOrEqual(0.07);
    expect(REVEAL_STAGGER).toBeLessThanOrEqual(0.1);
    expect(EDITORIAL_REVEAL_STEP).toBe(0.07);
    expect(revealContainerVariants.visible).toEqual({});
    expect(REVEAL_ITEM_DURATION).toBeGreaterThanOrEqual(0.45);
    expect(REVEAL_ITEM_DURATION).toBeLessThanOrEqual(0.55);
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

  it("triggers once, about 100px after the viewport bottom edge", () => {
    expect(MARKETING_REVEAL_VIEWPORT).toBe(REVEAL_VIEWPORT);
    expect(MARKETING_REVEAL_VIEWPORT.once).toBe(true);
    expect(MARKETING_REVEAL_VIEWPORT.margin).toBe("9999px 0px -100px 0px");
    expect(MARKETING_REVEAL_MARGIN).toBe("9999px 0px -100px 0px");
    expect("amount" in MARKETING_REVEAL_VIEWPORT).toBe(false);
  });

  it("staggers independent cards without a long cascade", () => {
    expect(CARD_REVEAL_STAGGER).toBeGreaterThanOrEqual(0.06);
    expect(CARD_REVEAL_STAGGER).toBeLessThanOrEqual(0.08);
    expect(cardRevealDelay(0)).toBe(0);
    expect(cardRevealDelay(1)).toBe(CARD_REVEAL_STAGGER);
    expect(cardRevealDelay(3)).toBeLessThanOrEqual(CARD_REVEAL_STAGGER_MAX);
    expect(cardRevealDelay(8)).toBe(CARD_REVEAL_STAGGER_MAX);
    expect(cardRevealItemVariants.hidden.transform).toBe(
      `translateY(${REVEAL_Y_CARD}px)`
    );
    expect(REVEAL_Y_CARD).toBe(16);
  });

  it("keeps the hero stagger while later sections orchestrate with explicit delays", () => {
    expect(typeof heroContainerVariants.visible.transition.delayChildren).toBe(
      "function"
    );
    expect(revealContainerVariants.visible).toEqual({});
  });
});
