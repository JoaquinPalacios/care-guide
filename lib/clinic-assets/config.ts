export const CLINIC_ASSET_STORAGE_BUCKET = "clinic-branding";

export type ClinicAssetStorageStatus =
  | { available: true; driver: "supabase"; bucket: string }
  | { available: true; driver: "memory"; bucket: string }
  | { available: false; reason: "unconfigured" };

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function clinicAssetStorageStatus(): ClinicAssetStorageStatus {
  const driver = readEnv("CLINIC_ASSET_STORAGE_DRIVER");
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket =
    readEnv("CLINIC_ASSET_STORAGE_BUCKET") ?? CLINIC_ASSET_STORAGE_BUCKET;

  if (driver === "memory") {
    return { available: true, driver: "memory", bucket };
  }

  if (driver === "supabase" && url && serviceRoleKey && bucket) {
    return { available: true, driver: "supabase", bucket };
  }

  return { available: false, reason: "unconfigured" };
}

export function isClinicAssetStorageConfigured(): boolean {
  return clinicAssetStorageStatus().available;
}

export function supabaseClinicAssetConfig(): {
  url: string;
  serviceRoleKey: string;
  bucket: string;
} | null {
  const status = clinicAssetStorageStatus();
  if (!status.available || status.driver !== "supabase") {
    return null;
  }

  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    bucket: status.bucket,
  };
}
