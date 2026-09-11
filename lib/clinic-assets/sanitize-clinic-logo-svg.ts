import "server-only";

import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export const CLINIC_LOGO_SVG_MAX_BYTES = 1024 * 1024;
const SVG_MAX_EDGE = 4096;

export type ClinicSvgSanitization =
  | { ok: true; bytes: Uint8Array; mimeType: "image/svg+xml" }
  | { ok: false; error: string };

const FORBIDDEN_TAGS = [
  "script",
  "foreignObject",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "button",
  "textarea",
  "video",
  "audio",
  "canvas",
  "applet",
  "frame",
  "frameset",
  "html",
  "head",
  "body",
  "style",
  "math",
  "handler",
  "animate",
  "set",
] as const;

const URI_ATTRIBUTES = new Set([
  "href",
  "xlink:href",
  "src",
  "action",
  "xlink:actuate",
]);

const NAMESPACE_ATTRIBUTES = new Set([
  "xmlns",
  "xmlns:xlink",
  "xml:space",
  "xml:lang",
]);

let purify: ReturnType<typeof createDOMPurify> | null = null;

function getPurify(): ReturnType<typeof createDOMPurify> {
  if (!purify) {
    const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
      contentType: "text/html",
    });
    purify = createDOMPurify(window);
  }
  return purify;
}

function decodeSvgSource(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).trim();
  } catch {
    return null;
  }
}

function looksLikeSvgRoot(source: string): boolean {
  const head = source.slice(0, 512).toLowerCase();
  return (
    head.startsWith("<svg") ||
    (head.startsWith("<?xml") && head.includes("<svg"))
  );
}

function rejectUnsafeSource(source: string): string | null {
  if (/<!ENTITY/i.test(source) || /<!DOCTYPE[^>]+SYSTEM/i.test(source)) {
    return "This SVG includes an unsafe document type.";
  }
  if (/<\?(?!xml\b)/i.test(source)) {
    return "This SVG includes an unsafe processing instruction.";
  }
  return null;
}

function parseSvgDocument(source: string): {
  root: Element;
  serialize: () => string;
} | null {
  try {
    const dom = new JSDOM(source, { contentType: "image/svg+xml" });
    const root = dom.window.document.documentElement;
    if (!root || root.localName.toLowerCase() !== "svg") {
      return null;
    }
    return {
      root,
      serialize: () => root.outerHTML,
    };
  } catch {
    return null;
  }
}

function copyGeometry(from: Element, to: Element): void {
  const viewBox = from.getAttribute("viewBox") ?? from.getAttribute("viewbox");
  const width = from.getAttribute("width");
  const height = from.getAttribute("height");
  if (viewBox && !to.getAttribute("viewBox") && !to.getAttribute("viewbox")) {
    to.setAttribute("viewBox", viewBox);
  }
  if (width && !to.getAttribute("width")) {
    to.setAttribute("width", width);
  }
  if (height && !to.getAttribute("height")) {
    to.setAttribute("height", height);
  }
}

function dimensionTooLarge(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const numeric = Number.parseFloat(value.replace(/px$/i, ""));
  return Number.isFinite(numeric) && Math.abs(numeric) > SVG_MAX_EDGE;
}

function viewBoxTooLarge(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return true;
  }
  return Math.abs(parts[2]) > SVG_MAX_EDGE || Math.abs(parts[3]) > SVG_MAX_EDGE;
}

function hasSensibleSvgMetrics(root: Element): boolean {
  const width = root.getAttribute("width");
  const height = root.getAttribute("height");
  const viewBox = root.getAttribute("viewBox") ?? root.getAttribute("viewbox");
  if (!width && !height && !viewBox) {
    return false;
  }
  if (
    dimensionTooLarge(width) ||
    dimensionTooLarge(height) ||
    viewBoxTooLarge(viewBox)
  ) {
    return false;
  }
  return true;
}

function isSafeUri(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "none") {
    return true;
  }
  if (trimmed.startsWith("#")) {
    return true;
  }
  return false;
}

function containsUnsafeUri(root: Element): boolean {
  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;
      if (NAMESPACE_ATTRIBUTES.has(name) || name.startsWith("xmlns:")) {
        continue;
      }
      if (name.startsWith("on")) {
        return true;
      }
      if (URI_ATTRIBUTES.has(name) && !isSafeUri(value)) {
        return true;
      }
      if (name === "style" && /url\s*\(/i.test(value)) {
        return true;
      }
      if (/javascript:|data:|vbscript:/i.test(value)) {
        return true;
      }
      if (URI_ATTRIBUTES.has(name) && /https?:|\/\//i.test(value)) {
        return true;
      }
    }
  }
  return false;
}

export function sanitizeClinicLogoSvg(
  bytes: Uint8Array
): ClinicSvgSanitization {
  if (bytes.byteLength === 0) {
    return { ok: false, error: "Choose a valid SVG logo." };
  }
  if (bytes.byteLength > CLINIC_LOGO_SVG_MAX_BYTES) {
    return { ok: false, error: "SVG logos must be 1 MB or smaller." };
  }

  const source = decodeSvgSource(bytes);
  if (!source || !looksLikeSvgRoot(source)) {
    return { ok: false, error: "The file is not valid SVG markup." };
  }

  const unsafe = rejectUnsafeSource(source);
  if (unsafe) {
    return { ok: false, error: unsafe };
  }

  const parsed = parseSvgDocument(source);
  if (!parsed) {
    return { ok: false, error: "The SVG markup is malformed." };
  }
  if (!hasSensibleSvgMetrics(parsed.root)) {
    return {
      ok: false,
      error: "SVG logos must include a sensible viewBox or width and height.",
    };
  }

  const cleaned = getPurify().sanitize(parsed.serialize(), {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [...FORBIDDEN_TAGS],
    FORBID_ATTR: ["style", "srcdoc"],
    ADD_ATTR: ["viewBox", "xmlns", "xmlns:xlink"],
    PARSER_MEDIA_TYPE: "application/xhtml+xml",
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    KEEP_CONTENT: false,
  });

  if (typeof cleaned !== "string" || !cleaned.trim()) {
    return { ok: false, error: "This SVG could not be sanitized." };
  }

  const sanitized = parseSvgDocument(cleaned.trim());
  if (!sanitized) {
    return { ok: false, error: "Sanitized SVG is no longer valid." };
  }
  copyGeometry(parsed.root, sanitized.root);
  if (containsUnsafeUri(sanitized.root)) {
    return {
      ok: false,
      error: "This SVG includes an unsafe script, link, or remote resource.",
    };
  }
  if (!hasSensibleSvgMetrics(sanitized.root)) {
    return {
      ok: false,
      error: "Sanitized SVG is missing a usable viewBox or size.",
    };
  }

  const output = `<?xml version="1.0" encoding="UTF-8"?>\n${sanitized.serialize()}\n`;
  return {
    ok: true,
    bytes: new TextEncoder().encode(output),
    mimeType: "image/svg+xml",
  };
}
