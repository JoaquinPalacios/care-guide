/**
 * Patient-facing href validation. Only http(s), tel, and same-origin logo
 * paths are allowed. Unsafe schemes (javascript:, data:, etc.) never render.
 */

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const LOGO_PATH_PATTERN =
  /^\/(?!\/)(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+\.(?:svg|png|jpe?g|webp)$/;
const TEL_PATTERN = /^\+?\d{6,20}$/;

export function toSafeHttpHref(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (!HTTP_PROTOCOLS.has(url.protocol)) {
      return null;
    }
    if (url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function toTelHref(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[^\d+]/g, "");
  if (!TEL_PATTERN.test(normalized)) {
    return null;
  }

  return `tel:${normalized}`;
}

export function toSafeLogoSrc(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes(":")
  ) {
    return null;
  }

  return LOGO_PATH_PATTERN.test(trimmed) ? trimmed : null;
}
