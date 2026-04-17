"use client";

import { useFormStatus } from "react-dom";

import { moveStageAction } from "@/app/session/[id]/control/actions";

interface StageControlsProps {
  sessionId: string;
  canMovePrevious: boolean;
  canMoveNext: boolean;
}

export function StageControls({
  sessionId,
  canMovePrevious,
  canMoveNext,
}: StageControlsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <form action={moveStageAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="direction" value="PREVIOUS" />
        <StageDirectionButton
          label="Previous stage"
          pendingLabel="Moving back..."
          disabled={!canMovePrevious}
          variant="secondary"
        />
      </form>
      <form action={moveStageAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="direction" value="NEXT" />
        <StageDirectionButton
          label="Next stage"
          pendingLabel="Advancing..."
          disabled={!canMoveNext}
          variant="primary"
        />
      </form>
    </div>
  );
}

interface StageDirectionButtonProps {
  label: string;
  pendingLabel: string;
  disabled: boolean;
  variant: "primary" | "secondary";
}

function StageDirectionButton({
  label,
  pendingLabel,
  disabled,
  variant,
}: StageDirectionButtonProps) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed";
  const primary =
    "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500";
  const secondary =
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 disabled:border-zinc-200 disabled:text-zinc-400";

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`${base} ${variant === "primary" ? primary : secondary}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
