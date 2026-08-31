import { z } from "zod";

export const CARE_GUIDE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CARE_GUIDE_SLUG_MIN_LENGTH = 3;
export const CARE_GUIDE_SLUG_MAX_LENGTH = 32;

export const careGuideSlugSchema = z
  .string()
  .min(CARE_GUIDE_SLUG_MIN_LENGTH)
  .max(CARE_GUIDE_SLUG_MAX_LENGTH)
  .regex(CARE_GUIDE_SLUG_PATTERN);

export function isValidCareGuideSlug(value: string): boolean {
  return careGuideSlugSchema.safeParse(value).success;
}
