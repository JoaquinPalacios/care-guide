import { ClinicMembershipRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  CLINIC_ADMIN_ROLE_LABEL,
  CLINIC_STAFF_ROLE_LABEL,
  PLATFORM_OPERATOR_ROLE_LABEL,
  clinicMembershipRoleLabel,
} from "@/lib/auth/role-labels";

describe("portal role labels", () => {
  it("uses clinic-facing labels instead of raw ADMIN/STAFF enums", () => {
    expect(clinicMembershipRoleLabel(ClinicMembershipRole.ADMIN)).toBe(
      CLINIC_ADMIN_ROLE_LABEL
    );
    expect(clinicMembershipRoleLabel(ClinicMembershipRole.STAFF)).toBe(
      CLINIC_STAFF_ROLE_LABEL
    );
    expect(clinicMembershipRoleLabel("ADMIN")).toBe("Clinic admin");
    expect(clinicMembershipRoleLabel("STAFF")).toBe("Clinic staff");
    expect(PLATFORM_OPERATOR_ROLE_LABEL).toBe("Platform operator");
  });

  it("does not present clinic ADMIN as a platform administrator", () => {
    expect(CLINIC_ADMIN_ROLE_LABEL).not.toBe("Admin");
    expect(CLINIC_ADMIN_ROLE_LABEL).not.toBe("Operator");
    expect(CLINIC_ADMIN_ROLE_LABEL).not.toContain("Platform");
    expect(PLATFORM_OPERATOR_ROLE_LABEL).not.toBe(CLINIC_ADMIN_ROLE_LABEL);
    expect(PLATFORM_OPERATOR_ROLE_LABEL).not.toBe(CLINIC_STAFF_ROLE_LABEL);
  });
});
