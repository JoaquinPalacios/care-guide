"use server";

import { headers } from "next/headers";

import { getMarketingContactDeliveryConfig } from "@/lib/marketing/contact-config";
import {
  CONTACT_HONEYPOT_FIELD,
  contactEnquirySchema,
  contactFieldErrorsFromZod,
  isHoneypotTriggered,
  readContactFormValues,
} from "@/lib/marketing/contact-enquiry";
import { deliverMarketingContactEnquiry } from "@/lib/marketing/contact-mailer";
import {
  consumeContactThrottle,
  contactThrottleKey,
} from "@/lib/marketing/contact-throttle";

import { type ContactActionState, initialContactActionState } from "./state";

const DELIVERY_FAILED = "Unable to send your enquiry. Please try again.";
const THROTTLED =
  "Too many enquiries were sent from this network. Please try again later.";

async function clientKey(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return contactThrottleKey(
    first ||
      requestHeaders.get("x-real-ip") ||
      requestHeaders.get("cf-connecting-ip")
  );
}

export async function submitMarketingContactAction(
  _previous: ContactActionState = initialContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const throttle = consumeContactThrottle(await clientKey());
  if (!throttle.allowed) {
    return {
      status: "error",
      error: THROTTLED,
      fieldErrors: {},
    };
  }

  const parsed = contactEnquirySchema.safeParse(
    readContactFormValues(formData)
  );
  if (!parsed.success) {
    return {
      status: "error",
      error: "Please review the highlighted fields.",
      fieldErrors: contactFieldErrorsFromZod(parsed.error),
    };
  }

  if (
    isHoneypotTriggered(parsed.data) ||
    formData.get(CONTACT_HONEYPOT_FIELD)
  ) {
    return {
      status: "error",
      error: DELIVERY_FAILED,
      fieldErrors: {},
    };
  }

  const result = await deliverMarketingContactEnquiry(
    parsed.data,
    getMarketingContactDeliveryConfig()
  );

  if (!result.ok) {
    return {
      status: "error",
      error: result.error,
      fieldErrors: {},
    };
  }

  return { status: "success" };
}
