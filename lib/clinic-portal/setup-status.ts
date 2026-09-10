export type ClinicSetupState = "configured" | "needs_attention";

export interface ClinicSetupCheck {
  id: string;
  label: string;
  state: ClinicSetupState;
  detail: string;
}

export interface ClinicSetupInput {
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  themeMode: string | null;
  phone: string | null;
  contactUrl: string | null;
  emergencyInstructions: string | null;
  publishedGuideCount: number;
}

function present(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

export function clinicSetupChecks(input: ClinicSetupInput): ClinicSetupCheck[] {
  const identityConfigured =
    present(input.displayName) && present(input.logoUrl);
  const brandingConfigured =
    present(input.primaryColor) &&
    present(input.accentColor) &&
    present(input.themeMode);
  const contactConfigured = present(input.phone) || present(input.contactUrl);
  const emergencyConfigured = present(input.emergencyInstructions);
  const publishedConfigured = input.publishedGuideCount > 0;

  return [
    {
      id: "identity",
      label: "Clinic identity",
      state: identityConfigured ? "configured" : "needs_attention",
      detail: identityConfigured
        ? "Display name and logo are set."
        : "Add a patient-facing name and logo.",
    },
    {
      id: "branding",
      label: "Branding",
      state: brandingConfigured ? "configured" : "needs_attention",
      detail: brandingConfigured
        ? "Primary colour, accent, and theme are set."
        : "Primary colour, accent, or theme still needs attention.",
    },
    {
      id: "contact",
      label: "Contact details",
      state: contactConfigured ? "configured" : "needs_attention",
      detail: contactConfigured
        ? "Patients can reach this practice from the aftercare page."
        : "Add a phone number or contact URL.",
    },
    {
      id: "emergency",
      label: "Emergency guidance",
      state: emergencyConfigured ? "configured" : "needs_attention",
      detail: emergencyConfigured
        ? "Emergency copy is configured."
        : "Emergency guidance is missing.",
    },
    {
      id: "published",
      label: "Published guide",
      state: publishedConfigured ? "configured" : "needs_attention",
      detail: publishedConfigured
        ? input.publishedGuideCount === 1
          ? "One published guide is available to patients."
          : `${input.publishedGuideCount} published guides are available to patients.`
        : "No published guide is available yet.",
    },
  ];
}
