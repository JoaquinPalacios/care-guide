"use client";

import { useState } from "react";

import { PatientThemeBoundary } from "@/app/(aftercare)/components/patient-theme-boundary";
import { RecoveryTimelineList } from "@/app/(aftercare)/components/recovery-timeline-list";
import { PatientPreviewAppearanceSelect } from "@/app/(staff)/components/patient-preview-appearance-select";
import { usePortalThemePreference } from "@/app/(staff)/components/use-portal-theme-preference";
import { editorStagesToPreviewSections } from "@/lib/clinic-portal/editor-preview-sections";
import {
  resolvePreviewPatientTheme,
  type PreviewAppearanceChoice,
} from "@/lib/branding/preview-appearance";

import styles from "./editor-live-preview.module.css";

export function EditorLivePreview({
  stages,
  clinicThemeMode,
}: {
  stages: Array<{
    key: string;
    title: string;
    body: string;
    periodLabel: string;
    startDay: string;
    endDay: string;
  }>;
  clinicThemeMode?: string | null;
}) {
  const [appearance, setAppearance] =
    useState<PreviewAppearanceChoice>("portal");
  const portalPreference = usePortalThemePreference();
  const patientTheme = resolvePreviewPatientTheme({
    choice: appearance,
    clinicThemeMode,
  });
  const sections = editorStagesToPreviewSections(stages);
  const appearanceControl = (
    <PatientPreviewAppearanceSelect
      value={appearance}
      clinicThemeMode={clinicThemeMode}
      portalPreference={portalPreference}
      onChange={setAppearance}
    />
  );

  if (sections.length === 0) {
    return (
      <PatientThemeBoundary appearance={patientTheme}>
        <div
          className={`${styles.preview} ${styles.emptyState}`}
          data-live-preview=""
        >
          <div className={styles.toolbar}>
            <h2 id="editor-live-timeline-heading" className={styles.heading}>
              Patient timeline preview
            </h2>
            {appearanceControl}
          </div>
          <p className={styles.empty}>
            Add a recovery stage to see the patient timeline here.
          </p>
        </div>
      </PatientThemeBoundary>
    );
  }

  return (
    <PatientThemeBoundary appearance={patientTheme}>
      <div className={styles.preview} data-live-preview="">
        <div className={styles.toolbar}>
          <p className="sr-only">
            Live preview of the patient recovery timeline from the current
            unsaved draft. Stage order and titles update as you edit. This is
            not the public patient page.
          </p>
          {appearanceControl}
        </div>
        <RecoveryTimelineList
          sections={sections}
          heading="Live patient timeline"
          headingId="editor-live-timeline-heading"
          compact
          labelledAsPreview
          classes={{
            timeline: "",
            sectionTitle: styles.title,
            timelineList: styles.list,
            timelineItem: styles.item,
            timelinePeriod: styles.period,
            timelineRail: styles.rail,
            timelineContent: styles.content,
          }}
        />
      </div>
    </PatientThemeBoundary>
  );
}
