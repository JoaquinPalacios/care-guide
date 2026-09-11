import type { ClinicMembershipRole } from "@prisma/client";

export function authorizeClinicLogoMutation(input: {
  role: ClinicMembershipRole | "ADMIN" | "STAFF";
  actorClinicId: string;
  targetClinicId: string;
}): { ok: true } | { ok: false; code: "forbidden" } {
  if (input.role !== "ADMIN") {
    return { ok: false, code: "forbidden" };
  }

  if (input.actorClinicId !== input.targetClinicId) {
    return { ok: false, code: "forbidden" };
  }

  return { ok: true };
}
