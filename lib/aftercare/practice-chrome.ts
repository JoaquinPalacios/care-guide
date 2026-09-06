import { shouldShowDemoAftercareNotice } from "@/lib/aftercare/demo-tenant";
import {
  instructionLabel,
  parseInstructionTerminology,
  type InstructionTerminology,
} from "@/lib/aftercare/instruction-terminology";
import {
  toSafeHttpHref,
  toSafeLogoSrc,
  toTelHref,
} from "@/lib/aftercare/safe-href";
import {
  parseThemeMode,
  type ClinicThemeMode,
} from "@/lib/branding/theme-preference";

export interface PracticeChromeProfile {
  displayName: string;
  logoUrl: string | null;
  phone: string | null;
  bookingUrl: string | null;
  contactUrl: string | null;
  emergencyInstructions: string | null;
  showCareGuideAttribution: boolean;
  instructionTerminology?: string | null;
  themeMode?: string | null;
  allowPatientThemeToggle?: boolean | null;
}

export interface PracticeChrome {
  displayName: string;
  logoSrc: string | null;
  phoneDisplay: string | null;
  phoneHref: string | null;
  bookingHref: string | null;
  contactHref: string | null;
  emergencyInstructions: string | null;
  showCareGuideAttribution: boolean;
  showDemoNotice: boolean;
  instructionTerminology: InstructionTerminology;
  instructionsLabel: string;
  themeMode: ClinicThemeMode;
  allowPatientThemeToggle: boolean;
}

export function resolvePracticeChrome(input: {
  slug: string;
  name: string;
  profile: PracticeChromeProfile | null;
}): PracticeChrome {
  const profile = input.profile;
  const phoneDisplay = profile?.phone?.trim() || null;
  const emergencyInstructions = profile?.emergencyInstructions?.trim() || null;

  return {
    displayName: profile?.displayName?.trim() || input.name,
    logoSrc: toSafeLogoSrc(profile?.logoUrl ?? null),
    phoneDisplay,
    phoneHref: toTelHref(phoneDisplay),
    bookingHref: toSafeHttpHref(profile?.bookingUrl ?? null),
    contactHref: toSafeHttpHref(profile?.contactUrl ?? null),
    emergencyInstructions,
    showCareGuideAttribution: profile?.showCareGuideAttribution === true,
    showDemoNotice: shouldShowDemoAftercareNotice(input.slug),
    instructionTerminology: parseInstructionTerminology(
      profile?.instructionTerminology
    ),
    instructionsLabel: instructionLabel(profile?.instructionTerminology),
    themeMode: parseThemeMode(profile?.themeMode),
    allowPatientThemeToggle: profile?.allowPatientThemeToggle === true,
  };
}

export function hasPracticeContact(chrome: PracticeChrome): boolean {
  return Boolean(
    chrome.phoneHref || chrome.contactHref || chrome.emergencyInstructions
  );
}
