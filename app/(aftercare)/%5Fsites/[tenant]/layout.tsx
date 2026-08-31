import type { ReactNode } from "react";

import { PracticeBrandProof } from "@/app/(aftercare)/practice-brand-proof";
import {
  resolveAftercareTheme,
  toAftercareThemeStyle,
} from "@/lib/branding/aftercare-theme";
import { requireTenantClinic } from "@/lib/tenancy/require-tenant-clinic";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant } = await params;
  const clinic = await requireTenantClinic(tenant);
  const theme = resolveAftercareTheme(clinic.profile);
  const displayName = clinic.profile?.displayName ?? clinic.name;

  return (
    <div style={toAftercareThemeStyle(theme)}>
      <PracticeBrandProof displayName={displayName} />
      {children}
    </div>
  );
}
