export type FormSaveStatus = "saving" | "unsaved" | "saved";

export function formSaveStatus(input: {
  dirty: boolean;
  pending: boolean;
}): FormSaveStatus {
  if (input.pending) {
    return "saving";
  }

  if (input.dirty) {
    return "unsaved";
  }

  return "saved";
}

export function formSaveStatusLabel(status: FormSaveStatus): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "unsaved":
      return "Unsaved changes";
    default:
      return "Saved";
  }
}
