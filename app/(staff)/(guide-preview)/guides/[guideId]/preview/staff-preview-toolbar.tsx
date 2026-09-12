"use client";

import Link from "next/link";

import { GuideStatusPills } from "@/app/(staff)/components/guide-status-pills";
import { BackArrowIcon } from "@/app/(staff)/components/icons";
import { clinicDefaultPreviewLabel } from "@/lib/branding/aftercare-theme";
import type { ClinicGuideLifecycleStatus } from "@/lib/clinic-portal/guide-status";

export type PreviewAppearanceChoice = "default" | "light" | "dark";

export function StaffPreviewToolbar({
  backHref,
  backLabel,
  editHref,
  lifecycle,
  appearance = "default",
  clinicThemeMode,
  onAppearanceChange,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
  lifecycle?: ClinicGuideLifecycleStatus;
  appearance?: PreviewAppearanceChoice;
  clinicThemeMode?: string | null;
  onAppearanceChange?: (value: PreviewAppearanceChoice) => void;
}) {
  const appearanceOptions: {
    value: PreviewAppearanceChoice;
    label: string;
  }[] = [
    { value: "default", label: clinicDefaultPreviewLabel(clinicThemeMode) },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  return (
    <header className="staffPreviewToolbar">
      <Link href={backHref} className="staffPreviewBack">
        <BackArrowIcon />
        {backLabel}
      </Link>
      <div className="staffPreviewStatus flex flex-col items-center gap-1">
        <p className="m-0">Draft preview</p>
        {lifecycle ? <GuideStatusPills lifecycle={lifecycle} /> : null}
      </div>
      <div className="staffPreviewToolbarEnd">
        {onAppearanceChange ? (
          <label className="staffPreviewAppearance">
            <span>Patient preview</span>
            <select
              value={appearance}
              aria-label="Patient preview appearance"
              onChange={(event) =>
                onAppearanceChange(
                  event.target.value as PreviewAppearanceChoice
                )
              }
            >
              {appearanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {editHref ? (
          <Link href={editHref} className="staffPreviewEdit">
            Edit guide
          </Link>
        ) : (
          <span />
        )}
      </div>
    </header>
  );
}
