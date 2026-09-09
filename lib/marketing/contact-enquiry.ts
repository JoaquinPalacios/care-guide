import { z } from "zod";

import {
  CONTACT_FIELD_LIMITS,
  CONTACT_HONEYPOT_FIELD,
  LOCATION_COUNTS,
  type ContactEnquiryFieldErrors,
} from "@/lib/marketing/contact-fields";

export {
  CONTACT_FIELD_LIMITS,
  CONTACT_HONEYPOT_FIELD,
  LOCATION_COUNTS,
  readContactFormValues,
  validateContactFormValues,
  type ContactEnquiryField,
  type ContactEnquiryFieldErrors,
  type LocationCount,
} from "@/lib/marketing/contact-fields";

const requiredText = (max: number, emptyMessage: string) =>
  z.string().trim().min(1, emptyMessage).max(max, "This value is too long.");

export const contactEnquirySchema = z.object({
  fullName: requiredText(
    CONTACT_FIELD_LIMITS.fullName,
    "Enter your full name."
  ),
  workEmail: z
    .string()
    .trim()
    .min(1, "Enter your work email.")
    .max(CONTACT_FIELD_LIMITS.workEmail, "This value is too long.")
    .email("Enter a valid work email."),
  clinicName: requiredText(
    CONTACT_FIELD_LIMITS.clinicName,
    "Enter your practice or clinic name."
  ),
  locationCount: z.enum(LOCATION_COUNTS, {
    error: "Choose the number of locations.",
  }),
  phone: z
    .string()
    .trim()
    .max(CONTACT_FIELD_LIMITS.phone, "This value is too long.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  message: z
    .string()
    .trim()
    .max(CONTACT_FIELD_LIMITS.message, "This value is too long.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  [CONTACT_HONEYPOT_FIELD]: z
    .string()
    .max(CONTACT_FIELD_LIMITS.honeypot)
    .optional()
    .transform((value) => value?.trim() ?? ""),
});

export type ContactEnquiryInput = z.input<typeof contactEnquirySchema>;
export type ContactEnquiry = z.output<typeof contactEnquirySchema>;

export function contactFieldErrorsFromZod(
  error: z.ZodError
): ContactEnquiryFieldErrors {
  const fieldErrors: ContactEnquiryFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      field === "fullName" ||
      field === "workEmail" ||
      field === "clinicName" ||
      field === "locationCount" ||
      field === "phone" ||
      field === "message"
    ) {
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
  }

  return fieldErrors;
}

export function isHoneypotTriggered(enquiry: ContactEnquiry): boolean {
  return enquiry[CONTACT_HONEYPOT_FIELD].length > 0;
}

export function sanitizeHeaderValue(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function enquirySubject(clinicName: string): string {
  const safeClinic = sanitizeHeaderValue(clinicName).slice(0, 80);
  return `Aftercare Guide — clinic enquiry — ${safeClinic}`;
}
