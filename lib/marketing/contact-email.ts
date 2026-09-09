export const MARKETING_CONTACT_EMAIL_ENV = "MARKETING_CONTACT_EMAIL";
export const MARKETING_ENQUIRY_SUBJECT = "Aftercare Guide — clinic enquiry";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getMarketingContactEmail(
  value: string | undefined = process.env[MARKETING_CONTACT_EMAIL_ENV]
): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !EMAIL_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function marketingEnquiryMailto(email: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(MARKETING_ENQUIRY_SUBJECT)}`;
}
