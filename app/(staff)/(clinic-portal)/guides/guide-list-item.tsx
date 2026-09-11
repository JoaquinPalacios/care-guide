"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  deleteGuideDraftAction,
  discardGuideDraftAction,
  type GuideActionState,
} from "@/app/(staff)/(clinic-portal)/guides/actions";
import { ConfirmDialog } from "@/app/(staff)/components/confirm-dialog";
import { ExternalLinkIcon } from "@/app/(staff)/components/icons";
import { MoreActionsMenu } from "@/app/(staff)/components/more-actions-menu";
import { StatusPills } from "@/app/(staff)/components/status-pills";
import { formatPortalDate } from "@/lib/clinic-portal/format-portal-date";
import type { ClinicPortalGuide } from "@/lib/clinic-portal/list-clinic-guides";

const emptyAction: GuideActionState = {};

export function GuideListItem({
  guide,
  canManage,
}: {
  guide: ClinicPortalGuide;
  canManage: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteGuideDraftAction,
    emptyAction
  );
  const [discardState, discardAction] = useActionState(
    discardGuideDraftAction,
    emptyAction
  );

  return (
    <li className="staffGuideRow">
      <div className="min-w-0">
        <p className="font-medium text-staff-ink">{guide.title}</p>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusPills pills={guide.statusPills} />
            <p className="text-sm text-staff-muted">{guide.sourceLabel}</p>
          </div>
          <p className="text-sm text-staff-muted">
            /{guide.publicSlug}
            <span aria-hidden="true"> · </span>
            Updated {formatPortalDate(guide.updatedAt)}
          </p>
        </div>
      </div>
      <div className="staffGuideActions">
        {canManage ? (
          <Link
            href={`/guides/${guide.id}/edit`}
            className="staffBtn staffBtnPrimary"
          >
            Edit
          </Link>
        ) : null}
        <Link
          href={`/guides/${guide.id}/preview`}
          className="staffBtn staffBtnSecondary"
        >
          Preview
        </Link>
        {guide.previewHref ? (
          <a
            href={guide.previewHref}
            target="_blank"
            rel="noreferrer"
            className="staffBtn staffBtnQuiet"
          >
            View patient guide
            <span className="sr-only"> (opens in a new tab)</span>
            <ExternalLinkIcon className="ml-1" />
          </a>
        ) : null}
        {canManage && guide.destructiveAction ? (
          <MoreActionsMenu>
            {guide.destructiveAction === "delete_draft" ? (
              <button
                type="button"
                role="menuitem"
                className="staffMoreItem staffMoreItemDanger"
                onClick={() => setDeleteOpen(true)}
              >
                Delete draft
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="staffMoreItem staffMoreItemDanger"
                onClick={() => setDiscardOpen(true)}
              >
                Discard draft changes
              </button>
            )}
          </MoreActionsMenu>
        ) : null}
      </div>
      {deleteState.error || discardState.error ? (
        <p className="text-sm text-red-600" role="alert">
          {deleteState.error ?? discardState.error}
        </p>
      ) : null}

      <form id={`delete-guide-${guide.id}`} action={deleteAction} hidden>
        <input type="hidden" name="guideId" value={guide.id} />
      </form>
      <form id={`discard-guide-${guide.id}`} action={discardAction} hidden>
        <input type="hidden" name="guideId" value={guide.id} />
      </form>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this draft guide?"
        description="This guide has never been published. This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete draft"
        confirmTone="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          const form = document.getElementById(
            `delete-guide-${guide.id}`
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
      <ConfirmDialog
        open={discardOpen}
        title="Discard draft changes?"
        description="Patients will continue seeing the currently published version."
        cancelLabel="Keep editing"
        confirmLabel="Discard changes"
        confirmTone="danger"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false);
          const form = document.getElementById(
            `discard-guide-${guide.id}`
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
    </li>
  );
}
