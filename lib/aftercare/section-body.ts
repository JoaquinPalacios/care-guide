import type { ComposedGuideSection } from "@/lib/aftercare/types";

export function sectionBodyParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function firstSectionParagraph(body: string): string {
  return sectionBodyParagraphs(body)[0] ?? "";
}

export function timelineSectionsOf(
  sections: ComposedGuideSection[]
): ComposedGuideSection[] {
  return sections.filter((section) => section.kind === "RECOVERY_TIMELINE");
}
