"use client";

import { useId, useState } from "react";

export function PasswordVisibilityField({
  value,
  onChange,
  invalid,
  errorId,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  errorId?: string;
}) {
  const [visible, setVisible] = useState(false);
  const reactId = useId().replace(/:/g, "");
  const toggleId = `password-visibility-${reactId}`;

  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid ? "true" : "false"}
        aria-describedby={errorId}
        className="h-11 w-full rounded-md border border-staff-line bg-staff-panel py-0 pr-12 pl-3 text-base text-staff-ink outline-none transition focus:border-staff-brand focus:ring-2 focus:ring-staff-brand/20"
      />
      <button
        id={toggleId}
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-staff-muted transition hover:bg-staff-canvas hover:text-staff-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12S6.5 5.5 12 5.5 21.5 12 21.5 12 17.5 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.4" />
      <path d="M6.7 6.8C4.4 8.2 2.5 12 2.5 12S6.5 18.5 12 18.5c1.7 0 3.2-.4 4.5-1.1" />
      <path d="M14.1 5.7A10.4 10.4 0 0 1 12 5.5C6.5 5.5 2.5 12 2.5 12" />
      <path d="M17.3 9.2C19.4 10.7 21.5 12 21.5 12S17.5 18.5 12 18.5" />
    </svg>
  );
}
