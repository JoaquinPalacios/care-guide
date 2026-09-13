export class ClinicAssetStorageUnavailableError extends Error {
  constructor(message = "Clinic logo storage is not provisioned.") {
    super(message);
    this.name = "ClinicAssetStorageUnavailableError";
  }
}

export function clinicAssetErrorClass(error: unknown): string {
  if (error instanceof Error && error.name) {
    return error.name;
  }
  return "unknown";
}
