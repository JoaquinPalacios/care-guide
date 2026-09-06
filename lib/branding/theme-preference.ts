export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const CLINIC_THEME_MODES = ["LIGHT", "DARK", "SYSTEM"] as const;

export type ClinicThemeMode = (typeof CLINIC_THEME_MODES)[number];

export const MARKETING_THEME_STORAGE_KEY = "aftercare-guide-marketing-theme";
export const PATIENT_THEME_STORAGE_KEY = "aftercare-guide-patient-theme";

export function parseThemeMode(
  value: string | null | undefined
): ClinicThemeMode {
  if (typeof value !== "string") {
    return "SYSTEM";
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === "LIGHT" ||
    normalized === "DARK" ||
    normalized === "SYSTEM"
  ) {
    return normalized;
  }

  return "SYSTEM";
}

export function parseThemePreference(
  value: string | null | undefined
): ThemePreference | null {
  if (value === "system" || value === "light" || value === "dark") {
    return value;
  }

  return null;
}

export function colorSchemeForThemeMode(mode: ClinicThemeMode): string {
  if (mode === "LIGHT") {
    return "light";
  }

  if (mode === "DARK") {
    return "dark";
  }

  return "light dark";
}

export function applyThemePreference(preference: ThemePreference): void {
  document.documentElement.setAttribute("data-theme-mode", preference);
}

export function themePreferenceBootstrapScript(storageKey: string): string {
  const key = JSON.stringify(storageKey);
  return `(function(){try{var v=localStorage.getItem(${key});if(v==="light"||v==="dark"||v==="system"){document.documentElement.setAttribute("data-theme-mode",v);}}catch(e){}})();`;
}
