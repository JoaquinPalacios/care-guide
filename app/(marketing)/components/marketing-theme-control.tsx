"use client";

import { useEffect, useState } from "react";

import {
  MARKETING_THEME_STORAGE_KEY,
  applyThemePreference,
  parseThemePreference,
  type ThemePreference,
} from "@/lib/branding/theme-preference";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function MarketingThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = parseThemePreference(
      localStorage.getItem(MARKETING_THEME_STORAGE_KEY)
    );
    if (stored) {
      setPreference(stored);
    }
  }, []);

  return (
    <fieldset className="mtc" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="marketing-theme"
            value={option.value}
            checked={preference === option.value}
            onChange={() => {
              setPreference(option.value);
              applyThemePreference(option.value);
              localStorage.setItem(MARKETING_THEME_STORAGE_KEY, option.value);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
