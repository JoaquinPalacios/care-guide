"use client";

import { useEffect, useState } from "react";

import {
  PATIENT_THEME_STORAGE_KEY,
  applyThemePreference,
  parseThemePreference,
  type ThemePreference,
} from "@/lib/branding/theme-preference";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function PatientThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = parseThemePreference(
      localStorage.getItem(PATIENT_THEME_STORAGE_KEY)
    );
    if (stored) {
      setPreference(stored);
    }
  }, []);

  return (
    <fieldset className="ptc" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="patient-theme"
            value={option.value}
            checked={preference === option.value}
            onChange={() => {
              setPreference(option.value);
              applyThemePreference(option.value);
              localStorage.setItem(PATIENT_THEME_STORAGE_KEY, option.value);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
