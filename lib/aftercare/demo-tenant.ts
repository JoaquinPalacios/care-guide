/**
 * Demo-only aftercare flags. Easy to delete once a paying practice ships.
 * Do not treat this as a permanent product feature or as persisted patient state.
 */
export const DEMO_AFTERCARE_TENANT_SLUG = "demodental";

export const DEMO_BANNER_TITLE = "Interactive demo";
export const DEMO_BANNER_COPY =
  "Sample content only · Not clinical advice · Changes aren't saved";

/** @deprecated Use DEMO_BANNER_TITLE / DEMO_BANNER_COPY. Kept for notice tests. */
export const DEMO_AFTERCARE_NOTICE = `${DEMO_BANNER_TITLE}. ${DEMO_BANNER_COPY}`;

export const DEMO_PRINT_SAMPLE_NOTICE = "SAMPLE / NOT CLINICAL ADVICE";

export const DEMO_CHECK_IN_ENABLED = true;

/**
 * Explicit demo fixture. Do not infer recovery day from the real calendar.
 * A future product version requires a persisted RecoveryPlan with startedAt —
 * not Date.now() and not the parked chairside session model.
 */
export const DEMO_RECOVERY_FIXTURE = {
  simulatedDay: 1,
  recoveryWindowDays: 7,
} as const;

export const DEMO_CHECK_IN_FEELINGS = [
  { value: "rough", label: "Rough" },
  { value: "struggling", label: "Struggling" },
  { value: "neutral", label: "Neutral" },
  { value: "good", label: "Good" },
  { value: "great", label: "Great" },
] as const;

export type DemoCheckInFeeling =
  (typeof DEMO_CHECK_IN_FEELINGS)[number]["value"];

const DEMO_AFTERCARE_TENANT_SLUGS = new Set([DEMO_AFTERCARE_TENANT_SLUG]);

export function shouldShowDemoAftercareNotice(clinicSlug: string): boolean {
  return DEMO_AFTERCARE_TENANT_SLUGS.has(clinicSlug);
}

export function isDemoPatientExperienceEnabled(clinicSlug: string): boolean {
  return shouldShowDemoAftercareNotice(clinicSlug);
}

/**
 * Future clinic/plan gating. Demo fixture is enabled.
 * When false, the Check-in tab must not render.
 */
export function isDemoCheckInEnabled(
  enabled: boolean = DEMO_CHECK_IN_ENABLED
): boolean {
  return enabled;
}
