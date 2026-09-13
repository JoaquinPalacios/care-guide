/**
 * Builds a public URL on a sibling hostname label of the current request host.
 * Used for marketing CTAs (demo tenant, staff app). Does not look up tenants.
 */
export function labeledPublicUrl(input: {
  requestHost: string;
  rootDomain: string;
  label: string;
  protocol?: string;
  pathname?: string;
}): string | null {
  const parsed = parsePublicHost(input.requestHost, input.rootDomain);
  if (!parsed) {
    return null;
  }

  const label = input.label.trim().toLowerCase();
  if (!label || label.includes(".") || label.includes("/")) {
    return null;
  }

  const protocol =
    input.protocol ??
    (parsed.hostname.includes("localhost") ? "http" : "https");
  const pathname = normalizePublicPath(input.pathname);

  return `${protocol}://${label}.${parsed.root}${parsed.port}${pathname}`;
}

/**
 * Builds a URL on the platform apex (marketing host) from the current request.
 * Used for staff → marketing navigation. Does not hardcode a production domain.
 */
export function apexPublicUrl(input: {
  requestHost: string;
  rootDomain: string;
  protocol?: string;
  pathname?: string;
}): string | null {
  const parsed = parsePublicHost(input.requestHost, input.rootDomain);
  if (!parsed) {
    return null;
  }

  const protocol =
    input.protocol ??
    (parsed.hostname.includes("localhost") ? "http" : "https");
  const pathname = normalizePublicPath(input.pathname);

  return `${protocol}://${parsed.root}${parsed.port}${pathname}`;
}

function parsePublicHost(
  requestHost: string,
  rootDomain: string
): { hostname: string; root: string; port: string } | null {
  const host = requestHost.trim().toLowerCase();
  const root = rootDomain.trim().toLowerCase();

  if (!host || !root) {
    return null;
  }

  const lastColon = host.lastIndexOf(":");
  const hostname = lastColon === -1 ? host : host.slice(0, lastColon);
  const port = lastColon === -1 ? "" : host.slice(lastColon);

  if (lastColon !== -1 && !/^\d+$/.test(port.slice(1))) {
    return null;
  }

  if (hostname !== root && !hostname.endsWith(`.${root}`)) {
    return null;
  }

  return { hostname, root, port };
}

function normalizePublicPath(pathname?: string): string {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
