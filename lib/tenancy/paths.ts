export const STAFF_PATH_PREFIXES = [
  "/login",
  "/dashboard",
  "/sessions",
  "/session",
  "/display",
  "/api/auth",
] as const;

export function isStaffPath(pathname: string): boolean {
  return STAFF_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isInternalSitesPath(pathname: string): boolean {
  return pathname === "/_sites" || pathname.startsWith("/_sites/");
}

export function normalizePathname(pathname: string): string {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }

  if (!decoded.startsWith("/")) {
    decoded = `/${decoded}`;
  }

  const resolved: string[] = [];
  for (const segment of decoded.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }

  return `/${resolved.join("/")}`;
}
