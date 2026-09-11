import type { Metadata } from "next";
import Link from "next/link";

import { requirePlatformOperator } from "@/lib/auth/require-platform-operator";
import { listOperatorClinics } from "@/lib/operator/list-operator-clinics";
import { summarizeOperatorClinics } from "@/lib/operator/summarize-operator-clinics";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const metadata: Metadata = {
  title: `All Clinics · ${PRODUCT_NAME}`,
};

export default async function OperatorClinicsPage() {
  await requirePlatformOperator();
  const clinics = await listOperatorClinics();
  const summary = summarizeOperatorClinics(clinics);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
            Platform
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            All Clinics
          </h1>
          <p className="mt-2 text-sm text-staff-muted">
            Operational control plane for Aftercare Guide clinics.
          </p>
        </div>
        <Link href="/operator/clinics/new" className="staffBtn staffBtnPrimary">
          Create clinic
        </Link>
      </header>

      <dl className="staffOperatorSummary">
        <div className="staffOperatorStat">
          <dt>Total clinics</dt>
          <dd>{summary.totalClinics}</dd>
        </div>
        <div className="staffOperatorStat">
          <dt>Configured clinics</dt>
          <dd>{summary.configuredClinics}</dd>
        </div>
        <div className="staffOperatorStat">
          <dt>Published guides</dt>
          <dd>{summary.publishedGuides}</dd>
        </div>
        <div className="staffOperatorStat">
          <dt>Needs attention</dt>
          <dd>{summary.needsAttention}</dd>
        </div>
      </dl>

      {clinics.length === 0 ? (
        <p className="rounded-xl border border-dashed border-staff-line bg-staff-panel px-5 py-8 text-sm text-staff-muted">
          No clinics are registered yet.
        </p>
      ) : (
        <div className="staffOperatorTableWrap">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Registered clinics</caption>
            <thead className="border-b border-staff-line text-staff-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Practice</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Guides</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Setup</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr
                  key={clinic.id}
                  className="staffOperatorRow border-b border-staff-line last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/operator/clinics/${clinic.id}`}
                      className="staffOperatorRowLink"
                    >
                      {clinic.displayName}
                    </Link>
                    {clinic.displayName !== clinic.name ? (
                      <p className="text-staff-muted">{clinic.name}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-staff-muted">{clinic.slug}</td>
                  <td className="px-4 py-3">{clinic.guideCount}</td>
                  <td className="px-4 py-3">{clinic.publishedGuideCount}</td>
                  <td className="px-4 py-3">{clinic.setupLabel}</td>
                  <td className="px-4 py-3 text-staff-muted">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                    }).format(clinic.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
