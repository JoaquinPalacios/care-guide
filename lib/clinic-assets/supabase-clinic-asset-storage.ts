import { createClient } from "@supabase/supabase-js";

import type { ClinicAssetStorage } from "@/lib/clinic-assets/clinic-asset-storage";
import { clinicLogoPublicPath } from "@/lib/clinic-assets/clinic-logo";
import { supabaseClinicAssetConfig } from "@/lib/clinic-assets/config";

export class ClinicAssetStorageUnavailableError extends Error {
  constructor(message = "Clinic logo storage is not provisioned.") {
    super(message);
    this.name = "ClinicAssetStorageUnavailableError";
  }
}

export function createSupabaseClinicAssetStorage(): ClinicAssetStorage {
  const config = supabaseClinicAssetConfig();
  if (!config) {
    throw new ClinicAssetStorageUnavailableError();
  }

  const client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async uploadLogo(input) {
      const { error } = await client.storage
        .from(config.bucket)
        .upload(input.storageKey, input.bytes, {
          contentType: input.mimeType,
          upsert: true,
        });

      if (error) {
        throw new Error("Could not store the clinic logo.");
      }

      const publicPath = clinicLogoPublicPath(input.storageKey);
      if (!publicPath) {
        throw new Error("Could not derive a same-origin logo path.");
      }

      return {
        clinicId: input.clinicId,
        storageKey: input.storageKey,
        publicPath,
      };
    },

    async deleteLogo(input) {
      const { error } = await client.storage
        .from(config.bucket)
        .remove([input.storageKey]);

      if (error) {
        throw new Error("Could not remove the previous clinic logo.");
      }
    },

    async readLogo(input) {
      const { data, error } = await client.storage
        .from(config.bucket)
        .download(input.storageKey);

      if (error || !data) {
        return null;
      }

      return {
        bytes: new Uint8Array(await data.arrayBuffer()),
        mimeType: data.type || "application/octet-stream",
      };
    },

    getPublicLogoUrl(input) {
      const publicPath = clinicLogoPublicPath(input.storageKey);
      if (!publicPath) {
        throw new Error("Could not derive a same-origin logo path.");
      }
      return publicPath;
    },
  };
}
