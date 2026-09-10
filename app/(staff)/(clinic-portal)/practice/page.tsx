import type { Metadata } from "next";
import { ClinicMembershipRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { PracticeSettingsForm } from "@/app/(staff)/(clinic-portal)/practice/practice-settings-form";
import { requireClinicAdmin } from "@/lib/auth/require-clinic-admin";
import { getClinicPortalOverview } from "@/lib/clinic-portal/get-clinic-portal";
import { prisma } from "@/lib/prisma";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const metadata: Metadata = {
  title: `Practice · ${PRODUCT_NAME}`,
  description: "Practice identity, branding, and contact settings.",
};

export default async function PracticePage() {
  const { clinicMembership } = await requireClinicAdmin();
  const [overview, profile] = await Promise.all([
    getClinicPortalOverview(clinicMembership.clinic.id),
    prisma.clinicProfile.findUnique({
      where: { clinicId: clinicMembership.clinic.id },
    }),
  ]);

  if (!overview) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
          Practice
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {overview.displayName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-staff-muted">
          Identity, branding, contact, and emergency details used on the patient
          site. Tenant hostname stays operator-controlled.
        </p>
      </header>
      <PracticeSettingsForm
        canEdit={clinicMembership.role === ClinicMembershipRole.ADMIN}
        patientSiteHref={overview.patientSiteHref}
        values={{
          displayName: profile?.displayName || overview.displayName,
          logoUrl: profile?.logoUrl ?? null,
          primaryColor: profile?.primaryColor ?? null,
          accentColor: profile?.accentColor ?? null,
          neutralColor: profile?.neutralColor ?? null,
          radiusPreset: profile?.radiusPreset ?? "MEDIUM",
          instructionTerminology:
            profile?.instructionTerminology ?? "AFTERCARE",
          themeMode: profile?.themeMode ?? "SYSTEM",
          allowPatientThemeToggle: profile?.allowPatientThemeToggle ?? false,
          phone: profile?.phone ?? null,
          contactUrl: profile?.contactUrl ?? null,
          addressLine1: profile?.addressLine1 ?? null,
          addressLine2: profile?.addressLine2 ?? null,
          city: profile?.city ?? null,
          region: profile?.region ?? null,
          postalCode: profile?.postalCode ?? null,
          emergencyInstructions: profile?.emergencyInstructions ?? null,
        }}
      />
    </div>
  );
}
