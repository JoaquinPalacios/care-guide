/**
 * Maps ClinicProfile colour fields to semantic CSS custom properties.
 * Framework-light and Prisma-free: pass already-loaded profile values in.
 * Colour fields must be hex. Arbitrary CSS (url(), var(), calc(), statements) is rejected.
 */
import type { CSSProperties } from "react";

export const AFTERCARE_THEME_TOKEN_KEYS = [
  "--cg-brand",
  "--cg-on-brand",
  "--cg-accent",
  "--cg-surface",
  "--cg-surface-subtle",
  "--cg-text",
  "--cg-text-muted",
  "--cg-border",
  "--cg-warning",
  "--cg-warning-surface",
  "--cg-emergency",
  "--cg-emergency-surface",
  "--cg-focus",
] as const;

export type AftercareThemeTokenName =
  (typeof AFTERCARE_THEME_TOKEN_KEYS)[number];

export type AftercareTheme = {
  [K in AftercareThemeTokenName]: string;
};

export interface AftercareThemeInput {
  primaryColor: string | null;
  accentColor: string | null;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TEXT_CONTRAST_RATIO = 4.5;
const UI_CONTRAST_RATIO = 3;

const WHITE = "#ffffff";
const INK = "#0f172a";

type Rgb = readonly [number, number, number];

export const DEFAULT_AFTERCARE_THEME: AftercareTheme = {
  "--cg-brand": "#155e75",
  "--cg-on-brand": WHITE,
  "--cg-accent": "#b45309",
  "--cg-surface": WHITE,
  "--cg-surface-subtle": "#f8fafc",
  "--cg-text": INK,
  "--cg-text-muted": "#475569",
  "--cg-border": "#e2e8f0",
  "--cg-warning": "#b45309",
  "--cg-warning-surface": "#fffbeb",
  "--cg-emergency": "#b91c1c",
  "--cg-emergency-surface": "#fef2f2",
  "--cg-focus": "#155e75",
};

export function resolveAftercareTheme(
  input: AftercareThemeInput | null | undefined
): AftercareTheme {
  const theme: AftercareTheme = { ...DEFAULT_AFTERCARE_THEME };
  const primary = parseCssHexColor(input?.primaryColor);
  const accent = parseCssHexColor(input?.accentColor);

  if (primary) {
    const onBrand = readableForeground(primary);
    if (onBrand) {
      theme["--cg-brand"] = primary;
      theme["--cg-on-brand"] = onBrand;
    }
  }

  if (accent) {
    theme["--cg-accent"] = accent;
  }

  theme["--cg-focus"] = focusColor(theme["--cg-brand"], theme["--cg-surface"]);

  return theme;
}

export function toAftercareThemeStyle(theme: AftercareTheme): CSSProperties {
  return theme as CSSProperties;
}

function parseCssHexColor(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const candidate = value.trim();
  const match = HEX_COLOR_PATTERN.exec(candidate);
  if (!match) {
    return null;
  }

  const hex = match[1];
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }

  return `#${hex.toLowerCase()}`;
}

function readableForeground(background: string): string | null {
  const whiteContrast = contrastRatio(background, WHITE);
  const inkContrast = contrastRatio(background, INK);
  const best =
    whiteContrast >= inkContrast
      ? { color: WHITE, ratio: whiteContrast }
      : { color: INK, ratio: inkContrast };

  return best.ratio >= TEXT_CONTRAST_RATIO ? best.color : null;
}

function focusColor(brand: string, surface: string): string {
  return contrastRatio(brand, surface) >= UI_CONTRAST_RATIO
    ? brand
    : DEFAULT_AFTERCARE_THEME["--cg-focus"];
}

function contrastRatio(a: string, b: string): number {
  const luminanceA = relativeLuminance(hexToRgb(a));
  const luminanceB = relativeLuminance(hexToRgb(b));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function relativeLuminance([red, green, blue]: Rgb): number {
  return (
    0.2126 * linearizeSrgbChannel(red) +
    0.7152 * linearizeSrgbChannel(green) +
    0.0722 * linearizeSrgbChannel(blue)
  );
}

function linearizeSrgbChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
