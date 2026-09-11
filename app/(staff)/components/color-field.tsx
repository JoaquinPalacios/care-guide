"use client";

export function ColorField({
  id,
  name,
  label,
  value,
  disabled,
  error,
  helper,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#([0-9a-fA-F]{6})$/.test(value) ? value : "#155e75";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="staffColorControl">
        <input
          id={`${id}-picker`}
          type="color"
          value={pickerValue}
          disabled={disabled}
          aria-label={`${label} picker`}
          onChange={(event) => onChange(event.target.value)}
          className="staffColorPicker"
        />
        <input
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${id}-error` : helper ? `${id}-helper` : undefined
          }
          onChange={(event) => onChange(event.target.value)}
          className="staffField staffColorHex"
        />
      </div>
      {helper ? (
        <p id={`${id}-helper`} className="text-sm text-staff-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
