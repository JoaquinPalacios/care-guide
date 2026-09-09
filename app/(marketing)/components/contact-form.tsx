"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { submitMarketingContactAction } from "@/app/(marketing)/%5Fmarketing/contact/actions";
import {
  initialContactActionState,
  type ContactActionState,
} from "@/app/(marketing)/%5Fmarketing/contact/state";
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_HONEYPOT_FIELD,
  LOCATION_COUNTS,
  contactEnquirySchema,
  contactFieldErrorsFromZod,
  readContactFormValues,
  type ContactEnquiryField,
  type ContactEnquiryFieldErrors,
} from "@/lib/marketing/contact-enquiry";

import styles from "../marketing.module.css";

const FIELD_ORDER: ContactEnquiryField[] = [
  "fullName",
  "workEmail",
  "clinicName",
  "locationCount",
  "phone",
  "message",
];

function fieldErrorsFromState(
  state: ContactActionState
): ContactEnquiryFieldErrors {
  return state.status === "error" ? state.fieldErrors : {};
}

export function ContactForm({ demoHref }: { demoHref: string }) {
  const formId = useId().replace(/:/g, "");
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(
    submitMarketingContactAction,
    initialContactActionState
  );
  const [clientErrors, setClientErrors] = useState<ContactEnquiryFieldErrors>(
    {}
  );
  const fieldErrors = {
    ...fieldErrorsFromState(state),
    ...clientErrors,
  };
  const formError =
    state.status === "error" && Object.keys(clientErrors).length === 0
      ? state.error
      : Object.keys(clientErrors).length > 0
        ? "Please review the highlighted fields."
        : null;

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
      return;
    }

    if (state.status !== "error") {
      return;
    }

    const firstField = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (firstField) {
      const node = formRef.current?.elements.namedItem(firstField);
      if (node instanceof HTMLElement) {
        node.focus();
        return;
      }
    }

    summaryRef.current?.focus();
  }, [state, fieldErrors]);

  function validateClient(formData: FormData): ContactEnquiryFieldErrors {
    const parsed = contactEnquirySchema.safeParse(
      readContactFormValues(formData)
    );
    if (parsed.success) {
      return {};
    }

    return contactFieldErrorsFromZod(parsed.error);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateClient(new FormData(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      const firstField = FIELD_ORDER.find((field) => errors[field]);
      if (!firstField) {
        return;
      }
      const node = event.currentTarget.elements.namedItem(firstField);
      if (node instanceof HTMLElement) {
        node.focus();
      }
    }
  }

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        className={styles.contactSuccess}
        tabIndex={-1}
        role="status"
        aria-live="polite"
      >
        <h2 className={styles.contactSuccessTitle}>
          Thanks — your enquiry has been sent.
        </h2>
        <p className={styles.copy}>
          We&apos;ll reply to the email address you provided.
        </p>
        <div className={styles.actions}>
          <Link className={`${styles.button} ${styles.primary}`} href="/">
            Homepage
          </Link>
          <a className={`${styles.button} ${styles.secondary}`} href={demoHref}>
            Clinic demo
          </a>
          <Link
            className={`${styles.button} ${styles.secondary}`}
            href="/pricing"
          >
            Pricing
          </Link>
        </div>
      </div>
    );
  }

  const summaryId = `${formId}-summary`;

  return (
    <form
      ref={formRef}
      className={styles.contactForm}
      action={formAction}
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={formError ? summaryId : undefined}
    >
      {formError ? (
        <div
          ref={summaryRef}
          id={summaryId}
          className={styles.contactErrorSummary}
          tabIndex={-1}
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <div className={styles.contactFormRow}>
        <ContactField
          id={`${formId}-name`}
          label="Full name"
          error={fieldErrors.fullName}
        >
          <input
            id={`${formId}-name`}
            className={styles.contactControl}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={CONTACT_FIELD_LIMITS.fullName}
            aria-invalid={fieldErrors.fullName ? true : undefined}
            aria-describedby={
              fieldErrors.fullName ? `${formId}-name-error` : undefined
            }
          />
        </ContactField>
        <ContactField
          id={`${formId}-email`}
          label="Work email"
          error={fieldErrors.workEmail}
        >
          <input
            id={`${formId}-email`}
            className={styles.contactControl}
            name="workEmail"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={CONTACT_FIELD_LIMITS.workEmail}
            aria-invalid={fieldErrors.workEmail ? true : undefined}
            aria-describedby={
              fieldErrors.workEmail ? `${formId}-email-error` : undefined
            }
          />
        </ContactField>
      </div>

      <div className={styles.contactFormRow}>
        <ContactField
          id={`${formId}-clinic`}
          label="Practice / clinic name"
          error={fieldErrors.clinicName}
        >
          <input
            id={`${formId}-clinic`}
            className={styles.contactControl}
            name="clinicName"
            type="text"
            autoComplete="organization"
            required
            maxLength={CONTACT_FIELD_LIMITS.clinicName}
            aria-invalid={fieldErrors.clinicName ? true : undefined}
            aria-describedby={
              fieldErrors.clinicName ? `${formId}-clinic-error` : undefined
            }
          />
        </ContactField>
        <ContactField
          id={`${formId}-locations`}
          label="Number of locations"
          error={fieldErrors.locationCount}
        >
          <select
            id={`${formId}-locations`}
            className={styles.contactControl}
            name="locationCount"
            required
            defaultValue=""
            aria-invalid={fieldErrors.locationCount ? true : undefined}
            aria-describedby={
              fieldErrors.locationCount
                ? `${formId}-locations-error`
                : undefined
            }
          >
            <option value="" disabled>
              Select
            </option>
            {LOCATION_COUNTS.map((value) => (
              <option key={value} value={value}>
                {value === "2-5" ? "2–5" : value}
              </option>
            ))}
          </select>
        </ContactField>
      </div>

      <ContactField
        id={`${formId}-phone`}
        label="Phone"
        optional
        error={fieldErrors.phone}
      >
        <input
          id={`${formId}-phone`}
          className={styles.contactControl}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={CONTACT_FIELD_LIMITS.phone}
          aria-invalid={fieldErrors.phone ? true : undefined}
          aria-describedby={
            fieldErrors.phone ? `${formId}-phone-error` : undefined
          }
        />
      </ContactField>

      <ContactField
        id={`${formId}-message`}
        label="Anything you'd like us to know?"
        optional
        error={fieldErrors.message}
      >
        <textarea
          id={`${formId}-message`}
          className={styles.contactControl}
          name="message"
          rows={5}
          maxLength={CONTACT_FIELD_LIMITS.message}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={
            fieldErrors.message ? `${formId}-message-error` : undefined
          }
        />
      </ContactField>

      <div className={styles.contactHoneypot} aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name={CONTACT_HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className={styles.contactPrivacy}>
        Please don&apos;t include patient or clinical information.
      </p>

      <button
        className={`${styles.button} ${styles.primary} ${styles.contactSubmit}`}
        type="submit"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

function ContactField({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.contactField}>
      <label htmlFor={id}>
        {label}
        {optional ? (
          <span className={styles.contactOptional}> (optional)</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.contactFieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
