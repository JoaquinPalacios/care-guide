import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/app/(staff)/components/logout-button";
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
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Platform">
          <Link
            href="/operator/clinics"
            className="flex min-h-11 items-center rounded-md bg-staff-brand/10 px-3 text-sm font-medium text-staff-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
          >
            All Clinics
          </Link>
        </nav>
        <div className="mt-auto border-t border-staff-line p-4">
          <p className="truncate text-sm font-medium">
            {user.name?.trim() || user.email}
          </p>
          <p className="mt-0.5 text-xs text-staff-muted">Operator</p>
          <LogoutButton className="mt-3 flex flex-col items-start gap-2" />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
