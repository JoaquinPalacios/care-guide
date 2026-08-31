import { shouldShowDemoAftercareNotice } from "@/lib/aftercare/demo-tenant";
import {
  toSafeHttpHref,
  toSafeLogoSrc,
  toTelHref,
} from "@/lib/aftercare/safe-href";

export interface PracticeChromeProfile {
  displayName: string;
  logoUrl: string | null;
  phone: string | null;
  bookingUrl: string | null;
  contactUrl: string | null;
  emergencyInstructions: string | null;
  showCareGuideAttribution: boolean;
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
  };
}

export function hasPracticeContact(chrome: PracticeChrome): boolean {
  return Boolean(
    chrome.phoneHref ||
    chrome.bookingHref ||
    chrome.contactHref ||
    chrome.emergencyInstructions
  );
}
