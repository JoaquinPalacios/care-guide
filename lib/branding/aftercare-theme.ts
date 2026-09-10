/**
 * Maps ClinicProfile colour and radius fields to semantic CSS custom properties.
 * Framework-light and Prisma-free: pass already-loaded profile values in.
 * Colour fields must be hex. Arbitrary CSS (url(), var(), calc(), statements) is rejected.
 * Dark-scheme surfaces are derived tokens, not inverted brand colours.
 */
import type { CSSProperties } from "react";

import {
  colorSchemeForThemeMode,
  parseThemeMode,
} from "@/lib/branding/theme-preference";

export const AFTERCARE_THEME_SCOPE = "aftercareTheme";

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
  "--cg-radius",
  "--cg-recovery-surface",
] as const;

export type AftercareThemeTokenName =
  (typeof AFTERCARE_THEME_TOKEN_KEYS)[number];

export type AftercareThemeTokens = {
  [K in AftercareThemeTokenName]: string;
};

export interface AftercareTheme {
  light: AftercareThemeTokens;
  dark: AftercareThemeTokens;
}

export type AftercareRadiusPreset = "SHARP" | "MEDIUM" | "SOFT";

export interface AftercareThemeInput {
  primaryColor: string | null;
  accentColor: string | null;
  neutralColor?: string | null;
  radiusPreset?: string | null;
  themeMode?: string | null;
}

export interface AftercareThemeCssOptions {
  themeMode?: string | null;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const TEXT_CONTRAST_RATIO = 4.5;
const UI_CONTRAST_RATIO = 3;
const LIGHT_SURFACE_MIN_LUMINANCE = 0.72;

const WHITE = "#ffffff";
const INK = "#0f172a";
const TEXT = "#111318";
const MUTED_INK = "#4b5563";
const PAPER = "#f7f7f5";
const CLINICAL_MIST = "#f6faf9";
const DARK_PAPER = "#f4f1ea";
const DARK_MUTED = "#9aa3ad";
const DARK_SURFACE = "#111318";
const DARK_SURFACE_SUBTLE = "#171a1f";
const DARK_RECOVERY = "#151a1a";
const DARK_BORDER = "#2a3038";

type Rgb = readonly [number, number, number];

export const RADIUS_PRESET_VALUES: Record<AftercareRadiusPreset, string> = {
  SHARP: "0.25rem",
  MEDIUM: "0.75rem",
  SOFT: "1.25rem",
};

const DEFAULT_LIGHT: AftercareThemeTokens = {
  "--cg-brand": "#155e75",
  "--cg-on-brand": WHITE,
  "--cg-accent": "#b45309",
  "--cg-surface": WHITE,
  "--cg-surface-subtle": PAPER,
  "--cg-text": TEXT,
  "--cg-text-muted": MUTED_INK,
  "--cg-border": "#ecece8",
  "--cg-warning": "#b45309",
  "--cg-warning-surface": "#fffbeb",
  "--cg-emergency": "#b91c1c",
  "--cg-emergency-surface": "#fef2f2",
  "--cg-focus": "#155e75",
  "--cg-radius": RADIUS_PRESET_VALUES.MEDIUM,
  "--cg-recovery-surface": mixHex(CLINICAL_MIST, "#155e75", 0.035),
};

const DEFAULT_DARK: AftercareThemeTokens = {
  "--cg-brand": DEFAULT_LIGHT["--cg-brand"],
  "--cg-on-brand": DEFAULT_LIGHT["--cg-on-brand"],
  "--cg-accent": DEFAULT_LIGHT["--cg-accent"],
  "--cg-surface": DARK_SURFACE,
  "--cg-surface-subtle": DARK_SURFACE_SUBTLE,
  "--cg-text": DARK_PAPER,
  "--cg-text-muted": DARK_MUTED,
  "--cg-border": DARK_BORDER,
  "--cg-warning": "#f59e0b",
  "--cg-warning-surface": "#24180c",
  "--cg-emergency": "#e07a7a",
  "--cg-emergency-surface": "#1c1416",
  "--cg-focus": "#155e75",
  "--cg-radius": RADIUS_PRESET_VALUES.MEDIUM,
  "--cg-recovery-surface": mixHex(DARK_RECOVERY, "#155e75", 0.07),
};

export const DEFAULT_AFTERCARE_THEME: AftercareTheme = {
  light: DEFAULT_LIGHT,
  dark: DEFAULT_DARK,
};

export function resolveAftercareTheme(
  input: AftercareThemeInput | null | undefined
): AftercareTheme {
  const light: AftercareThemeTokens = { ...DEFAULT_LIGHT };
  const dark: AftercareThemeTokens = { ...DEFAULT_DARK };
  const primary = parseCssHexColor(input?.primaryColor);
  const accent = parseCssHexColor(input?.accentColor);
  const neutral = parseCssHexColor(input?.neutralColor);
  const radius = parseRadiusPreset(input?.radiusPreset);

  if (primary) {
    const onBrand = readableForeground(primary);
    if (onBrand) {
      light["--cg-brand"] = primary;
      light["--cg-on-brand"] = onBrand;
      dark["--cg-brand"] = primary;
      dark["--cg-on-brand"] = onBrand;
    }
  }

  if (accent) {
    light["--cg-accent"] = accent;
    dark["--cg-accent"] = accent;
  }

  if (neutral && canUseAsLightSurface(neutral)) {
    applyNeutralSurface(light, dark, neutral);
  }

  light["--cg-radius"] = radius;
  dark["--cg-radius"] = radius;
  light["--cg-focus"] = focusColor(light["--cg-brand"], light["--cg-surface"]);
  dark["--cg-focus"] = focusColor(dark["--cg-brand"], dark["--cg-surface"]);
  light["--cg-recovery-surface"] = mixHex(
    CLINICAL_MIST,
    light["--cg-brand"],
    0.035
  );
  dark["--cg-recovery-surface"] = mixHex(
    DARK_RECOVERY,
    dark["--cg-brand"],
    0.07
  );

  return { light, dark };
}

export function toAftercareThemeStyle(theme: AftercareTheme): CSSProperties {
  return theme.light as CSSProperties;
}

export function serializeAftercareThemeCss(
  theme: AftercareTheme,
  options?: AftercareThemeCssOptions
): string {
  const mode = parseThemeMode(options?.themeMode);
  const colorScheme = colorSchemeForThemeMode(mode);
  const tokens = AFTERCARE_THEME_TOKEN_KEYS.map((key) => {
    const light = theme.light[key];
    const dark = theme.dark[key];
    const value = light === dark ? light : `light-dark(${light},${dark})`;
    return `${key}:${value}`;
  }).join(";");

  return `html{color-scheme:${colorScheme}}.${AFTERCARE_THEME_SCOPE}{${tokens}}`;
}

function parseRadiusPreset(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return RADIUS_PRESET_VALUES.MEDIUM;
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === "SHARP" ||
    normalized === "MEDIUM" ||
    normalized === "SOFT"
  ) {
    return RADIUS_PRESET_VALUES[normalized];
  }

  return RADIUS_PRESET_VALUES.MEDIUM;
}

export function parseCssHexColor(
  value: string | null | undefined
): string | null {
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

function canUseAsLightSurface(color: string): boolean {
  if (relativeLuminance(hexToRgb(color)) < LIGHT_SURFACE_MIN_LUMINANCE) {
    return false;
  }

  return contrastRatio(color, INK) >= TEXT_CONTRAST_RATIO;
}

function applyNeutralSurface(
  light: AftercareThemeTokens,
  dark: AftercareThemeTokens,
  neutral: string
): void {
  light["--cg-surface"] = WHITE;
  light["--cg-surface-subtle"] = mixHex(WHITE, neutral, 0.55);
  light["--cg-border"] = mixHex(WHITE, INK, 0.08);
  light["--cg-text"] = TEXT;
  light["--cg-text-muted"] = mixHex(TEXT, WHITE, 0.32);

  dark["--cg-surface"] = DARK_SURFACE;
  dark["--cg-surface-subtle"] = mixHex(DARK_SURFACE_SUBTLE, neutral, 0.08);
  dark["--cg-border"] = DARK_BORDER;
  dark["--cg-text"] = DARK_PAPER;
  dark["--cg-text-muted"] = DARK_MUTED;
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
    : DEFAULT_LIGHT["--cg-focus"];
}

function contrastRatio(a: string, b: string): number {
  const luminanceA = relativeLuminance(hexToRgb(a));
  const luminanceB = relativeLuminance(hexToRgb(b));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(a: string, b: string, amountTowardB: number): string {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  const t = Math.min(1, Math.max(0, amountTowardB));
  const mixed: Rgb = [
    Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * t),
    Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * t),
    Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * t),
  ];
  return rgbToHex(mixed);
}

function rgbToHex([red, green, blue]: Rgb): string {
  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
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
