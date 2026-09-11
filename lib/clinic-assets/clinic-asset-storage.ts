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

export interface ClinicAssetStorage {
  uploadLogo(input: ClinicLogoUploadInput): Promise<ClinicLogoObject>;
  deleteLogo(input: { clinicId: string; storageKey: string }): Promise<void>;
  getPublicLogoUrl(input: { clinicId: string; storageKey: string }): string;
}
