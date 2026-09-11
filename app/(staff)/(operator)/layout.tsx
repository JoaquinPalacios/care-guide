import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/app/(staff)/components/logout-button";
import { PortalAppearanceControl } from "@/app/(staff)/components/portal-appearance-control";
import { ProductMark } from "@/app/(staff)/components/product-mark";
import { PLATFORM_OPERATOR_ROLE_LABEL } from "@/lib/auth/role-labels";
import { requirePlatformOperator } from "@/lib/auth/require-platform-operator";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export default async function OperatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requirePlatformOperator();

  return (
    <div className="staffPortalShell">
      <aside className="staffPortalSidebar">
        <div className="border-b border-staff-line px-5 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <ProductMark className="h-5 w-5 text-staff-brand" />
            {PRODUCT_NAME}
          </p>
          <p className="mt-1 text-sm text-staff-muted">
            {PLATFORM_OPERATOR_ROLE_LABEL}
          </p>
        </div>
        <div className="staffPortalSidebarBody">
          <nav className="staffNavGroup" aria-label="Platform">
            <Link
              href="/operator/clinics"
              className="staffNavRow bg-staff-brand/10 text-staff-brand"
            >
              Clinics
            </Link>
          </nav>
          <div className="mt-auto">
            <div className="staffNavRule" role="presentation" />
            <div className="staffNavGroup" aria-label="Preferences">
              <PortalAppearanceControl />
            </div>
            <div className="staffNavRule" role="presentation" />
            <div className="staffAccountBlock">
              <div className="staffAccountMeta">
                <p className="truncate text-sm font-medium">
                  {user.name?.trim() || user.email}
                </p>
                <p className="staffAccountRole">
                  {PLATFORM_OPERATOR_ROLE_LABEL}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
      <div className="staffPortalMain">
        <main className="staffPortalContent">{children}</main>
      </div>
    </div>
  );
}
