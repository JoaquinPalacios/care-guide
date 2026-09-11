import type {
  ClinicAssetStorage,
  ClinicLogoReadResult,
} from "@/lib/clinic-assets/clinic-asset-storage";
import { clinicLogoPublicPath } from "@/lib/clinic-assets/clinic-logo";

const store = new Map<string, ClinicLogoReadResult>();

export function resetMemoryClinicAssetStorage(): void {
  store.clear();
}

export function createMemoryClinicAssetStorage(): ClinicAssetStorage {
  return {
    async uploadLogo(input) {
      const publicPath = clinicLogoPublicPath(input.storageKey);
      if (!publicPath) {
        throw new Error("Could not derive a same-origin logo path.");
      }
      store.set(input.storageKey, {
        bytes: input.bytes.slice(),
        mimeType: input.mimeType,
      });
      return {
        clinicId: input.clinicId,
        storageKey: input.storageKey,
        publicPath,
      };
    },

    async deleteLogo(input) {
      store.delete(input.storageKey);
    },

    async readLogo(input) {
      const stored = store.get(input.storageKey);
      if (!stored) {
        return null;
      }
      return {
        bytes: stored.bytes.slice(),
        mimeType: stored.mimeType,
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
