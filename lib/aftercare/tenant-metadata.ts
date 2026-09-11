import type { Metadata } from "next";
import { headers } from "next/headers";

import {
  instructionLabel,
  parseInstructionTerminology,
} from "@/lib/aftercare/instruction-terminology";
import { sanitizeMetadataText } from "@/lib/seo/metadata-text";
import { TENANT_LAUNCH_ROBOTS } from "@/lib/seo/robots-policy";

export const AFTERCARE_ROBOTS = TENANT_LAUNCH_ROBOTS;

const INSTRUCTION_NOUN = {
  AFTERCARE: "Aftercare",
  POST_TREATMENT: "Post-treatment",
  POST_PROCEDURE: "Post-procedure",
  POST_OPERATIVE: "Post-operative",
  RECOVERY: "Recovery",
} as const;

export async function publicTenantCanonicalUrl(
  pathname: string
): Promise<string | undefined> {
  if (pathname.includes("/_sites")) {
    return undefined;
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return undefined;
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const normalizedPath = pathname === "" || pathname === "/" ? "/" : pathname;

  // Canonical URLs always mirror the incoming Host. They must not hard-code
  // `.localhost` or a commercial platform domain.
  return `${protocol}://${host}${normalizedPath}`;
}

export function tenantGuideDocumentTitle(
  guideTitle: string,
  practiceName: string,
  terminology?: string | null
): string {
  const title = sanitizeMetadataText(guideTitle, 80);
  const practice = sanitizeMetadataText(practiceName, 80);
  const noun = INSTRUCTION_NOUN[parseInstructionTerminology(terminology)];
  return `${title} ${noun} | ${practice}`;
}

export function tenantGuideDescription(
  guideTitle: string,
  practiceName: string,
  terminology?: string | null
): string {
  const title = sanitizeMetadataText(guideTitle, 80).toLowerCase();
  const practice = sanitizeMetadataText(practiceName, 80);
  return `${instructionLabel(terminology)} for ${title} from ${practice}.`;
}

export function aftercarePageMetadata(input: {
  title: string;
  description: string;
  canonicalUrl?: string;
  siteName?: string;
}): Metadata {
  const title = sanitizeMetadataText(input.title, 70);
  const description = sanitizeMetadataText(input.description, 180);
  const siteName = input.siteName
    ? sanitizeMetadataText(input.siteName, 80)
    : undefined;

  return {
    title,
    description,
    robots: AFTERCARE_ROBOTS,
    alternates: input.canonicalUrl
      ? { canonical: input.canonicalUrl }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en",
      title,
      description,
      url: input.canonicalUrl,
      siteName,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
