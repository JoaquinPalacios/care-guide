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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function requiredText(
  value: string,
  max: number,
  emptyMessage: string
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return emptyMessage;
  }
  if (trimmed.length > max) {
    return "This value is too long.";
  }
  return undefined;
}

function optionalText(value: string, max: number): string | undefined {
  if (value.trim().length > max) {
    return "This value is too long.";
  }
  return undefined;
}

export function validateContactFormValues(
  values: Record<string, string>
): ContactEnquiryFieldErrors {
  const errors: ContactEnquiryFieldErrors = {};
  const fullName = requiredText(
    values.fullName ?? "",
    CONTACT_FIELD_LIMITS.fullName,
    "Enter your full name."
  );
  if (fullName) {
    errors.fullName = fullName;
  }

  const workEmail = (values.workEmail ?? "").trim();
  if (!workEmail) {
    errors.workEmail = "Enter your work email.";
  } else if (workEmail.length > CONTACT_FIELD_LIMITS.workEmail) {
    errors.workEmail = "This value is too long.";
  } else if (!EMAIL_PATTERN.test(workEmail)) {
    errors.workEmail = "Enter a valid work email.";
  }

  const clinicName = requiredText(
    values.clinicName ?? "",
    CONTACT_FIELD_LIMITS.clinicName,
    "Enter your practice or clinic name."
  );
  if (clinicName) {
    errors.clinicName = clinicName;
  }

  const locationCount = values.locationCount ?? "";
  if (!(LOCATION_COUNTS as readonly string[]).includes(locationCount)) {
    errors.locationCount = "Choose the number of locations.";
  }

  const phone = optionalText(values.phone ?? "", CONTACT_FIELD_LIMITS.phone);
  if (phone) {
    errors.phone = phone;
  }

  const message = optionalText(
    values.message ?? "",
    CONTACT_FIELD_LIMITS.message
  );
  if (message) {
    errors.message = message;
  }

  return errors;
}
