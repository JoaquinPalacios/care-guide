"use client";

import { useActionState, useState } from "react";

import { ColorField } from "@/app/(staff)/components/color-field";
import {
  savePracticeSettingsAction,
  type PracticeActionState,
} from "@/app/(staff)/(clinic-portal)/practice/actions";
import type { PracticeSettingsInput } from "@/lib/clinic-portal/practice-settings-schema";

const initial: PracticeActionState = {};

export function PracticeSettingsForm({
  values,
  canEdit,
  patientSiteHref,
}: {
  values: PracticeSettingsInput;
  canEdit: boolean;
  patientSiteHref: string | null;
}) {
  const [state, action, pending] = useActionState(
    savePracticeSettingsAction,
    initial
  );
  const [primaryColor, setPrimaryColor] = useState(values.primaryColor ?? "");
  const [accentColor, setAccentColor] = useState(values.accentColor ?? "");
  const [neutralColor, setNeutralColor] = useState(values.neutralColor ?? "");

  return (
    <form action={action} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
        <h2 className="text-base font-semibold">Practice identity</h2>
        <Field label="Display name" htmlFor="displayName">
          <input
            id="displayName"
            name="displayName"
            defaultValue={values.displayName}
            disabled={!canEdit}
            className={fieldClass}
          />
          <FieldError message={state.fieldErrors?.displayName} />
        </Field>
        <Field label="Current logo path" htmlFor="logoUrl">
          {values.logoUrl ? (
            // Same-origin clinic mark; next/image is unnecessary for this path preview.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.logoUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-md border border-staff-line bg-white object-contain"
            />
          ) : (
            <p className="text-sm text-staff-muted">No logo configured.</p>
          )}
          <input
            id="logoUrl"
            name="logoUrl"
            defaultValue={values.logoUrl ?? ""}
            disabled={!canEdit}
            className={fieldClass}
          />
          <p className="text-sm text-staff-muted">
            Production logo upload is blocked until object storage is
            provisioned. Same-origin PNG, JPEG, WebP, or SVG paths remain valid.
          </p>
          <FieldError message={state.fieldErrors?.logoUrl} />
        </Field>
        <Field label="Clinic phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            defaultValue={values.phone ?? ""}
            disabled={!canEdit}
            className={fieldClass}
          />
          <FieldError message={state.fieldErrors?.phone} />
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
        <h2 className="text-base font-semibold">Branding</h2>
        <ColorField
          id="primaryColor"
          name="primaryColor"
          label="Primary brand colour"
          value={primaryColor}
          disabled={!canEdit}
          error={state.fieldErrors?.primaryColor}
          onChange={setPrimaryColor}
        />
        <ColorField
          id="accentColor"
          name="accentColor"
          label="Accent colour"
          value={accentColor}
          disabled={!canEdit}
          error={state.fieldErrors?.accentColor}
          onChange={setAccentColor}
        />
        <ColorField
          id="neutralColor"
          name="neutralColor"
          label="Neutral / surface tone"
          value={neutralColor}
          disabled={!canEdit}
          error={state.fieldErrors?.neutralColor}
          onChange={setNeutralColor}
        />
        <Field label="Corner radius" htmlFor="radiusPreset">
          <select
            id="radiusPreset"
            name="radiusPreset"
            defaultValue={values.radiusPreset}
            disabled={!canEdit}
            className={fieldClass}
          >
            <option value="SHARP">Sharp</option>
            <option value="MEDIUM">Medium</option>
            <option value="SOFT">Soft</option>
          </select>
        </Field>
        <Field label="Patient terminology" htmlFor="instructionTerminology">
          <select
            id="instructionTerminology"
            name="instructionTerminology"
            defaultValue={values.instructionTerminology}
            disabled={!canEdit}
            className={fieldClass}
          >
            <option value="AFTERCARE">Aftercare instructions</option>
            <option value="POST_TREATMENT">Post-treatment instructions</option>
            <option value="POST_PROCEDURE">Post-procedure instructions</option>
            <option value="POST_OPERATIVE">Post-operative instructions</option>
            <option value="RECOVERY">Recovery instructions</option>
          </select>
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
        <h2 className="text-base font-semibold">Patient presentation</h2>
        <Field label="Default appearance" htmlFor="themeMode">
          <select
            id="themeMode"
            name="themeMode"
            defaultValue={values.themeMode}
            disabled={!canEdit}
            className={fieldClass}
          >
            <option value="SYSTEM">System</option>
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allowPatientThemeToggle"
            defaultChecked={values.allowPatientThemeToggle}
            disabled={!canEdit}
            className="h-4 w-4"
          />
          Allow patients to toggle light and dark
        </label>
        {patientSiteHref ? (
          <a
            href={patientSiteHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-staff-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
          >
            View patient site ↗
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
        <h2 className="text-base font-semibold">Contact</h2>
        <Field label="Contact page URL" htmlFor="contactUrl">
          <input
            id="contactUrl"
            name="contactUrl"
            defaultValue={values.contactUrl ?? ""}
            disabled={!canEdit}
            className={fieldClass}
          />
          <FieldError message={state.fieldErrors?.contactUrl} />
        </Field>
        <Field label="Address line 1" htmlFor="addressLine1">
          <input
            id="addressLine1"
            name="addressLine1"
            defaultValue={values.addressLine1 ?? ""}
            disabled={!canEdit}
            className={fieldClass}
          />
        </Field>
        <Field label="Address line 2" htmlFor="addressLine2">
          <input
            id="addressLine2"
            name="addressLine2"
            defaultValue={values.addressLine2 ?? ""}
            disabled={!canEdit}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" htmlFor="city">
            <input
              id="city"
              name="city"
              defaultValue={values.city ?? ""}
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
          <Field label="Region" htmlFor="region">
            <input
              id="region"
              name="region"
              defaultValue={values.region ?? ""}
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
          <Field label="Postal code" htmlFor="postalCode">
            <input
              id="postalCode"
              name="postalCode"
              defaultValue={values.postalCode ?? ""}
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
        <h2 className="text-base font-semibold">Emergency / urgent help</h2>
        <Field label="Emergency instructions" htmlFor="emergencyInstructions">
          <textarea
            id="emergencyInstructions"
            name="emergencyInstructions"
            defaultValue={values.emergencyInstructions ?? ""}
            disabled={!canEdit}
            rows={5}
            className={`${fieldClass} h-auto py-2`}
          />
          <FieldError message={state.fieldErrors?.emergencyInstructions} />
        </Field>
      </section>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p className="text-sm text-emerald-700" role="status">
          Practice settings saved. The patient site uses these values.
        </p>
      ) : null}

      {canEdit ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-staff-brand px-4 text-sm font-medium text-staff-on-brand hover:bg-staff-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save practice settings"}
        </button>
      ) : (
        <p className="text-sm text-staff-muted">
          Staff can view practice settings but cannot change them.
        </p>
      )}
    </form>
  );
}

const fieldClass =
  "h-11 w-full rounded-md border border-staff-line bg-staff-panel px-3 text-sm focus:border-staff-brand focus:ring-2 focus:ring-staff-brand/20 disabled:opacity-60";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-600">{message}</p>;
}
