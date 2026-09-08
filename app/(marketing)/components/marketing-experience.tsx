"use client";

import { LazyMotion, MotionConfig, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { type ReactNode, useRef } from "react";

import {
  HERO_PREVIEW_VARIANTS,
  HERO_VIEWPORT,
  heroContainerVariants,
  revealContainerVariants,
  revealItemVariants,
  REVEAL_VIEWPORT,
} from "@/lib/marketing/reveal-variants";

const loadFeatures = () =>
  import("./marketing-motion-features").then((mod) => mod.default);

export function MarketingRevealGroup({
  children,
  viewport = REVEAL_VIEWPORT,
  variants = revealContainerVariants,
}: {
  children: ReactNode;
  viewport?: typeof REVEAL_VIEWPORT | typeof HERO_VIEWPORT;
  variants?: typeof revealContainerVariants | typeof heroContainerVariants;
}) {
  const reduced = useReducedMotion();

  return (
    <m.div
      initial={reduced === false ? "hidden" : false}
      whileInView="visible"
      viewport={viewport}
      variants={variants}
    >
      {children}
    </m.div>
  );
}

export function MarketingRevealItem({
  children,
  variants = revealItemVariants,
}: {
  children: ReactNode;
  variants?: typeof revealItemVariants | typeof HERO_PREVIEW_VARIANTS;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <m.div
      ref={ref}
      className="mkReveal"
      data-mk-pending=""
      variants={variants}
      onAnimationComplete={(definition) => {
        if (definition === "visible") {
          ref.current?.removeAttribute("data-mk-pending");
        }
      }}
    >
      {children}
    </m.div>
  );
}

export function MarketingRevealHero({ children }: { children: ReactNode }) {
  return (
    <MarketingRevealGroup
      viewport={HERO_VIEWPORT}
      variants={heroContainerVariants}
    >
      {children}
    </MarketingRevealGroup>
  );
}

export function MarketingRevealPreview({ children }: { children: ReactNode }) {
  return (
    <MarketingRevealItem variants={HERO_PREVIEW_VARIANTS}>
      {children}
    </MarketingRevealItem>
  );
}

export function MarketingExperience({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div className={className}>{children}</div>
      </MotionConfig>
    </LazyMotion>
  );
}
