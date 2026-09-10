import "server-only";

import { GuideRevisionStatus, PracticeGuideStatus } from "@prisma/client";
import { headers } from "next/headers";

import { clinicPatientSiteUrl } from "@/lib/clinic-portal/patient-site-url";
import { prisma } from "@/lib/prisma";

export interface ClinicPortalGuide {
  id: string;
  title: string;
  publicSlug: string;
  status: PracticeGuideStatus;
  isEnabled: boolean;
  templateSlug: string;
  specialty: string;
  updatedAt: Date;
  previewHref: string | null;
}

export async function listClinicPortalGuides(
  clinicId: string
): Promise<ClinicPortalGuide[]> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, slug: true },
  });

  if (!clinic) {
    return [];
  }

  const guides = await prisma.practiceGuide.findMany({
    where: { clinicId: clinic.id },
    orderBy: [{ sortOrder: "asc" }, { publicSlug: "asc" }],
    select: {
      id: true,
      publicSlug: true,
      status: true,
      isEnabled: true,
      updatedAt: true,
      guideTemplate: {
        select: {
          title: true,
          slug: true,
          specialty: true,
        },
      },
      pinnedRevision: {
        select: {
          status: true,
        },
      },
    },
  });

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return guides.map((guide) => {
    const canPreview =
      guide.isEnabled &&
      guide.status === PracticeGuideStatus.PUBLISHED &&
      guide.pinnedRevision.status === GuideRevisionStatus.PUBLISHED;
    const previewHref =
      canPreview && host
        ? clinicPatientSiteUrl({
            requestHost: host,
            clinicSlug: clinic.slug,
            protocol,
            pathname: `/${guide.publicSlug}`,
          })
        : null;

    return {
      id: guide.id,
      title: guide.guideTemplate.title,
      publicSlug: guide.publicSlug,
      status: guide.status,
      isEnabled: guide.isEnabled,
      templateSlug: guide.guideTemplate.slug,
      specialty: guide.guideTemplate.specialty,
      updatedAt: guide.updatedAt,
      previewHref,
    };
  });
}
