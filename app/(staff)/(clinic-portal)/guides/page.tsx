import type { Metadata } from "next";
import { PracticeGuideStatus } from "@prisma/client";

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
  const [overview, guides] = await Promise.all([
    getClinicPortalOverview(clinicId),
    listClinicPortalGuides(clinicId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
          Guides
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-staff-ink">
          {overview?.displayName ?? clinicMembership.clinic.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-staff-muted">
          Aftercare guides configured for this practice.
        </p>
      </header>

      {guides.length === 0 ? (
        <p className="rounded-xl border border-dashed border-staff-line bg-staff-panel px-5 py-8 text-sm leading-6 text-staff-muted">
          No guides have been configured for this practice yet.
        </p>
      ) : (
        <ul className="divide-y divide-staff-line overflow-hidden rounded-xl border border-staff-line bg-staff-panel shadow-sm">
          {guides.map((guide) => (
            <li
              key={guide.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-staff-ink">{guide.title}</p>
                <p className="mt-1 text-sm text-staff-muted">
                  /{guide.publicSlug}
                  <span aria-hidden="true"> · </span>
                  <GuideStatusLabel
                    status={guide.status}
                    enabled={guide.isEnabled}
                  />
                  <span aria-hidden="true"> · </span>
                  Template {guide.templateSlug}
                  <span aria-hidden="true"> · </span>
                  Updated {formatUpdatedAt(guide.updatedAt)}
                </p>
              </div>
              {guide.previewHref ? (
                <a
                  href={guide.previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-staff-line px-3 text-sm font-medium text-staff-ink transition hover:border-staff-brand hover:text-staff-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
                >
                  View patient guide
                  <span className="sr-only"> (opens in a new tab)</span>
                  <span aria-hidden="true" className="ml-1">
                    ↗
                  </span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuideStatusLabel({
  status,
  enabled,
}: {
  status: PracticeGuideStatus;
  enabled: boolean;
}) {
  if (status === PracticeGuideStatus.PUBLISHED && enabled) {
    return "Published";
  }
  if (status === PracticeGuideStatus.PUBLISHED && !enabled) {
    return "Published, disabled";
  }
  return "Draft";
}

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(date);
}
