import { labeledPublicUrl } from "@/lib/tenancy/public-url";
import { getRootDomain } from "@/lib/tenancy/root-domain";

export function clinicPatientSiteUrl(input: {
  requestHost: string;
  clinicSlug: string;
  protocol?: string;
  pathname?: string;
}): string | null {
  return labeledPublicUrl({
    requestHost: input.requestHost,
    rootDomain: getRootDomain(),
    label: input.clinicSlug,
    protocol: input.protocol,
    pathname: input.pathname,
  });
}
