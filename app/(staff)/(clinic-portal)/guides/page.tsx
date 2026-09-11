import type { Metadata } from "next";
import Link from "next/link";
import { ClinicMembershipRole } from "@prisma/client";

import { GuideListItem } from "@/app/(staff)/(clinic-portal)/guides/guide-list-item";
import { requireStaffSession } from "@/lib/auth/require-staff-session";
import { getClinicPortalOverview } from "@/lib/clinic-portal/get-clinic-portal";
import { listClinicPortalGuides } from "@/lib/clinic-portal/list-clinic-guides";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const metadata: Metadata = {
  title: `Guides · ${PRODUCT_NAME}`,
  description: "Practice aftercare guides for the signed-in clinic.",
};

export default async function ClinicGuidesPage() {
  const { clinicMembership } = await requireStaffSession();
  const clinicId = clinicMembership.clinic.id;
  const canManage = clinicMembership.role === ClinicMembershipRole.ADMIN;
  const [overview, guides] = await Promise.all([
    getClinicPortalOverview(clinicId),
    listClinicPortalGuides(clinicId),
  ]);
  const displayName = overview?.displayName ?? clinicMembership.clinic.name;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
            Guides
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-staff-ink">
            Guides
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-staff-muted">
            Patient aftercare instructions for {displayName}.
          </p>
        </div>
        {canManage ? (
          <Link href="/guides/new" className="staffBtn staffBtnPrimary">
            Create guide
          </Link>
        ) : null}
      </header>

      {guides.length === 0 ? (
        <p className="rounded-xl border border-dashed border-staff-line bg-staff-panel px-5 py-8 text-sm leading-6 text-staff-muted">
          No guides have been configured for this practice yet.
        </p>
      ) : (
        <ul className="divide-y divide-staff-line overflow-hidden rounded-xl border border-staff-line bg-staff-panel shadow-sm">
          {guides.map((guide) => (
            <GuideListItem key={guide.id} guide={guide} canManage={canManage} />
          ))}
        </ul>
      )}
    </div>
  );
}
