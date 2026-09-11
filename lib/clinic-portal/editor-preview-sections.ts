import { relativeStageWhenLabel } from "@/lib/aftercare/recovery-day-label";
import type {
  ComposedGuideSection,
  GuideSectionKind,
} from "@/lib/aftercare/types";

export interface EditorPreviewStageInput {
  key: string;
  kind?: GuideSectionKind;
  title: string;
  body: string;
  periodLabel: string;
  startDay: string;
  endDay: string;
}

function optionalDay(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function editorStagesToPreviewSections(
  stages: EditorPreviewStageInput[]
): ComposedGuideSection[] {
  return stages.map((stage) => {
    const startDay = optionalDay(stage.startDay);
    const endDay = optionalDay(stage.endDay);
    return {
      key: stage.key,
      kind: stage.kind ?? "RECOVERY_TIMELINE",
      title: stage.title.trim() || "Untitled stage",
      body: stage.body,
      periodLabel: relativeStageWhenLabel({
        periodLabel: stage.periodLabel,
        startDay,
        endDay,
      }),
      startDay,
      endDay,
      provenance: "practice_custom",
    };
  });
}
