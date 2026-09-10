import { afterEach, describe, expect, it } from "vitest";

import {
  CONTACT_HONEYPOT_FIELD,
  contactEnquirySchema,
  contactFieldErrorsFromZod,
  enquirySubject,
  isHoneypotTriggered,
  readContactFormValues,
  sanitizeHeaderValue,
  validateContactFormValues,
} from "@/lib/marketing/contact-enquiry";

function formData(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

const valid = {
  fullName: "Alex Rivera",
  workEmail: "alex@clinic.example.test",
  clinicName: "Harbour Dental",
  phone: "",
  message: "",
  [CONTACT_HONEYPOT_FIELD]: "",
};

describe("contact enquiry schema", () => {
  it("accepts required clinic fields and optional blanks", () => {
    const parsed = contactEnquirySchema.parse(valid);
    expect(parsed.phone).toBeNull();
    expect(parsed.message).toBeNull();
    expect(parsed.workEmail).toBe("alex@clinic.example.test");
    expect(isHoneypotTriggered(parsed)).toBe(false);
  });

  it("mirrors required-field errors without Zod on the client helper", () => {
    const errors = validateContactFormValues({
      ...valid,
      fullName: "",
      workEmail: "not-an-email",
      clinicName: "",
    });
    expect(errors.fullName).toMatch(/full name/i);
    expect(errors.workEmail).toMatch(/enter a valid email/i);
    expect(errors.clinicName).toMatch(/practice or clinic/i);
    expect(errors).not.toHaveProperty("locationCount");
  });

  it("requires name, email, and clinic", () => {
    const parsed = contactEnquirySchema.safeParse({
      ...valid,
      fullName: "",
      workEmail: "not-an-email",
      clinicName: "",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    const errors = contactFieldErrorsFromZod(parsed.error);
    expect(errors.fullName).toMatch(/full name/i);
    expect(errors.workEmail).toMatch(/valid email/i);
    expect(errors.clinicName).toMatch(/practice or clinic/i);
    expect(errors).not.toHaveProperty("locationCount");
    expect(JSON.stringify(errors)).not.toMatch(/work email/i);
  });

  it("does not collect patient, clinical, or location-count fields", () => {
    const data = readContactFormValues(formData(valid));
    expect(Object.keys(data)).toEqual([
      "fullName",
      "workEmail",
      "clinicName",
      "phone",
      "message",
      CONTACT_HONEYPOT_FIELD,
    ]);
    expect(JSON.stringify(data)).not.toMatch(
      /patient|specialty|password|billing|locationCount/i
    );
  });

  it("detects a filled honeypot", () => {
    const parsed = contactEnquirySchema.parse({
      ...valid,
      [CONTACT_HONEYPOT_FIELD]: "http://spam.test",
    });
    expect(isHoneypotTriggered(parsed)).toBe(true);
  });

  it("sanitises mail headers and builds a clinic subject", () => {
    expect(sanitizeHeaderValue("Harbour\r\nDental")).toBe("Harbour Dental");
    expect(enquirySubject("Harbour\nDental")).toBe(
      "Aftercare Guide — clinic enquiry — Harbour Dental"
    );
  });
});

describe("contact throttle", () => {
  afterEach(async () => {
    const { resetContactThrottleForTests } =
      await import("@/lib/marketing/contact-throttle");
    resetContactThrottleForTests();
  });

  it("allows a small burst then blocks", async () => {
    const { consumeContactThrottle } =
      await import("@/lib/marketing/contact-throttle");
    const key = "test-ip";
    for (let index = 0; index < 5; index += 1) {
      expect(consumeContactThrottle(key).allowed).toBe(true);
    }
    expect(consumeContactThrottle(key).allowed).toBe(false);
  });
});
