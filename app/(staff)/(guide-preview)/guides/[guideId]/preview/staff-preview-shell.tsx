"use client";

import { useState, type ReactNode } from "react";

import { PatientThemeBoundary } from "@/app/(aftercare)/components/patient-theme-boundary";
import { PatientPreviewAppearanceSelect } from "@/app/(staff)/components/patient-preview-appearance-select";
import { usePortalThemePreference } from "@/app/(staff)/components/use-portal-theme-preference";
import { StaffPreviewToolbar } from "@/app/(staff)/(guide-preview)/guides/[guideId]/preview/staff-preview-toolbar";
import {
  resolvePreviewPatientTheme,
  type PreviewAppearanceChoice,
} from "@/lib/branding/preview-appearance";
import type { ClinicGuideLifecycleStatus } from "@/lib/clinic-portal/guide-status";

export function StaffPreviewShell({
  backHref,
  backLabel,
  editHref,
  lifecycle,
  clinicThemeMode,
  children,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
  lifecycle?: ClinicGuideLifecycleStatus;
  clinicThemeMode?: string | null;
  children: ReactNode;
}) {
  const [appearance, setAppearance] =
    useState<PreviewAppearanceChoice>("portal");
  const portalPreference = usePortalThemePreference();
  const patientTheme = resolvePreviewPatientTheme({
    choice: appearance,
    clinicThemeMode,
  });

  return (
    <div className="staffPreviewShell">
      <StaffPreviewToolbar
        backHref={backHref}
        backLabel={backLabel}
        editHref={editHref}
        lifecycle={lifecycle}
        appearanceControl={
          <PatientPreviewAppearanceSelect
            value={appearance}
            clinicThemeMode={clinicThemeMode}
            portalPreference={portalPreference}
            onChange={setAppearance}
          />
        }
      />
      <PatientThemeBoundary appearance={patientTheme}>
        {children}
      </PatientThemeBoundary>
    </div>
  );
}
