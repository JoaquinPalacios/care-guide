import { stagger } from "motion";

export const REVEAL_Y = 18;
export const REVEAL_STAGGER = 0.085;
export const REVEAL_ITEM_DURATION = 0.55;
export const REVEAL_EASE = "easeOut" as const;

export const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.22,
  margin: "0px 0px -18% 0px",
} as const;

export const HERO_VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -8% 0px",
} as const;

export const revealContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(REVEAL_STAGGER, { startDelay: 0.04 }),
    },
  },
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

export const MARKETING_CHAPTERS = [
  "hero",
  "soft",
  "showcase",
  "closing",
] as const;

export type MarketingChapterId = (typeof MARKETING_CHAPTERS)[number];
