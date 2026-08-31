import { PatientDisplayMode } from "@prisma/client";
import { z } from "zod";

const trimmedString = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(128, "This value is too long.");

const displayModeSchema = z.enum(
  Object.values(PatientDisplayMode) as [
    PatientDisplayMode,
    ...PatientDisplayMode[],
  ]
);

export const createSessionSchema = z.object({
  roomId: trimmedString,
  doctorId: trimmedString,
  procedureTemplateId: trimmedString,
  selectedAreaOptionId: z
    .string()
    .trim()
    .max(128)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  displayMode: displayModeSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
