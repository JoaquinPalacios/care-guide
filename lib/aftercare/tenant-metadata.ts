import type { Metadata } from "next";
import { headers } from "next/headers";

export const AFTERCARE_ROBOTS = {
  index: false,
  follow: false,
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

export function aftercarePageMetadata(input: {
  title: string;
  description: string;
  canonicalUrl?: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    robots: AFTERCARE_ROBOTS,
    alternates: input.canonicalUrl
      ? { canonical: input.canonicalUrl }
      : undefined,
  };
}
