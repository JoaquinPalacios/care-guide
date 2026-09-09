import { z } from "zod";

export const LOCATION_COUNTS = ["1", "2-5", "6+"] as const;
export type LocationCount = (typeof LOCATION_COUNTS)[number];

export const CONTACT_HONEYPOT_FIELD = "website";

export const CONTACT_FIELD_LIMITS = {
  fullName: 120,
  workEmail: 254,
  clinicName: 160,
  phone: 40,
  message: 2000,
  honeypot: 200,
} as const;

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

export type ContactEnquiryField =
  | "fullName"
  | "workEmail"
  | "clinicName"
  | "locationCount"
  | "phone"
  | "message";

export type ContactEnquiryFieldErrors = Partial<
  Record<ContactEnquiryField, string>
>;

export function readContactFormValues(
  formData: FormData
): Record<string, string> {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    fullName: read("fullName"),
    workEmail: read("workEmail"),
    clinicName: read("clinicName"),
    locationCount: read("locationCount"),
    phone: read("phone"),
    message: read("message"),
    [CONTACT_HONEYPOT_FIELD]: read(CONTACT_HONEYPOT_FIELD),
  };
}

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
