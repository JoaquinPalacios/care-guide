import "server-only";

import { PracticeGuideStatus } from "@prisma/client";
import { headers } from "next/headers";
import { cache } from "react";

import { clinicPatientSiteUrl } from "@/lib/clinic-portal/patient-site-url";
import {
  clinicSetupChecks,
  type ClinicSetupCheck,
} from "@/lib/clinic-portal/setup-status";
import { prisma } from "@/lib/prisma";

export interface ClinicPortalOverview {
  clinicId: string;
  clinicName: string;
  displayName: string;
  slug: string;
  patientSiteHref: string | null;
  publishedGuideCount: number;
  draftGuideCount: number;
  setup: ClinicSetupCheck[];
}

export const getClinicPortalOverview = cache(
  async (clinicId: string): Promise<ClinicPortalOverview | null> => {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: {
        id: true,
        name: true,
        slug: true,
        profile: {
          select: {
            displayName: true,
            logoUrl: true,
            primaryColor: true,
            accentColor: true,
            themeMode: true,
            phone: true,
            contactUrl: true,
            emergencyInstructions: true,
          },
        },
        practiceGuides: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!clinic) {
      return null;
    }

    const publishedGuideCount = clinic.practiceGuides.filter(
      (guide) => guide.status === PracticeGuideStatus.PUBLISHED
    ).length;
    const draftGuideCount = clinic.practiceGuides.filter(
      (guide) => guide.status === PracticeGuideStatus.DRAFT
    ).length;
    const displayName = clinic.profile?.displayName?.trim() || clinic.name;
    const requestHeaders = await headers();
    const host =
      requestHeaders.get("x-forwarded-host") ??
      requestHeaders.get("host") ??
      "";
    const protocol =
      requestHeaders.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");

    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      displayName,
      slug: clinic.slug,
      patientSiteHref: host
        ? clinicPatientSiteUrl({
            requestHost: host,
            clinicSlug: clinic.slug,
            protocol,
          })
        : null,
      publishedGuideCount,
      draftGuideCount,
      setup: clinicSetupChecks({
        displayName: clinic.profile?.displayName ?? null,
        logoUrl: clinic.profile?.logoUrl ?? null,
        primaryColor: clinic.profile?.primaryColor ?? null,
        accentColor: clinic.profile?.accentColor ?? null,
        themeMode: clinic.profile?.themeMode ?? null,
        phone: clinic.profile?.phone ?? null,
        contactUrl: clinic.profile?.contactUrl ?? null,
        emergencyInstructions: clinic.profile?.emergencyInstructions ?? null,
        publishedGuideCount,
      }),
    };
  }
);
