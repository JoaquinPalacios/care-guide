import type { ReactNode } from "react";

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
  await requireTenantClinic(tenant);
  return children;
}
