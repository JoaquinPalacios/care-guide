import { firstSectionParagraph } from "@/lib/aftercare/section-body";
import { timelineStageSummary } from "@/lib/aftercare/relative-day-label";
import { validateTimelineRanges } from "@/lib/aftercare/timeline-range";
import type { EditorSection } from "@/app/(staff)/(clinic-portal)/guides/editor-types";

export function stageIssueMessage(
  stage: EditorSection,
  stages: EditorSection[]
): string | null {
  if (!stage.title.trim()) {
    return "Needs attention";
  }
  if (!stage.body.trim()) {
    return "Needs attention";
  }

  const issues = validateTimelineRanges(
    stages.map((item) => ({
      key: item.key,
      periodLabel: item.periodLabel,
      startDay: item.startDay === "" ? null : Number(item.startDay),
      endDay: item.endDay === "" ? null : Number(item.endDay),
    }))
  );
  const related = issues.find((issue) => issue.keys.includes(stage.key));
  return related ? "Needs attention" : null;
}

export function stageExcerpt(stage: EditorSection): string {
  return firstSectionParagraph(stage.body);
}

export function stageSummary(stage: EditorSection) {
  return timelineStageSummary({
    periodLabel: stage.periodLabel,
    startDay: stage.startDay === "" ? null : Number(stage.startDay),
    endDay: stage.endDay === "" ? null : Number(stage.endDay),
    title: stage.title,
  });
}
