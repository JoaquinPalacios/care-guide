import "server-only";

import { redirect } from "next/navigation";

import {
  type AuthenticatedUser,
  type ClinicMembershipContext,
  getAuthContext,
} from "@/lib/auth/session";

interface StaffSessionContext {
  user: AuthenticatedUser;
  clinicMembership: ClinicMembershipContext | null;
}

export async function requireStaffSession(): Promise<StaffSessionContext> {
  const authContext = await getAuthContext();

  if (!authContext.user || !authContext.clinicMembership) {
    redirect("/login");
  }

  return {
    user: authContext.user,
    clinicMembership: authContext.clinicMembership,
  };
}
