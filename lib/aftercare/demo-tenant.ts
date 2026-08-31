/**
 * Phase 1 technical-demo notice. Easy to delete once reviewed clinical
 * content ships. Do not treat this as a permanent paying-practice feature.
 */
export const DEMO_AFTERCARE_NOTICE =
  "Demo aftercare content — not clinical advice.";

const DEMO_AFTERCARE_TENANT_SLUGS = new Set(["demodental"]);

export function shouldShowDemoAftercareNotice(clinicSlug: string): boolean {
  return DEMO_AFTERCARE_TENANT_SLUGS.has(clinicSlug);
}
