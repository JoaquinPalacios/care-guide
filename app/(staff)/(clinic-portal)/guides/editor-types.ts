import type { GuideSectionKind } from "@/lib/aftercare/types";

export interface EditorSection {
  key: string;
  kind: GuideSectionKind;
  title: string;
  body: string;
  periodLabel: string;
  startDay: string;
  endDay: string;
}

export const ADDITIONAL_KINDS: GuideSectionKind[] = [
  "INTRODUCTION",
  "IMMEDIATE_CARE",
  "FIRST_24_HOURS",
  "WHAT_IS_NORMAL",
  "PAIN",
  "RESTRICTIONS",
  "MEDICATIONS",
  "SITE_CARE",
  "WHAT_TO_AVOID",
  "CUSTOM",
];

export const WARNING_KINDS: GuideSectionKind[] = [
  "WARNING_SIGNS",
  "CONTACT_PRACTICE",
  "EMERGENCY",
];

export function newEditorKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
