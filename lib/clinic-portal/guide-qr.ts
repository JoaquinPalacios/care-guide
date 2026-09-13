import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const GUIDE_QR_FOREGROUND = "#0a0d14";
export const GUIDE_QR_BACKGROUND = "#ffffff";
export const GUIDE_QR_MARGIN_MODULES = 4;
export const GUIDE_QR_ERROR_CORRECTION = "H" as const;
export const GUIDE_QR_PNG_SIZE_PX = 1024;

export type GuideQrFormat = "svg" | "png";

export function sanitizeQrFilenamePart(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 48);
}

export function guideQrFilename(input: {
  clinicSlug: string;
  publicSlug: string;
  format: GuideQrFormat;
}): string {
  const product = sanitizeQrFilenamePart(PRODUCT_NAME) || "river-aftercare";
  const clinic = sanitizeQrFilenamePart(input.clinicSlug) || "clinic";
  const guide = sanitizeQrFilenamePart(input.publicSlug) || "guide";
  return `${product}-${clinic}-${guide}-qr.${input.format}`;
}

export function parseGuideQrFormat(
  value: string | null | undefined
): GuideQrFormat | null {
  if (value === "svg" || value === "png") {
    return value;
  }
  return null;
}

export function guideQrDownloadPath(
  guideId: string,
  format: GuideQrFormat
): string {
  return `/guides/${guideId}/qr?format=${format}`;
}
