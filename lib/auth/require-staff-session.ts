import "server-only";

import { redirect } from "next/navigation";

import {
  type AuthenticatedUser,
  type ClinicMembershipContext,
  getAuthContext,
  isPlatformOperator,
} from "@/lib/auth/session";

interface StaffSessionContext {
  user: AuthenticatedUser;
  clinicMembership: ClinicMembershipContext;
}

export async function requireStaffSession(): Promise<StaffSessionContext> {
  const authContext = await getAuthContext();

  if (!authContext.user) {
    redirect("/login");
  }

  if (!authContext.clinicMembership) {
    if (isPlatformOperator(authContext.user)) {
      redirect("/operator/clinics");
    }

    redirect("/login");
  }

  return {
    user: authContext.user,
    clinicMembership: authContext.clinicMembership,
  };
}
