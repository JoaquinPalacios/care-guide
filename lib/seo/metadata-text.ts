const TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_OR_STYLE_PATTERN = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const WHITESPACE_PATTERN = /\s+/g;

export function sanitizeMetadataText(value: string, maxLength = 180): string {
  const stripped = value
    .replace(SCRIPT_OR_STYLE_PATTERN, " ")
    .replace(TAG_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return stripped.slice(0, maxLength).trim();
}
