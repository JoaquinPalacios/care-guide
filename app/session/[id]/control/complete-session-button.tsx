"use client";

import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";

import { completeSessionAction } from "@/app/session/[id]/control/actions";

interface CompleteSessionButtonProps {
  sessionId: string;
}

export function CompleteSessionButton({
  sessionId,
}: CompleteSessionButtonProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Complete this session? The room will be unblocked.")) {
      event.preventDefault();
    }
  }

  return (
    <form action={completeSessionAction} onSubmit={handleSubmit}>
      <input type="hidden" name="sessionId" value={sessionId} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
    >
      {pending ? "Completing..." : "Complete session"}
    </button>
  );
}
