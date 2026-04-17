"use client";

import { PatientDisplayMode } from "@prisma/client";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { createSessionAction } from "@/app/sessions/new/actions";
import {
  type CreateSessionActionState,
  initialCreateSessionActionState,
} from "@/app/sessions/new/state";
import type { SessionFormOptions } from "@/lib/sessions/list-session-form-options";

interface NewSessionFormProps {
  options: SessionFormOptions;
}

const DISPLAY_MODES: {
  value: PatientDisplayMode;
  label: string;
  description: string;
}[] = [
  {
    value: PatientDisplayMode.CALM,
    label: "Calm",
    description: "Short, reassuring copy for anxious patients.",
  },
  {
    value: PatientDisplayMode.STANDARD,
    label: "Standard",
    description: "Balanced copy that works for most patients.",
  },
  {
    value: PatientDisplayMode.DETAILED,
    label: "Detailed",
    description: "Extra clinical context for curious patients.",
  },
];

export function NewSessionForm({ options }: NewSessionFormProps) {
  const [state, formAction, isPending] = useActionState<
    CreateSessionActionState,
    FormData
  >(createSessionAction, initialCreateSessionActionState);

  const [procedureTemplateId, setProcedureTemplateId] = useState<string>("");

  const selectedTemplate = useMemo(
    () =>
      options.procedureTemplates.find(
        (template) => template.id === procedureTemplateId
      ) ?? null,
    [options.procedureTemplates, procedureTemplateId]
  );

  const selectedAreaOptions = selectedTemplate?.selectedAreaOptions ?? [];
  const selectedAreaRequired =
    selectedTemplate !== null && selectedAreaOptions.length > 0;

  const hasFormOptions =
    options.rooms.length > 0 &&
    options.doctors.length > 0 &&
    options.procedureTemplates.length > 0;

  if (!hasFormOptions) {
    return <EmptyState options={options} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FieldSet id="roomId" label="Room" error={state.fieldErrors.roomId}>
        <select
          id="roomId"
          name="roomId"
          required
          defaultValue=""
          className={selectClassName}
        >
          <option value="" disabled>
            Select a room
          </option>
          {options.rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </FieldSet>

      <FieldSet id="doctorId" label="Doctor" error={state.fieldErrors.doctorId}>
        <select
          id="doctorId"
          name="doctorId"
          required
          defaultValue=""
          className={selectClassName}
        >
          <option value="" disabled>
            Select a doctor
          </option>
          {options.doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </FieldSet>

      <FieldSet
        id="procedureTemplateId"
        label="Procedure template"
        error={state.fieldErrors.procedureTemplateId}
      >
        <select
          id="procedureTemplateId"
          name="procedureTemplateId"
          required
          value={procedureTemplateId}
          onChange={(event) => setProcedureTemplateId(event.target.value)}
          className={selectClassName}
        >
          <option value="" disabled>
            Select a procedure template
          </option>
          {options.procedureTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </FieldSet>

      <FieldSet
        id="selectedAreaOptionId"
        label={`Selected area${selectedAreaRequired ? "" : " (not required for this template)"}`}
        error={state.fieldErrors.selectedAreaOptionId}
      >
        <select
          id="selectedAreaOptionId"
          name="selectedAreaOptionId"
          required={selectedAreaRequired}
          disabled={!selectedAreaRequired}
          defaultValue=""
          className={`${selectClassName} disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400`}
        >
          <option value="">
            {selectedAreaRequired ? "Select an area" : "No selection required"}
          </option>
          {selectedAreaOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldSet>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-zinc-900">
          Display mode
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {DISPLAY_MODES.map((mode, index) => (
            <label
              key={mode.value}
              className="flex cursor-pointer flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:border-zinc-400 has-[:checked]:border-zinc-950 has-[:checked]:ring-1 has-[:checked]:ring-zinc-950"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayMode"
                  value={mode.value}
                  defaultChecked={index === 1}
                  className="size-4"
                />
                <span className="font-medium text-zinc-950">{mode.label}</span>
              </span>
              <span className="text-xs leading-5 text-zinc-600">
                {mode.description}
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors.displayMode ? (
          <p className="text-sm text-red-600">
            {state.fieldErrors.displayMode}
          </p>
        ) : null}
      </fieldset>

      {state.error ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isPending ? "Creating session..." : "Create draft session"}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

const selectClassName =
  "h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10";

function FieldSet({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-900" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ options }: { options: SessionFormOptions }) {
  const missing: string[] = [];
  if (options.rooms.length === 0) missing.push("rooms");
  if (options.doctors.length === 0) missing.push("doctors");
  if (options.procedureTemplates.length === 0)
    missing.push("procedure templates");

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm leading-6 text-zinc-600 shadow-sm">
      Your clinic needs at least one active {missing.join(", ")} before you can
      start a session. Seed or configure those records, then come back to this
      page.
    </div>
  );
}
