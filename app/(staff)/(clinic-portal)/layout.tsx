import type { ReactNode } from "react";

import { PortalChrome } from "@/app/(staff)/components/portal-chrome";
import { requireStaffSession } from "@/lib/auth/require-staff-session";
import { getClinicPortalOverview } from "@/lib/clinic-portal/get-clinic-portal";

export default async function ClinicPortalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { user, clinicMembership } = await requireStaffSession();
  const overview = await getClinicPortalOverview(clinicMembership.clinic.id);
  const displayName = overview?.displayName ?? clinicMembership.clinic.name;
  const roleLabel = clinicMembership.role === "ADMIN" ? "Admin" : "Staff";

  return (
    <PortalChrome
      displayName={displayName}
      userLabel={user.name?.trim() || user.email}
      roleLabel={roleLabel}
      patientSiteHref={overview?.patientSiteHref ?? null}
    >
      {children}
    </PortalChrome>
  );
}
