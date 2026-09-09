import {
  MARKETING_DESKTOP_MIN_PX,
  MARKETING_TABLET_MIN_PX,
} from "@/lib/marketing/breakpoints";

export const MARKETING_REVEAL_MOBILE_BOTTOM_PX = -80;
export const MARKETING_REVEAL_DESKTOP_BOTTOM_PX = -200;

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Bottom Intersection Observer inset in CSS pixels.
 *
 * Mobile (< 48rem): about -80px.
 * Desktop / large (≥ 64rem): about -200px.
 * Tablet (48rem–64rem): linear interpolation between those values.
 */
export function marketingRevealBottomInsetPx(widthPx: number): number {
  if (widthPx < MARKETING_TABLET_MIN_PX) {
    return MARKETING_REVEAL_MOBILE_BOTTOM_PX;
  }

  if (widthPx >= MARKETING_DESKTOP_MIN_PX) {
    return MARKETING_REVEAL_DESKTOP_BOTTOM_PX;
  }

  const t =
    (widthPx - MARKETING_TABLET_MIN_PX) /
    (MARKETING_DESKTOP_MIN_PX - MARKETING_TABLET_MIN_PX);

  return Math.round(
    lerp(
      MARKETING_REVEAL_MOBILE_BOTTOM_PX,
      MARKETING_REVEAL_DESKTOP_BOTTOM_PX,
      t
    )
  );
}

export function marketingRevealMargin(widthPx: number): string {
  return `9999px 0px ${marketingRevealBottomInsetPx(widthPx)}px 0px`;
}
