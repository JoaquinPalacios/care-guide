export interface OperatorClinicSummary {
  totalClinics: number;
  configuredClinics: number;
  publishedGuides: number;
  needsAttention: number;
}

export function summarizeOperatorClinics(
  clinics: readonly {
    setupLabel: string;
    publishedGuideCount: number;
  }[]
): OperatorClinicSummary {
  return {
    totalClinics: clinics.length,
    configuredClinics: clinics.filter(
      (clinic) => clinic.setupLabel === "Configured"
    ).length,
    publishedGuides: clinics.reduce(
      (total, clinic) => total + clinic.publishedGuideCount,
      0
    ),
    needsAttention: clinics.filter(
      (clinic) => clinic.setupLabel === "Needs attention"
    ).length,
  };
}
