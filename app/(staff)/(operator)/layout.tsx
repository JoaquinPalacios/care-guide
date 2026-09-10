import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/app/(staff)/components/logout-button";
import { PortalAppearanceControl } from "@/app/(staff)/components/portal-appearance-control";
import { ProductMark } from "@/app/(staff)/components/product-mark";
import { requirePlatformOperator } from "@/lib/auth/require-platform-operator";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export default async function OperatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requirePlatformOperator();

  return (
    <div className="flex min-h-screen bg-staff-canvas text-staff-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-staff-line bg-staff-panel md:flex">
        <div className="border-b border-staff-line px-5 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <ProductMark className="h-5 w-5 text-staff-brand" />
            {PRODUCT_NAME}
          </p>
          <p className="mt-1 text-sm text-staff-muted">Platform operator</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <nav className="staffNavGroup" aria-label="Platform">
            <Link
              href="/operator/clinics"
              className="staffNavRow bg-staff-brand/10 text-staff-brand"
            >
              All Clinics
            </Link>
          </nav>
          <div className="mt-auto">
            <div className="staffNavRule" role="presentation" />
            <div className="staffNavGroup" aria-label="Preferences">
              <PortalAppearanceControl />
            </div>
            <div className="staffNavRule" role="presentation" />
            <div className="px-1 pt-1">
              <p className="truncate text-sm font-medium">
                {user.name?.trim() || user.email}
              </p>
              <p className="mt-0.5 text-xs text-staff-muted">Operator</p>
              <LogoutButton className="mt-3 flex flex-col items-start gap-2" />
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
