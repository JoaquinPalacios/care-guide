import { isPlatformOperator } from "@/lib/auth/session";
import type { AuthContext } from "@/lib/auth/session";

export function signedInHomePath(authContext: AuthContext): string | null {
  if (!authContext.user) {
    return null;
  }

  if (authContext.clinicMembership) {
    return "/dashboard";
  }

  if (isPlatformOperator(authContext.user)) {
    return "/operator/clinics";
  }

  return null;
}
