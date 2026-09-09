import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-forwarded-for": "203.0.113.10",
    }),
}));

import { submitMarketingContactAction } from "@/app/(marketing)/%5Fmarketing/contact/actions";
import { initialContactActionState } from "@/app/(marketing)/%5Fmarketing/contact/state";
import { CONTACT_HONEYPOT_FIELD } from "@/lib/marketing/contact-enquiry";
import {
  clearMarketingContactMemoryInbox,
  getMarketingContactMemoryInbox,
} from "@/lib/marketing/contact-mailer";
import { resetContactThrottleForTests } from "@/lib/marketing/contact-throttle";

function enquiryData(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  data.set("fullName", "Alex Rivera");
  data.set("workEmail", "alex@clinic.example.test");
  data.set("clinicName", "Harbour Dental");
  data.set("locationCount", "1");
  data.set("phone", "");
  data.set("message", "");
  data.set(CONTACT_HONEYPOT_FIELD, "");
  for (const [key, value] of Object.entries(overrides)) {
    data.set(key, value);
  }
  return data;
}

describe("submitMarketingContactAction", () => {
  const previous = {
    to: process.env.MARKETING_CONTACT_TO_EMAIL,
    from: process.env.MARKETING_CONTACT_FROM_EMAIL,
    mailer: process.env.MARKETING_CONTACT_MAILER,
    host: process.env.SMTP_HOST,
  };

  beforeEach(() => {
    process.env.MARKETING_CONTACT_TO_EMAIL = "hello@example.test";
    process.env.MARKETING_CONTACT_FROM_EMAIL = "website@example.test";
    process.env.MARKETING_CONTACT_MAILER = "memory";
    delete process.env.SMTP_HOST;
    clearMarketingContactMemoryInbox();
    resetContactThrottleForTests();
  });

  afterEach(() => {
    restore("MARKETING_CONTACT_TO_EMAIL", previous.to);
    restore("MARKETING_CONTACT_FROM_EMAIL", previous.from);
    restore("MARKETING_CONTACT_MAILER", previous.mailer);
    restore("SMTP_HOST", previous.host);
    clearMarketingContactMemoryInbox();
    resetContactThrottleForTests();
  });

  it("delivers a valid enquiry through the mailer boundary", async () => {
    const state = await submitMarketingContactAction(
      initialContactActionState,
      enquiryData({ phone: "0400 000 000" })
    );
    expect(state).toEqual({ status: "success" });
    expect(getMarketingContactMemoryInbox()).toHaveLength(1);
    expect(getMarketingContactMemoryInbox()[0]?.replyTo).toBe(
      "alex@clinic.example.test"
    );
  });

  it("returns field errors without claiming success", async () => {
    const state = await submitMarketingContactAction(
      initialContactActionState,
      enquiryData({ fullName: "", workEmail: "nope" })
    );
    expect(state.status).toBe("error");
    if (state.status !== "error") {
      return;
    }
    expect(state.fieldErrors.fullName).toBeTruthy();
    expect(state.fieldErrors.workEmail).toBeTruthy();
    expect(getMarketingContactMemoryInbox()).toHaveLength(0);
  });

  it("does not deliver honeypot submissions or report success", async () => {
    const state = await submitMarketingContactAction(
      initialContactActionState,
      enquiryData({ [CONTACT_HONEYPOT_FIELD]: "https://spam.test" })
    );
    expect(state.status).toBe("error");
    expect(getMarketingContactMemoryInbox()).toHaveLength(0);
  });

  it("does not pretend success when SMTP is missing", async () => {
    process.env.MARKETING_CONTACT_MAILER = "smtp";
    delete process.env.SMTP_HOST;
    const state = await submitMarketingContactAction(
      initialContactActionState,
      enquiryData()
    );
    expect(state.status).toBe("error");
    if (state.status !== "error") {
      return;
    }
    expect(state.error).toMatch(/not configured/i);
    expect(getMarketingContactMemoryInbox()).toHaveLength(0);
  });
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
