import nodemailer from "nodemailer";

import {
  getMarketingContactDeliveryConfig,
  type MarketingContactDeliveryConfig,
} from "@/lib/marketing/contact-config";
import { composeMarketingContactMessage } from "@/lib/marketing/contact-mail";
import type { ContactEnquiry } from "@/lib/marketing/contact-enquiry";
import type { MarketingContactMessage } from "@/lib/marketing/contact-mail";

export type MarketingContactMailerResult =
  { ok: true } | { ok: false; error: string };

const memoryInbox: MarketingContactMessage[] = [];

export function getMarketingContactMemoryInbox(): readonly MarketingContactMessage[] {
  return memoryInbox;
}

export function clearMarketingContactMemoryInbox(): void {
  memoryInbox.length = 0;
}

export async function deliverMarketingContactEnquiry(
  enquiry: ContactEnquiry,
  config: MarketingContactDeliveryConfig = getMarketingContactDeliveryConfig()
): Promise<MarketingContactMailerResult> {
  if (!config.ready) {
    return { ok: false, error: config.reason };
  }

  const message = composeMarketingContactMessage({
    enquiry,
    toEmail: config.toEmail,
    fromEmail: config.fromEmail,
  });

  if (config.kind === "memory") {
    memoryInbox.push(message);
    return { ok: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth:
        config.smtp.user && config.smtp.password
          ? {
              user: config.smtp.user,
              pass: config.smtp.password,
            }
          : undefined,
    });

    await transporter.sendMail({
      to: message.to,
      from: message.from,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Unable to send your enquiry. Please try again.",
    };
  }
}
