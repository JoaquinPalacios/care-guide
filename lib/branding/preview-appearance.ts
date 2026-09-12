import { clinicThemeModeToAppearance } from "@/lib/branding/aftercare-theme";
import type { AftercareThemeAppearance } from "@/lib/branding/aftercare-theme";
import type { ThemePreference } from "@/lib/branding/theme-preference";

export const PREVIEW_APPEARANCE_CHOICES = [
  "portal",
  "clinic",
  "light",
  "dark",
] as const;

export type PreviewAppearanceChoice =
  (typeof PREVIEW_APPEARANCE_CHOICES)[number];

export type EffectivePreviewAppearance = AftercareThemeAppearance;

export function followPortalPreviewLabel(
  preference: ThemePreference | null | undefined
): string {
  if (preference === "light") {
    return "Follow portal (Light)";
  }
  if (preference === "dark") {
    return "Follow portal (Dark)";
  }
  return "Follow portal (System)";
}

/**
 * One appearance for authenticated preview chrome and the patient surface.
 * Public tenant pages do not use this helper.
 */
export function resolveEffectivePreviewAppearance(input: {
  choice: PreviewAppearanceChoice;
  clinicThemeMode?: string | null;
  portalPreference?: ThemePreference | null;
}): EffectivePreviewAppearance {
  if (input.choice === "light" || input.choice === "dark") {
    return input.choice;
  }

  if (input.choice === "clinic") {
    return clinicThemeModeToAppearance(input.clinicThemeMode);
  }

  if (input.portalPreference === "light" || input.portalPreference === "dark") {
    return input.portalPreference;
  }

  return "system";
}
