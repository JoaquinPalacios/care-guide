/**
 * Marketing and patient CSS breakpoints, expressed in rem to match the
 * existing `@media` queries in `marketing.module.css` and `aftercare.css`.
 *
 * Intersection Observer margins are pixel strings, so JS converts with a
 * 16px root — the same default used by those stylesheets.
 */
export const MARKETING_ROOT_FONT_PX = 16;

/** `@media (max-width: 47.99rem)` — stacked mobile layouts */
export const MARKETING_MOBILE_MAX_REM = 47.99;

/** `@media (min-width: 48rem)` — tablet and up */
export const MARKETING_TABLET_MIN_REM = 48;

/** `@media (min-width: 64rem)` — desktop / large layouts */
export const MARKETING_DESKTOP_MIN_REM = 64;

export const MARKETING_MOBILE_MAX_PX =
  MARKETING_MOBILE_MAX_REM * MARKETING_ROOT_FONT_PX;
export const MARKETING_TABLET_MIN_PX =
  MARKETING_TABLET_MIN_REM * MARKETING_ROOT_FONT_PX;
export const MARKETING_DESKTOP_MIN_PX =
  MARKETING_DESKTOP_MIN_REM * MARKETING_ROOT_FONT_PX;

export const MARKETING_SSR_VIEWPORT_WIDTH_PX = 1280;

export function remToPx(rem: number): number {
  return rem * MARKETING_ROOT_FONT_PX;
}
