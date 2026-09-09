"use client";

import { useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { type ReactNode, useRef } from "react";

import {
  cardRevealDelay,
  cardRevealItemVariants,
  delayedRevealItemVariants,
  HERO_PREVIEW_VARIANTS,
  HERO_VIEWPORT,
  heroContainerVariants,
  MARKETING_REVEAL_VIEWPORT,
  nodeRevealItemVariants,
  previewRevealVariants,
  railRevealVariants,
  revealContainerVariants,
  revealItemVariants,
} from "@/lib/marketing/reveal-variants";

type RevealViewport = typeof MARKETING_REVEAL_VIEWPORT | typeof HERO_VIEWPORT;
type RevealVariants =
  | typeof delayedRevealItemVariants
  | typeof revealItemVariants
  | typeof HERO_PREVIEW_VARIANTS
  | typeof previewRevealVariants
  | typeof railRevealVariants
  | typeof cardRevealItemVariants
  | typeof nodeRevealItemVariants;

const MotionTag = {
  div: m.div,
  li: m.li,
  span: m.span,
} as const;

function clearPending(node: HTMLElement | null, definition: unknown) {
  if (definition === "visible") {
    node?.removeAttribute("data-mk-pending");
  }
}

export function MarketingRevealGroup({
  children,
  viewport = MARKETING_REVEAL_VIEWPORT,
  variants = revealContainerVariants,
}: {
  children: ReactNode;
  viewport?: RevealViewport;
  variants?: typeof revealContainerVariants | typeof heroContainerVariants;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { ...viewport, once: true });
  const motionOn = reduced === false;

  return (
    <m.div
      ref={ref}
      data-mk-section=""
      data-mk-entered={inView ? "" : undefined}
      initial={motionOn ? "hidden" : false}
      animate={motionOn ? (inView ? "visible" : "hidden") : false}
      variants={variants}
    >
      {children}
    </m.div>
  );
}

export function MarketingRevealItem({
  children,
  delay,
  variants,
  as = "div",
  className,
  rail = false,
  preview = false,
  connector = false,
  ariaHidden = false,
}: {
  children: ReactNode;
  delay?: number;
  variants?: RevealVariants;
  as?: keyof typeof MotionTag;
  className?: string;
  rail?: boolean;
  preview?: boolean;
  connector?: boolean;
  ariaHidden?: boolean;
}) {
  const reduced = useReducedMotion();
  const nodeRef = useRef<HTMLElement | null>(null);
  const Tag = MotionTag[as];
  const useDelay = delay !== undefined;
  const resolvedVariants =
    variants ??
    (preview
      ? previewRevealVariants
      : useDelay
        ? delayedRevealItemVariants
        : revealItemVariants);
  const classes = ["mkReveal", className].filter(Boolean).join(" ");

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        nodeRef.current = node;
      }}
      className={classes}
      data-mk-pending=""
      data-mk-rail={rail ? "" : undefined}
      data-mk-process-rail={rail ? "" : undefined}
      data-mk-preview={preview ? "" : undefined}
      data-mk-process-connector={connector ? "" : undefined}
      aria-hidden={rail || connector || ariaHidden ? true : undefined}
      custom={reduced === true ? 0 : (delay ?? 0)}
      variants={resolvedVariants}
      onAnimationComplete={(definition) => {
        clearPending(nodeRef.current, definition);
      }}
    >
      {children}
    </Tag>
  );
}

export function MarketingRevealCard({
  children,
  index = 0,
  variants = cardRevealItemVariants,
  as = "div",
  className,
  rail = false,
  connector = false,
  processCard = false,
  ariaHidden = false,
}: {
  children: ReactNode;
  index?: number;
  variants?: RevealVariants;
  as?: keyof typeof MotionTag;
  className?: string;
  rail?: boolean;
  connector?: boolean;
  processCard?: boolean;
  ariaHidden?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { ...MARKETING_REVEAL_VIEWPORT, once: true });
  const motionOn = reduced === false;
  const Tag = MotionTag[as];
  const classes = ["mkReveal", className].filter(Boolean).join(" ");

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={classes}
      data-mk-card=""
      data-mk-pending={motionOn ? "" : undefined}
      data-mk-entered={inView ? "" : undefined}
      data-mk-rail={rail ? "" : undefined}
      data-mk-process-rail={rail ? "" : undefined}
      data-mk-process-connector={connector ? "" : undefined}
      data-mk-process-card={processCard ? "" : undefined}
      aria-hidden={rail || connector || ariaHidden ? true : undefined}
      initial={motionOn ? "hidden" : false}
      animate={motionOn ? (inView ? "visible" : "hidden") : false}
      custom={reduced === true ? 0 : cardRevealDelay(index)}
      variants={variants}
      onAnimationComplete={(definition) => {
        clearPending(ref.current, definition);
      }}
    >
      {children}
    </Tag>
  );
}

export function MarketingRevealHero({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      initial={reduced === false ? "hidden" : false}
      whileInView="visible"
      viewport={{ ...HERO_VIEWPORT, once: true }}
      variants={heroContainerVariants}
    >
      {children}
    </m.div>
  );
}

export function MarketingRevealPreview({ children }: { children: ReactNode }) {
  return (
    <MarketingRevealItem variants={HERO_PREVIEW_VARIANTS}>
      {children}
    </MarketingRevealItem>
  );
}
