export const CLINIC_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const CLINIC_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type ClinicLogoKind = "png" | "jpeg" | "webp";

export type ClinicLogoValidation =
  | {
      ok: true;
      kind: ClinicLogoKind;
      mimeType: (typeof CLINIC_LOGO_MIME_TYPES)[number];
      extension: "png" | "jpg" | "webp";
    }
  | {
      ok: false;
      error: string;
    };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function startsWith(
  bytes: Uint8Array,
  signature: number[],
  offset = 0
): boolean {
  if (bytes.length < offset + signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[offset + index] === value);
}

function looksLikeSvg(bytes: Uint8Array): boolean {
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 256))
    .trim()
    .toLowerCase();
  return (
    head.startsWith("<svg") || head.startsWith("<?xml") || head.includes("<svg")
  );
}

export function detectClinicLogoKind(bytes: Uint8Array): ClinicLogoKind | null {
  if (startsWith(bytes, PNG_SIGNATURE)) {
    return "png";
  }
  if (startsWith(bytes, JPEG_SIGNATURE)) {
    return "jpeg";
  }
  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) {
    return "webp";
  }
  return null;
}

export function validateClinicLogo(input: {
  bytes: Uint8Array;
  mimeType: string;
}): ClinicLogoValidation {
  if (input.bytes.byteLength === 0) {
    return { ok: false, error: "Choose a PNG, JPEG, or WebP image." };
  }

  if (input.bytes.byteLength > CLINIC_LOGO_MAX_BYTES) {
    return { ok: false, error: "Logo files must be 2 MB or smaller." };
  }

  if (looksLikeSvg(input.bytes) || input.mimeType === "image/svg+xml") {
    return { ok: false, error: "SVG logos are not accepted." };
  }

  const kind = detectClinicLogoKind(input.bytes);
  if (!kind) {
    return {
      ok: false,
      error: "The file is not a valid PNG, JPEG, or WebP image.",
    };
  }

  const expectedMime =
    kind === "png"
      ? "image/png"
      : kind === "jpeg"
        ? "image/jpeg"
        : "image/webp";

  if (input.mimeType !== expectedMime) {
    return {
      ok: false,
      error: "The file type does not match the image contents.",
    };
  }

  return {
    ok: true,
    kind,
    mimeType: expectedMime,
    extension: kind === "jpeg" ? "jpg" : kind,
  };
}

export function clinicLogoObjectKey(input: {
  clinicId: string;
  objectId: string;
  extension: "png" | "jpg" | "webp";
}): string {
  return `clinics/${input.clinicId}/branding/${input.objectId}.${input.extension}`;
}

export function clinicLogoPublicPath(storageKey: string): string | null {
  const match =
    /^clinics\/([A-Za-z0-9._-]+)\/branding\/([A-Za-z0-9._-]+\.(?:png|jpe?g|webp))$/.exec(
      storageKey
    );
  if (!match) {
    return null;
  }
  return `/clinic-branding/${match[1]}/${match[2]}`;
}

export function storageKeyFromClinicLogoPath(
  logoUrl: string | null | undefined
): string | null {
  if (!logoUrl) {
    return null;
  }
  const match =
    /^\/clinic-branding\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+\.(?:png|jpe?g|webp))$/.exec(
      logoUrl.trim()
    );
  if (!match) {
    return null;
  }
  return `clinics/${match[1]}/branding/${match[2]}`;
}
