"use client";

import { clinicDefaultPreviewLabel } from "@/lib/branding/aftercare-theme";
import {
  followPortalPreviewLabel,
  type PreviewAppearanceChoice,
} from "@/lib/branding/preview-appearance";
import type { ThemePreference } from "@/lib/branding/theme-preference";

export function PatientPreviewAppearanceSelect({
  value,
  clinicThemeMode,
  portalPreference,
  onChange,
}: {
  value: PreviewAppearanceChoice;
  clinicThemeMode?: string | null;
  portalPreference: ThemePreference;
  onChange: (value: PreviewAppearanceChoice) => void;
}) {
  const options: { value: PreviewAppearanceChoice; label: string }[] = [
    { value: "portal", label: followPortalPreviewLabel(portalPreference) },
    { value: "clinic", label: clinicDefaultPreviewLabel(clinicThemeMode) },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <label className="staffPreviewAppearance">
      <span>Patient preview</span>
      <select
        value={value}
        aria-label="Patient preview appearance"
        onChange={(event) =>
          onChange(event.target.value as PreviewAppearanceChoice)
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
