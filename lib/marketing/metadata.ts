import type { Metadata } from "next";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { INDEXABLE_ROBOTS } from "@/lib/seo/robots-policy";
import { marketingSiteOrigin } from "@/lib/marketing/site";

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
    "Request an Aftercare Guide demo. Tell us about your practice and we will set up branded aftercare pages with you.",
} as const;

export function marketingMetadataBase(
  env: NodeJS.ProcessEnv = process.env
): URL {
  return new URL(`${marketingSiteOrigin(env)}/`);
}

export function marketingPageMetadata(
  input: {
    title: string;
    description: string;
  },
  options: {
    pathname: string;
    absoluteTitle?: boolean;
  }
): Metadata {
  const origin = marketingSiteOrigin();
  const canonicalPath = options.pathname === "/" ? "/" : options.pathname;
  const canonicalUrl =
    canonicalPath === "/" ? `${origin}/` : `${origin}${canonicalPath}`;
  const resolvedTitle = options.absoluteTitle
    ? input.title
    : `${input.title} — ${PRODUCT_NAME}`;

  return {
    title: options.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    robots: INDEXABLE_ROBOTS,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "en",
      url: canonicalUrl,
      siteName: PRODUCT_NAME,
      title: resolvedTitle,
      description: input.description,
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description: input.description,
    },
  };
}
