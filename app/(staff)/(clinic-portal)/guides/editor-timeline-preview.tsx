import { GuideTimeline } from "@/app/(aftercare)/components/guide-timeline";
import { AFTERCARE_THEME_SCOPE } from "@/lib/branding/aftercare-theme";
import { relativeTimelinePeriodLabel } from "@/lib/aftercare/relative-day-label";
import type { ComposedGuideSection } from "@/lib/aftercare/types";
import type { CSSProperties } from "react";

import type { EditorSection } from "@/app/(staff)/(clinic-portal)/guides/editor-types";

export function editorStagesToComposed(
  stages: EditorSection[]
): ComposedGuideSection[] {
  return stages.map((stage) => {
    const startDay = stage.startDay === "" ? null : Number(stage.startDay);
    const endDay = stage.endDay === "" ? null : Number(stage.endDay);
    return {
      key: stage.key,
      kind: "RECOVERY_TIMELINE",
      title: stage.title.trim() || "Untitled stage",
      body: stage.body,
      periodLabel: relativeTimelinePeriodLabel({
        periodLabel: stage.periodLabel,
        startDay,
        endDay,
      }),
      startDay: Number.isInteger(startDay) ? startDay : null,
      endDay: Number.isInteger(endDay) ? endDay : null,
      provenance: "practice_custom",
    };
  });
}

export function EditorTimelinePreview({
  stages,
  themeStyle,
}: {
  stages: EditorSection[];
  themeStyle?: CSSProperties;
}) {
  const sections = editorStagesToComposed(stages);

  return (
    <div
      className={`${AFTERCARE_THEME_SCOPE} staffEditorPreview`}
      style={themeStyle}
      data-editor-preview=""
    >
      {sections.length === 0 ? (
        <p className="text-sm text-staff-muted">
          Add recovery stages to preview the patient timeline.
        </p>
      ) : (
        <GuideTimeline
          sections={sections}
          compact
          heading="Patient timeline preview"
          headingId="editor-timeline-preview-heading"
        />
      )}
    </div>
  );
}
