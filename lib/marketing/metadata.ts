import type { Metadata } from "next";

import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const MARKETING_TITLE_TEMPLATE = `%s — ${PRODUCT_NAME}`;

export const HOME_METADATA = {
  title: `${PRODUCT_NAME} — Branded patient aftercare`,
  description:
    "Branded, mobile-first aftercare pages that still feel like your clinic. Patients reopen procedure-specific guidance without an app or login.",
} as const;

export const PRICING_METADATA = {
  title: "Pricing",
  description:
    "Provisional Aftercare Guide plans for dental practices: Essential at A$79 a month, Practice at A$149 a month, and custom Group pricing.",
} as const;

export const CONTACT_METADATA = {
  title: "Contact",
  description:
    "Request an Aftercare Guide demo or early access. Tell us about your practice and we will set up branded aftercare pages with you.",
} as const;

export function marketingPageMetadata(input: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    robots: { index: true, follow: true },
  };
}
