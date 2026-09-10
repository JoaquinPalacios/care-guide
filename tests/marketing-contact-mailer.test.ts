import { afterEach, describe, expect, it } from "vitest";

import { composeMarketingContactMessage } from "@/lib/marketing/contact-mail";
import {
  clearMarketingContactMemoryInbox,
  deliverMarketingContactEnquiry,
  getMarketingContactMemoryInbox,
} from "@/lib/marketing/contact-mailer";
import { CONTACT_HONEYPOT_FIELD } from "@/lib/marketing/contact-enquiry";
import {
  getMarketingContactDeliveryConfig,
  getMarketingContactFromEmail,
  getMarketingContactToEmail,
} from "@/lib/marketing/contact-config";

const enquiry = {
  fullName: "Alex Rivera",
  workEmail: "alex@clinic.example.test",
  clinicName: "Harbour Dental",
  phone: "0400 000 000",
  message: "We have two rooms.",
  [CONTACT_HONEYPOT_FIELD]: "",
};

describe("marketing contact mailer", () => {
  const previous = {
    to: process.env.MARKETING_CONTACT_TO_EMAIL,
    from: process.env.MARKETING_CONTACT_FROM_EMAIL,
    mailer: process.env.MARKETING_CONTACT_MAILER,
    legacy: process.env.MARKETING_CONTACT_EMAIL,
    host: process.env.SMTP_HOST,
  };

  afterEach(() => {
    restore("MARKETING_CONTACT_TO_EMAIL", previous.to);
    restore("MARKETING_CONTACT_FROM_EMAIL", previous.from);
    restore("MARKETING_CONTACT_MAILER", previous.mailer);
    restore("MARKETING_CONTACT_EMAIL", previous.legacy);
    restore("SMTP_HOST", previous.host);
    clearMarketingContactMemoryInbox();
  });

  it("fails closed when delivery is not configured", async () => {
    delete process.env.MARKETING_CONTACT_TO_EMAIL;
    delete process.env.MARKETING_CONTACT_FROM_EMAIL;
    delete process.env.MARKETING_CONTACT_EMAIL;
    delete process.env.SMTP_HOST;
    process.env.MARKETING_CONTACT_MAILER = "smtp";

    const result = await deliverMarketingContactEnquiry(enquiry);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toMatch(/not configured/i);
    expect(getMarketingContactMemoryInbox()).toHaveLength(0);
  });

  it("delivers through the memory adapter without faking client success", async () => {
    process.env.MARKETING_CONTACT_TO_EMAIL = "hello@example.test";
    process.env.MARKETING_CONTACT_FROM_EMAIL = "website@example.test";
    process.env.MARKETING_CONTACT_MAILER = "memory";

    const config = getMarketingContactDeliveryConfig();
    expect(config.ready).toBe(true);
    const result = await deliverMarketingContactEnquiry(enquiry, config);
    expect(result).toEqual({ ok: true });
    expect(getMarketingContactMemoryInbox()).toHaveLength(1);
    const message = getMarketingContactMemoryInbox()[0];
    expect(message.subject).toBe(
      "Aftercare Guide — clinic enquiry — Harbour Dental"
    );
    expect(message.replyTo).toBe("alex@clinic.example.test");
    expect(message.text).toContain("Name: Alex Rivera");
    expect(message.text).toContain("Email: alex@clinic.example.test");
    expect(message.text).toContain("Clinic: Harbour Dental");
    expect(message.text).not.toContain("Work email");
    expect(message.text).not.toContain("Number of locations");
    expect(message.text).toContain("Phone: 0400 000 000");
    expect(message.html).toContain("Harbour Dental");
    expect(message.html).not.toContain("<script");
  });

  it("reads to/from addresses and rejects malformed values", () => {
    expect(
      getMarketingContactToEmail({
        MARKETING_CONTACT_TO_EMAIL: "hello@example.test",
      })
    ).toBe("hello@example.test");
    expect(
      getMarketingContactToEmail({
        MARKETING_CONTACT_EMAIL: "legacy@example.test",
      })
    ).toBe("legacy@example.test");
    expect(
      getMarketingContactFromEmail({
        MARKETING_CONTACT_FROM_EMAIL: "not-an-email",
      })
    ).toBeNull();
  });
});

describe("compose marketing contact message", () => {
  it("omits optional blanks and escapes HTML", () => {
    const message = composeMarketingContactMessage({
      enquiry: {
        ...enquiry,
        phone: null,
        message: "We use <b>custom</b> chairs",
      },
      toEmail: "hello@example.test",
      fromEmail: "website@example.test",
    });
    expect(message.text).not.toContain("Phone:");
    expect(message.html).toContain("&lt;b&gt;custom&lt;/b&gt;");
    expect(message.html).not.toContain("<b>custom</b>");
    expect(message.html).toContain('<th align="left">Email</th>');
    expect(message.html).not.toContain("Work email");
    expect(message.html).not.toContain("Number of locations");
  });
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
