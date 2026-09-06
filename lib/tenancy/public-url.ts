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
  const host = input.requestHost.trim().toLowerCase();
  const root = input.rootDomain.trim().toLowerCase();
  const label = input.label.trim().toLowerCase();

  if (!host || !root || !label || label.includes(".") || label.includes("/")) {
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

  const protocol =
    input.protocol ?? (hostname.includes("localhost") ? "http" : "https");
  const pathname = input.pathname
    ? input.pathname.startsWith("/")
      ? input.pathname
      : `/${input.pathname}`
    : "/";

  return `${protocol}://${label}.${root}${port}${pathname}`;
}
