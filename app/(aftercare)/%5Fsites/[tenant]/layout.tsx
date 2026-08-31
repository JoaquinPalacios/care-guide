import type { ReactNode } from "react";

import {
  resolveAftercareTheme,
  toAftercareThemeStyle,
} from "@/lib/branding/aftercare-theme";
import { requireTenantClinic } from "@/lib/tenancy/require-tenant-clinic";

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

  return <div style={toAftercareThemeStyle(theme)}>{children}</div>;
}
