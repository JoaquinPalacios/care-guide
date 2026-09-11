"use client";

import { useState, type ReactNode } from "react";

import { PatientThemeBoundary } from "@/app/(aftercare)/components/patient-theme-boundary";
import {
  StaffPreviewToolbar,
  type PreviewAppearanceChoice,
} from "@/app/(staff)/(guide-preview)/guides/[guideId]/preview/staff-preview-toolbar";
import {
  clinicThemeModeToAppearance,
  type AftercareThemeAppearance,
} from "@/lib/branding/aftercare-theme";
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
    useState<PreviewAppearanceChoice>("default");
  const clinicAppearance = clinicThemeModeToAppearance(clinicThemeMode);
  const patientTheme: AftercareThemeAppearance =
    appearance === "default" ? clinicAppearance : appearance;

  return (
    <div className="staffPreviewShell">
      <StaffPreviewToolbar
        backHref={backHref}
        backLabel={backLabel}
        editHref={editHref}
        lifecycle={lifecycle}
        appearance={appearance}
        onAppearanceChange={setAppearance}
      />
      <PatientThemeBoundary appearance={patientTheme}>
        {children}
      </PatientThemeBoundary>
    </div>
  );
}
