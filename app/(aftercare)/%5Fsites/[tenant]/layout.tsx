import {
  AFTERCARE_THEME_SCOPE,
  resolveAftercareTheme,
  serializeAftercareThemeCss,
} from "@/lib/branding/aftercare-theme";
import { requireTenantClinic } from "@/lib/tenancy/require-tenant-clinic";

import type { ReactNode } from "react";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export const dynamic = "force-dynamic";

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = await params;
  const clinic = await requireTenantClinic(tenant);
  const theme = resolveAftercareTheme(clinic.profile);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: serializeAftercareThemeCss(theme) }}
      />
      <div className={AFTERCARE_THEME_SCOPE}>{children}</div>
    </>
  );
}
