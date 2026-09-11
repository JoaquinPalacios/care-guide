import type { ClinicAssetStorage } from "@/lib/clinic-assets/clinic-asset-storage";
import { clinicAssetStorageStatus } from "@/lib/clinic-assets/config";
import { createMemoryClinicAssetStorage } from "@/lib/clinic-assets/memory-clinic-asset-storage";
import { createSupabaseClinicAssetStorage } from "@/lib/clinic-assets/supabase-clinic-asset-storage";

let memoryStorage: ClinicAssetStorage | null = null;

export function getClinicAssetStorage(): ClinicAssetStorage | null {
  const status = clinicAssetStorageStatus();
  if (!status.available) {
    return null;
  }

  if (status.driver === "supabase") {
    return createSupabaseClinicAssetStorage();
  }

  if (!memoryStorage) {
    memoryStorage = createMemoryClinicAssetStorage();
  }
  return memoryStorage;
}

/** Test-only: drop the memoized memory driver. */
export function resetClinicAssetStorageCache(): void {
  memoryStorage = null;
}
