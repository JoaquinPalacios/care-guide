import type { ReactNode } from "react";

import {
  AFTERCARE_THEME_SCOPE,
  clinicThemeModeToAppearance,
  type AftercareThemeAppearance,
} from "@/lib/branding/aftercare-theme";

export function PatientThemeBoundary({
  themeMode,
  appearance,
  children,
}: {
  themeMode?: string | null;
  appearance?: AftercareThemeAppearance | "portal";
  children: ReactNode;
}) {
  const patientTheme = appearance ?? clinicThemeModeToAppearance(themeMode);
  const colorScheme =
    patientTheme === "portal"
      ? undefined
      : patientTheme === "light"
        ? "light"
        : patientTheme === "dark"
          ? "dark"
          : "light dark";

  return (
    <div
      className={AFTERCARE_THEME_SCOPE}
      data-patient-theme={patientTheme}
      style={colorScheme ? { colorScheme } : undefined}
    >
      {children}
    </div>
  );
}
