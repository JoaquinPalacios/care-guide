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

export type PreviewPatientTheme = AftercareThemeAppearance | "portal";

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

export function resolvePreviewPatientTheme(input: {
  choice: PreviewAppearanceChoice;
  clinicThemeMode?: string | null;
}): PreviewPatientTheme {
  if (input.choice === "portal") {
    return "portal";
  }
  if (input.choice === "clinic") {
    return clinicThemeModeToAppearance(input.clinicThemeMode);
  }
  return input.choice;
}
