"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  removeClinicLogoAction,
  uploadClinicLogoAction,
  type ClinicLogoActionState,
} from "@/app/(staff)/(clinic-portal)/practice/actions";

const empty: ClinicLogoActionState = {};

export function PracticeLogoField({
  displayName,
  logoUrl,
  canEdit,
  storageAvailable,
  onLogoUrlChange,
}: {
  displayName: string;
  logoUrl: string | null;
  canEdit: boolean;
  storageAvailable: boolean;
  onLogoUrlChange: (logoUrl: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [uploadState, uploadAction, uploading] = useActionState(
    uploadClinicLogoAction,
    empty
  );
  const [removeState, removeAction, removing] = useActionState(
    removeClinicLogoAction,
    empty
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (uploadState.ok && uploadState.logoUrl) {
      onLogoUrlChange(uploadState.logoUrl);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }, [uploadState, onLogoUrlChange]);

  useEffect(() => {
    if (removeState.ok) {
      onLogoUrlChange(null);
    }
  }, [removeState, onLogoUrlChange]);

  const error = uploadState.error ?? removeState.error;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm font-medium" id="logo-label">
        Logo
      </p>
      {logoUrl ? (
        // Same-origin clinic mark; next/image is unnecessary for this path preview.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${displayName || "Practice"} logo`}
          width={48}
          height={48}
          className="staffLogoPreview"
        />
      ) : (
        <p className="text-sm text-staff-muted">No logo configured.</p>
      )}
      <p className="text-sm text-staff-muted">Current logo preview</p>
      <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />

      {storageAvailable && canEdit ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            id="clinic-logo-file"
            form="clinic-logo-upload"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
            aria-labelledby="logo-label"
            className="min-w-0 max-w-full text-sm"
          />
          <button
            form="clinic-logo-upload"
            type="submit"
            disabled={uploading || removing}
            className="staffBtn staffBtnSecondary"
          >
            {uploading
              ? "Uploading…"
              : logoUrl
                ? "Replace logo"
                : "Upload logo"}
          </button>
          {logoUrl ? (
            <button
              form="clinic-logo-remove"
              type="submit"
              disabled={uploading || removing}
              className="staffBtn staffBtnQuiet"
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          ) : null}
        </div>
      ) : null}

      {storageAvailable && canEdit ? (
        <p className="text-sm text-staff-muted">
          PNG, JPEG, WebP, or SVG. Raster files up to 2 MB; SVG up to 1 MB.
          Uploaded SVG is sanitized and rendered as an image.
        </p>
      ) : null}
      {!storageAvailable ? (
        <p className="staffLogoUnavailable">
          Logo upload is unavailable because clinic object storage is not
          configured in this environment.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {mounted && storageAvailable && canEdit
        ? createPortal(
            <>
              <form id="clinic-logo-upload" action={uploadAction} />
              <form id="clinic-logo-remove" action={removeAction} />
            </>,
            document.body
          )
        : null}
    </div>
  );
}
