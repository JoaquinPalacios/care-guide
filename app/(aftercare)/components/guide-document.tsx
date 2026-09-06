import { GuideSection } from "@/app/(aftercare)/components/guide-section";
import { GuideTimeline } from "@/app/(aftercare)/components/guide-timeline";
import { groupGuideSections } from "@/lib/aftercare/group-guide-sections";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

export function GuideDocument({
  sections,
}: {
  sections: ComposedGuideSection[];
}) {
  const blocks = groupGuideSections(sections);

  return (
    <>
      {blocks.map((block) =>
        block.type === "timeline" ? (
          <GuideTimeline
            key={block.sections[0]?.key ?? "timeline"}
            sections={block.sections}
          />
        ) : (
          <GuideSection key={block.section.key} section={block.section} />
        )
      )}
    </>
  );
}
