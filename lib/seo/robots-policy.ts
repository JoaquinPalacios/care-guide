export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
} as const;

export const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
} as const;

/** Launch policy: tenant aftercare is shareable but not a search-acquisition surface. */
export const TENANT_LAUNCH_ROBOTS = {
  index: false,
  follow: true,
} as const;

export const ROBOTS_ALLOW_PUBLIC = [
  "/",
  "/pricing",
  "/contact",
  "/about",
  "/llms.txt",
] as const;

export const ROBOTS_DISALLOW_INTERNAL = [
  "/_marketing",
  "/_sites",
  "/login",
  "/dashboard",
  "/guides",
  "/practice",
  "/operator",
  "/sessions",
  "/session",
  "/display",
  "/api",
] as const;
