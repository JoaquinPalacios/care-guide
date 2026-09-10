"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { ColorField } from "@/app/(staff)/components/color-field";
import { ConfirmDialog } from "@/app/(staff)/components/confirm-dialog";
import { ExternalLinkIcon } from "@/app/(staff)/components/icons";
import { SaveStatus } from "@/app/(staff)/components/save-status";
import { useUnsavedChangesGuard } from "@/app/(staff)/components/use-unsaved-changes-guard";
import {
  savePracticeSettingsAction,
  type PracticeActionState,
} from "@/app/(staff)/(clinic-portal)/practice/actions";
import { formSaveStatus } from "@/lib/clinic-portal/form-save-status";
import type { PracticeSettingsInput } from "@/lib/clinic-portal/practice-settings-schema";

const initial: PracticeActionState = {};

const SECTIONS = [
  { id: "practice-identity", label: "Identity" },
  { id: "practice-branding", label: "Branding" },
  { id: "practice-contact", label: "Contact" },
  { id: "practice-emergency", label: "Emergency" },
  { id: "practice-presentation", label: "Presentation" },
] as const;

function snapshot(values: PracticeSettingsInput): string {
  return JSON.stringify(values);
}

export function PracticeSettingsForm({
  values,
  canEdit,
  patientSiteHref,
}: {
  values: PracticeSettingsInput;
  canEdit: boolean;
  patientSiteHref: string | null;
}) {
  const pendingSnapshot = useRef(snapshot(values));
  const [state, action, pending] = useActionState(
    savePracticeSettingsAction,
    initial
  );
  const [form, setForm] = useState(values);
  const [confirmed, setConfirmed] = useState(() => snapshot(values));
  const serialized = useMemo(() => snapshot(form), [form]);
  const dirty = serialized !== confirmed;
  const saveStatus = formSaveStatus({ dirty, pending });
  const { open, keepEditing, discard } = useUnsavedChangesGuard(dirty);

  useEffect(() => {
    if (state.saved) {
      setConfirmed(pendingSnapshot.current);
    }
  }, [state]);

  useEffect(() => {
    if (!state.fieldErrors && !state.error) {
      return;
    }
    const first = document.querySelector<HTMLElement>(
      "form [aria-invalid='true']"
    );
    if (first) {
      first.focus();
      return;
    }
    document.querySelector<HTMLElement>("[role='alert']")?.focus();
  }, [state]);

  function patch<K extends keyof PracticeSettingsInput>(
    key: K,
    value: PracticeSettingsInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="staffEditorPage lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <nav
        aria-label="Practice sections"
        className="mb-6 hidden lg:sticky lg:top-4 lg:mb-0 lg:block"
      >
        <ul className="staffNavGroup">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="staffNavRow text-staff-muted hover:bg-staff-panel hover:text-staff-ink"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <form
        action={action}
        className="flex flex-col gap-8"
        onSubmit={() => {
          pendingSnapshot.current = serialized;
        }}
      >
        <div className="sticky top-0 z-20 border-b border-staff-line bg-staff-panel/95 py-3 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SaveStatus
              status={saveStatus}
              error={state.error}
              success={
                state.saved && !dirty
                  ? "Practice settings saved. The patient site uses these values."
                  : undefined
              }
            />
            {canEdit ? (
              <button
                type="submit"
                disabled={pending}
                className="staffBtn staffBtnPrimary hidden sm:inline-flex"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            ) : (
              <p className="text-sm text-staff-muted">
                Staff can view practice settings but cannot change them.
              </p>
            )}
          </div>
        </div>

        <section
          id="practice-identity"
          className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <h2 className="text-base font-semibold">Practice identity</h2>
          <Field label="Display name" htmlFor="displayName">
            <input
              id="displayName"
              name="displayName"
              data-practice-field
              value={form.displayName}
              onChange={(event) => patch("displayName", event.target.value)}
              disabled={!canEdit}
              aria-invalid={state.fieldErrors?.displayName ? "true" : "false"}
              className={fieldClass}
            />
            <FieldError message={state.fieldErrors?.displayName} />
          </Field>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium" id="logo-label">
              Logo
            </p>
            {form.logoUrl ? (
              // Same-origin clinic mark; next/image is unnecessary for this path preview.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-md border border-staff-line bg-white object-contain"
              />
            ) : (
              <p className="text-sm text-staff-muted">No logo configured.</p>
            )}
            <p className="text-sm text-staff-muted">Current logo preview</p>
            <input type="hidden" name="logoUrl" value={form.logoUrl ?? ""} />
            <p className="rounded-md border border-dashed border-staff-line px-3 py-2 text-sm text-staff-muted">
              Upload logo — coming before launch
            </p>
            <p className="text-sm text-staff-muted">
              Logo upload waits for production object storage. The current
              clinic mark stays in use.
            </p>
          </div>
        </section>

        <section
          id="practice-branding"
          className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <h2 className="text-base font-semibold">Branding</h2>
          <ColorField
            id="primaryColor"
            name="primaryColor"
            label="Primary brand colour"
            value={form.primaryColor ?? ""}
            disabled={!canEdit}
            error={state.fieldErrors?.primaryColor}
            onChange={(value) => patch("primaryColor", value || null)}
          />
          <ColorField
            id="accentColor"
            name="accentColor"
            label="Accent colour"
            value={form.accentColor ?? ""}
            disabled={!canEdit}
            error={state.fieldErrors?.accentColor}
            onChange={(value) => patch("accentColor", value || null)}
          />
          <ColorField
            id="neutralColor"
            name="neutralColor"
            label="Neutral / surface tone"
            value={form.neutralColor ?? ""}
            disabled={!canEdit}
            error={state.fieldErrors?.neutralColor}
            onChange={(value) => patch("neutralColor", value || null)}
          />
          <Field label="Corner radius" htmlFor="radiusPreset">
            <select
              id="radiusPreset"
              name="radiusPreset"
              value={form.radiusPreset}
              onChange={(event) =>
                patch(
                  "radiusPreset",
                  event.target.value as PracticeSettingsInput["radiusPreset"]
                )
              }
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
              value={form.instructionTerminology}
              onChange={(event) =>
                patch(
                  "instructionTerminology",
                  event.target
                    .value as PracticeSettingsInput["instructionTerminology"]
                )
              }
              disabled={!canEdit}
              className={fieldClass}
            >
              <option value="AFTERCARE">Aftercare instructions</option>
              <option value="POST_TREATMENT">
                Post-treatment instructions
              </option>
              <option value="POST_PROCEDURE">
                Post-procedure instructions
              </option>
              <option value="POST_OPERATIVE">
                Post-operative instructions
              </option>
              <option value="RECOVERY">Recovery instructions</option>
            </select>
          </Field>
        </section>

        <section
          id="practice-contact"
          className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <h2 className="text-base font-semibold">Contact</h2>
          <Field label="Clinic phone" htmlFor="phone">
            <input
              id="phone"
              name="phone"
              data-practice-field
              value={form.phone ?? ""}
              onChange={(event) => patch("phone", event.target.value || null)}
              disabled={!canEdit}
              aria-invalid={state.fieldErrors?.phone ? "true" : "false"}
              className={fieldClass}
            />
            <FieldError message={state.fieldErrors?.phone} />
          </Field>
          <Field label="Contact page URL" htmlFor="contactUrl">
            <input
              id="contactUrl"
              name="contactUrl"
              data-practice-field
              value={form.contactUrl ?? ""}
              onChange={(event) =>
                patch("contactUrl", event.target.value || null)
              }
              disabled={!canEdit}
              aria-invalid={state.fieldErrors?.contactUrl ? "true" : "false"}
              className={fieldClass}
            />
            <FieldError message={state.fieldErrors?.contactUrl} />
          </Field>
          <Field label="Address line 1" htmlFor="addressLine1">
            <input
              id="addressLine1"
              name="addressLine1"
              value={form.addressLine1 ?? ""}
              onChange={(event) =>
                patch("addressLine1", event.target.value || null)
              }
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
          <Field label="Address line 2" htmlFor="addressLine2">
            <input
              id="addressLine2"
              name="addressLine2"
              value={form.addressLine2 ?? ""}
              onChange={(event) =>
                patch("addressLine2", event.target.value || null)
              }
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" htmlFor="city">
              <input
                id="city"
                name="city"
                value={form.city ?? ""}
                onChange={(event) => patch("city", event.target.value || null)}
                disabled={!canEdit}
                className={fieldClass}
              />
            </Field>
            <Field label="Region" htmlFor="region">
              <input
                id="region"
                name="region"
                value={form.region ?? ""}
                onChange={(event) =>
                  patch("region", event.target.value || null)
                }
                disabled={!canEdit}
                className={fieldClass}
              />
            </Field>
            <Field label="Postal code" htmlFor="postalCode">
              <input
                id="postalCode"
                name="postalCode"
                value={form.postalCode ?? ""}
                onChange={(event) =>
                  patch("postalCode", event.target.value || null)
                }
                disabled={!canEdit}
                className={fieldClass}
              />
            </Field>
          </div>
        </section>

        <section
          id="practice-emergency"
          className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <h2 className="text-base font-semibold">Emergency / urgent help</h2>
          <Field label="Emergency instructions" htmlFor="emergencyInstructions">
            <textarea
              id="emergencyInstructions"
              name="emergencyInstructions"
              data-practice-field
              value={form.emergencyInstructions ?? ""}
              onChange={(event) =>
                patch("emergencyInstructions", event.target.value || null)
              }
              disabled={!canEdit}
              rows={5}
              aria-invalid={
                state.fieldErrors?.emergencyInstructions ? "true" : "false"
              }
              className={`${fieldClass} h-auto py-2`}
            />
            <FieldError message={state.fieldErrors?.emergencyInstructions} />
          </Field>
        </section>

        <section
          id="practice-presentation"
          className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <h2 className="text-base font-semibold">Patient presentation</h2>
          <Field label="Default appearance" htmlFor="themeMode">
            <select
              id="themeMode"
              name="themeMode"
              value={form.themeMode}
              onChange={(event) =>
                patch(
                  "themeMode",
                  event.target.value as PracticeSettingsInput["themeMode"]
                )
              }
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
              checked={form.allowPatientThemeToggle}
              onChange={(event) =>
                patch("allowPatientThemeToggle", event.target.checked)
              }
              disabled={!canEdit}
              className="h-4 w-4"
            />
            Allow patients to toggle light and dark
          </label>
          <p className="text-sm text-staff-muted">
            This controls the patient aftercare site. It does not change the
            staff portal appearance.
          </p>
          {patientSiteHref ? (
            <a
              href={patientSiteHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-staff-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
            >
              View patient site
              <span className="sr-only"> (opens in a new tab)</span>
              <ExternalLinkIcon />
            </a>
          ) : null}
        </section>

        {canEdit ? (
          <div className="staffEditorActionsMobile">
            <button
              type="submit"
              disabled={pending}
              className="staffBtn staffBtnPrimary flex-1"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        ) : null}
      </form>

      <ConfirmDialog
        open={open}
        title="Discard unsaved changes?"
        description="Your latest changes haven't been saved."
        cancelLabel="Keep editing"
        confirmLabel="Discard changes"
        confirmTone="danger"
        onCancel={keepEditing}
        onConfirm={discard}
      />
    </div>
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
