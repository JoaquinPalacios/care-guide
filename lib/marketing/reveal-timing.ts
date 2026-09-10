export const REVEAL_Y = 14;
export const REVEAL_Y_CARD = 16;
export const REVEAL_Y_PREVIEW = 10;

/** Hero container child stagger. */
export const REVEAL_STAGGER = 0.125;

/** Editorial group items (eyebrow → heading → copy → CTA). */
export const EDITORIAL_REVEAL_DURATION = 0.8;
export const EDITORIAL_REVEAL_STEP = 0.125;

/** Independent cards / process nodes. Cap keeps a desktop row from cascading. */
export const CARD_REVEAL_DURATION = 0.7;
export const CARD_REVEAL_STAGGER = 0.105;
export const CARD_REVEAL_STAGGER_MAX = 0.35;

/** Premium ease-out. Motion cubic-bezier(.22, 1, .36, 1). */
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export function cardRevealDelay(index: number): number {
  return Math.min(index * CARD_REVEAL_STAGGER, CARD_REVEAL_STAGGER_MAX);
}

export function editorialRevealDelay(step: number): number {
  return step * EDITORIAL_REVEAL_STEP;
}
