import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import type { PracticeSettingsInput } from "@/lib/clinic-portal/practice-settings-schema";
import { getPrisma } from "@/lib/prisma";

export async function updatePracticeSettings(input: {
  clinicId: string;
  values: PracticeSettingsInput;
}): Promise<void> {
  const clinic = await getPrisma().clinic.findUnique({
    where: { id: input.clinicId },
    select: { id: true },
  });

  if (!clinic) {
    throw new ClinicPortalError("Practice not found.", "not_found");
  }

  await getPrisma().clinicProfile.upsert({
    where: { clinicId: input.clinicId },
    update: input.values,
    create: {
      clinicId: input.clinicId,
      ...input.values,
    },
  });
}
