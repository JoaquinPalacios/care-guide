import { z } from "zod";

import { careGuideSlugSchema } from "@/lib/aftercare/slug";
import { ClinicPortalError } from "@/lib/clinic-portal/errors";
import { isReservedTenantSlug } from "@/lib/tenancy/reserved-slugs";
import { prisma } from "@/lib/prisma";

export const createOperatorClinicSchema = z.object({
  name: z.string().trim().min(1, "Enter the practice name.").max(80),
  slug: careGuideSlugSchema.refine((value) => !isReservedTenantSlug(value), {
    message: "That hostname is reserved by the platform.",
  }),
});

export type CreateOperatorClinicInput = z.infer<
  typeof createOperatorClinicSchema
>;

export async function createOperatorClinic(
  values: CreateOperatorClinicInput
): Promise<{ id: string }> {
  const taken = await prisma.clinic.findUnique({
    where: { slug: values.slug },
    select: { id: true },
  });
  if (taken) {
    throw new ClinicPortalError(
      "That tenant slug is already in use.",
      "conflict"
    );
  }

  const clinic = await prisma.clinic.create({
    data: {
      name: values.name,
      slug: values.slug,
      profile: {
        create: {
          displayName: values.name,
        },
      },
    },
    select: { id: true },
  });

  return clinic;
}
