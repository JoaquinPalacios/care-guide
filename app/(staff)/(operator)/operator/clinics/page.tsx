import type { Metadata } from "next";
import Link from "next/link";

import { requirePlatformOperator } from "@/lib/auth/require-platform-operator";
import { listOperatorClinics } from "@/lib/operator/list-operator-clinics";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const metadata: Metadata = {
  title: `All Clinics · ${PRODUCT_NAME}`,
};

export default async function OperatorClinicsPage() {
  await requirePlatformOperator();
  const clinics = await listOperatorClinics();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
            Platform
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            All Clinics
          </h1>
          <p className="mt-2 text-sm text-staff-muted">
            Subscribing practices on Aftercare Guide.
          </p>
        </div>
        <Link href="/operator/clinics/new" className="staffBtn staffBtnPrimary">
          Create clinic
        </Link>
      </header>

      {clinics.length === 0 ? (
        <p className="rounded-xl border border-dashed border-staff-line bg-staff-panel px-5 py-8 text-sm text-staff-muted">
          No clinics are registered yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-staff-line bg-staff-panel shadow-sm">
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
                  className="border-b border-staff-line last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/operator/clinics/${clinic.id}`}
                      className="font-medium text-staff-ink hover:text-staff-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
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
