import "dotenv/config";

const DEFAULT_DEV_DATABASE = "care_guide";
const DEFAULT_E2E_DATABASE = "care_guide_e2e";

export interface DatabaseUrlParts {
  href: string;
  database: string;
}

export function parseDatabaseUrl(value: string): DatabaseUrlParts {
  const url = new URL(value);
  const database = decodeURIComponent(url.pathname.replace(/^\//, "")).split(
    "/"
  )[0];
  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }
  return { href: url.toString(), database };
}

export function developmentDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required.");
  }
  return value;
}

export function e2eDatabaseUrl(): string {
  const explicit = process.env.E2E_DATABASE_URL?.trim();
  const derived = explicit || deriveE2eDatabaseUrl(developmentDatabaseUrl());
  const e2e = parseDatabaseUrl(derived);
  const dev = parseDatabaseUrl(developmentDatabaseUrl());

  if (e2e.database === dev.database) {
    throw new Error(
      "E2E_DATABASE_URL must not point at the development database. Use a dedicated database such as care_guide_e2e."
    );
  }

  return e2e.href;
}

export function deriveE2eDatabaseUrl(devUrl: string): string {
  const url = new URL(devUrl);
  const current = decodeURIComponent(url.pathname.replace(/^\//, "")).split(
    "/"
  )[0];
  if (current === DEFAULT_E2E_DATABASE) {
    return url.toString();
  }
  if (current !== DEFAULT_DEV_DATABASE && current.length > 0) {
    url.pathname = `/${current}_e2e`;
    return url.toString();
  }
  url.pathname = `/${DEFAULT_E2E_DATABASE}`;
  return url.toString();
}

export function maintenanceDatabaseUrl(urlValue: string): string {
  const url = new URL(urlValue);
  url.pathname = "/postgres";
  return url.toString();
}
