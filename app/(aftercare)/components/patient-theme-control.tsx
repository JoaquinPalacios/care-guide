"use client";

import { AppearanceMenu } from "@/lib/branding/appearance-menu";
import { PATIENT_THEME_STORAGE_KEY } from "@/lib/branding/theme-preference";

export function PatientThemeControl() {
  return (
    <AppearanceMenu storageKey={PATIENT_THEME_STORAGE_KEY} classPrefix="ptc" />
  );
}
