"use client";

import { useEffect, useRef, useState } from "react";

import {
  formSaveStatusLabel,
  type FormSaveStatus,
} from "@/lib/clinic-portal/form-save-status";

export function SaveStatus({
  status,
  error,
  success,
}: {
  status: FormSaveStatus;
  error?: string;
  success?: string;
}) {
  const [live, setLive] = useState("");
  const seenPending = useRef(false);

  useEffect(() => {
    if (status === "saving") {
      seenPending.current = true;
      setLive("Saving");
      return;
    }

    if (status === "saved" && seenPending.current) {
      setLive("Saved");
    }
  }, [status]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-sm text-staff-muted" data-save-state={status}>
        {formSaveStatusLabel(status)}
      </p>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert" tabIndex={-1}>
          {error}
        </p>
      ) : null}
      {success && !error ? (
        <p className="text-sm text-staff-muted" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
