"use client";

export function ColorField({
  id,
  name,
  label,
  value,
  disabled,
  error,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#([0-9a-fA-F]{6})$/.test(value) ? value : "#155e75";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id} id={`${id}-label`}>
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="h-10 w-10 rounded-md border border-staff-line"
          style={{ background: pickerValue }}
          aria-hidden="true"
        />
        <input
          id={`${id}-picker`}
          type="color"
          value={pickerValue}
          disabled={disabled}
          aria-label={`${label} picker`}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border border-staff-line bg-staff-panel disabled:opacity-60"
        />
        <input
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : `${id}-value`}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 min-w-[8rem] flex-1 rounded-md border border-staff-line bg-staff-panel px-3 text-sm focus:border-staff-brand focus:ring-2 focus:ring-staff-brand/20 disabled:opacity-60"
        />
      </div>
      <p id={`${id}-value`} className="text-sm text-staff-muted">
        Value: {value || "not set"}
      </p>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
