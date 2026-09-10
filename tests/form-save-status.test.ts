import { describe, expect, it } from "vitest";

import {
  formSaveStatus,
  formSaveStatusLabel,
} from "@/lib/clinic-portal/form-save-status";

describe("form save status", () => {
  it("prefers the in-flight saving state over dirty", () => {
    expect(formSaveStatus({ dirty: true, pending: true })).toBe("saving");
    expect(formSaveStatusLabel("saving")).toBe("Saving…");
  });

  it("marks local edits as unsaved until the server confirms", () => {
    expect(formSaveStatus({ dirty: true, pending: false })).toBe("unsaved");
    expect(formSaveStatusLabel("unsaved")).toBe("Unsaved changes");
  });

  it("returns saved only when the form matches the last confirmed server state", () => {
    expect(formSaveStatus({ dirty: false, pending: false })).toBe("saved");
    expect(formSaveStatusLabel("saved")).toBe("Saved");
  });
});
