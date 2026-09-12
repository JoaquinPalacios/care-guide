export function staffPreviewBackLabel(input: {
  canEdit: boolean;
  guideTitle: string;
}): string {
  if (!input.canEdit) {
    return "Back to guides";
  }

  const title = input.guideTitle.trim();
  return title ? `Back to ${title}` : "Back to guide";
}
