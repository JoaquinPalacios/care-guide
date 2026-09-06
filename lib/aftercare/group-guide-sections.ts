import type { ComposedGuideSection } from "@/lib/aftercare/types";

export type GuideSectionBlock =
  | { type: "single"; section: ComposedGuideSection }
  | { type: "timeline"; sections: ComposedGuideSection[] };

export function groupGuideSections(
  sections: ComposedGuideSection[]
): GuideSectionBlock[] {
  const blocks: GuideSectionBlock[] = [];

  for (const section of sections) {
    if (section.kind !== "RECOVERY_TIMELINE") {
      blocks.push({ type: "single", section });
      continue;
    }

    const last = blocks.at(-1);
    if (last?.type === "timeline") {
      last.sections.push(section);
      continue;
    }

    blocks.push({ type: "timeline", sections: [section] });
  }

  return blocks;
}
