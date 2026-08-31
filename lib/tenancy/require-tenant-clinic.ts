import { notFound } from "next/navigation";

import { getClinicBySlug } from "@/lib/aftercare/get-clinic-by-slug";

export async function requireTenantClinic(slug: string) {
  const clinic = await getClinicBySlug(slug);
  if (!clinic) {
    notFound();
  }
  return clinic;
}
