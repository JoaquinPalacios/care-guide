export interface ClinicLogoObject {
  clinicId: string;
  storageKey: string;
  publicPath: string;
}

export interface ClinicLogoUploadInput {
  clinicId: string;
  storageKey: string;
  bytes: Uint8Array;
  mimeType: string;
}

export interface ClinicLogoReadResult {
  bytes: Uint8Array;
  mimeType: string;
}

export interface ClinicAssetStorage {
  uploadLogo(input: ClinicLogoUploadInput): Promise<ClinicLogoObject>;
  deleteLogo(input: { clinicId: string; storageKey: string }): Promise<void>;
  readLogo(input: {
    clinicId: string;
    storageKey: string;
  }): Promise<ClinicLogoReadResult | null>;
  getPublicLogoUrl(input: { clinicId: string; storageKey: string }): string;
}
