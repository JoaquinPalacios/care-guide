import { stagger } from "motion";

export const REVEAL_Y = 14;
export const REVEAL_Y_CARD = 16;
export const REVEAL_Y_PREVIEW = 10;
export const REVEAL_STAGGER = 0.085;
export const REVEAL_ITEM_DURATION = 0.52;
export const REVEAL_EASE = "easeOut" as const;
export const EDITORIAL_REVEAL_STEP = 0.07;
export const CARD_REVEAL_STAGGER = 0.07;
export const CARD_REVEAL_STAGGER_MAX = 0.25;
export const MARKETING_REVEAL_MARGIN = "9999px 0px -100px 0px";

export const MARKETING_REVEAL_VIEWPORT = {
  once: true,
  margin: MARKETING_REVEAL_MARGIN,
} as const;

export const REVEAL_VIEWPORT = MARKETING_REVEAL_VIEWPORT;

export function cardRevealDelay(index: number): number {
  return Math.min(index * CARD_REVEAL_STAGGER, CARD_REVEAL_STAGGER_MAX);
}

export const HERO_VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -8% 0px",
} as const;

export const revealContainerVariants = {
  hidden: {},
  visible: {},
};

export const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(REVEAL_STAGGER, { startDelay: 0.06 }),
    },
  },
};

export const revealItemVariants = {
  hidden: {
    opacity: 0,
    transform: `translateY(${REVEAL_Y}px)`,
  },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
    },
  },
};

export const delayedRevealItemVariants = {
  hidden: {
    opacity: 0,
    transform: `translateY(${REVEAL_Y}px)`,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
      delay,
    },
  }),
};

export const cardRevealItemVariants = {
  hidden: {
    opacity: 0,
    transform: `translateY(${REVEAL_Y_CARD}px)`,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
      delay,
    },
  }),
};

export const nodeRevealItemVariants = {
  hidden: {
    opacity: 0,
    transform: "scale(1)",
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transform: "scale(1)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
      delay,
    },
  }),
};

export const railRevealVariants = {
  hidden: {
    opacity: 1,
    transform: "scaleX(0)",
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transform: "scaleX(1)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
      delay,
    },
  }),
};

export const HERO_PREVIEW_VARIANTS = {
  hidden: {
    opacity: 0,
    transform: "translateY(20px) scale(0.985)",
  },
  visible: {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: {
      type: "tween" as const,
      duration: 0.62,
      ease: REVEAL_EASE,
    },
  },
};

export const previewRevealVariants = {
  hidden: {
    opacity: 0,
    transform: `translateY(${REVEAL_Y_PREVIEW}px) scale(0.985)`,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: {
      type: "tween" as const,
      duration: REVEAL_ITEM_DURATION,
      ease: REVEAL_EASE,
      delay,
    },
  }),
};

export const MARKETING_CHAPTERS = [
  "hero",
  "soft",
  "showcase",
  "closing",
] as const;

export type MarketingChapterId = (typeof MARKETING_CHAPTERS)[number];
