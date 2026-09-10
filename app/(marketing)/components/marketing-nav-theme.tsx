"use client";

import { useEffect, useId, useState } from "react";

import {
  applyThemePreference,
  MARKETING_THEME_STORAGE_KEY,
  parseThemePreference,
  type ThemePreference,
} from "@/lib/branding/theme-preference";

import styles from "../marketing.module.css";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function MarketingNavTheme() {
  const chooserId = useId().replace(/:/g, "");
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = parseThemePreference(
      localStorage.getItem(MARKETING_THEME_STORAGE_KEY)
    );
    if (stored) {
      setPreference(stored);
    }
  }, []);

  const currentLabel =
    OPTIONS.find((option) => option.value === preference)?.label ?? "System";

  function selectPreference(next: ThemePreference) {
    setPreference(next);
    applyThemePreference(next);
    localStorage.setItem(MARKETING_THEME_STORAGE_KEY, next);
  }

  return (
    <div className={styles.navMenuTheme}>
      <button
        type="button"
        className={styles.navMenuRow}
        aria-expanded={expanded}
        aria-controls={`mk-theme-${chooserId}`}
        onClick={() => setExpanded((open) => !open)}
      >
        <span>Theme</span>
        <span className={styles.navMenuRowMeta}>{currentLabel}</span>
      </button>
      {expanded ? (
        <div
          id={`mk-theme-${chooserId}`}
          role="radiogroup"
          aria-label="Colour theme"
          className={styles.navMenuChooser}
        >
          {OPTIONS.map((option) => {
            const selected = preference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.navMenuRow}
                onClick={() => selectPreference(option.value)}
              >
                {option.label}
                {selected ? (
                  <span className={styles.navMenuRowMeta} aria-hidden="true">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
