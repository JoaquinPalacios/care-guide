import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseHostname } from "@/lib/tenancy/parse-hostname";
import {
  isInternalSitesPath,
  isStaffPath,
  normalizePathname,
} from "@/lib/tenancy/paths";
import { getRootDomain } from "@/lib/tenancy/root-domain";

const SPOOFABLE_TENANT_HEADERS = ["x-care-guide-tenant", "x-tenant"] as const;

function notFound(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

function stripSpoofableHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  for (const header of SPOOFABLE_TENANT_HEADERS) {
    headers.delete(header);
  }
  return headers;
}

function continueWithoutSpoofedHeaders(request: NextRequest): NextResponse {
  return NextResponse.next({
    request: {
      headers: stripSpoofableHeaders(request),
    },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const pathname = normalizePathname(request.nextUrl.pathname);

  if (isInternalSitesPath(pathname)) {
    return notFound();
  }

  const classification = parseHostname(
    request.headers.get("host"),
    getRootDomain()
  );

  if (classification.kind === "invalid" || classification.kind === "reserved") {
    return notFound();
  }

  if (classification.kind === "staff") {
    return continueWithoutSpoofedHeaders(request);
  }

  if (isStaffPath(pathname)) {
    return notFound();
  }

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/"
      ? `/_sites/${classification.slug}`
      : `/_sites/${classification.slug}${pathname}`;

  return NextResponse.rewrite(url, {
    request: {
      headers: stripSpoofableHeaders(request),
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
