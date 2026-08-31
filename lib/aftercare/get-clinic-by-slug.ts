import "server-only";

import { prisma } from "@/lib/prisma";
import { isValidCareGuideSlug } from "@/lib/aftercare/slug";

export interface ClinicBySlugRecord {
  id: string;
  slug: string;
  name: string;
  profile: {
    displayName: string;
    logoUrl: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    bookingUrl: string | null;
    contactUrl: string | null;
    contactEmail: string | null;
    emergencyInstructions: string | null;
    showCareGuideAttribution: boolean;
  } | null;
}

export const clinicBySlugSelect = {
  id: true,
  slug: true,
  name: true,
  profile: {
    select: {
      displayName: true,
      logoUrl: true,
      primaryColor: true,
      accentColor: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      bookingUrl: true,
      contactUrl: true,
      contactEmail: true,
      emergencyInstructions: true,
      showCareGuideAttribution: true,
    },
  },
} as const;

export async function getClinicBySlug(
  slug: string
): Promise<ClinicBySlugRecord | null> {
  if (!isValidCareGuideSlug(slug)) {
    return null;
  }

  return prisma.clinic.findUnique({
    where: { slug },
    select: clinicBySlugSelect,
  });
}
