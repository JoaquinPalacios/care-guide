"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  deleteGuideDraftAction,
  discardGuideDraftChangesAction,
  type GuideActionState,
} from "@/app/(staff)/(clinic-portal)/guides/actions";
import { ConfirmDialog } from "@/app/(staff)/components/confirm-dialog";
import { OverflowMenu } from "@/app/(staff)/components/overflow-menu";
import { ExternalLinkIcon } from "@/app/(staff)/components/icons";
import type { GuideDestructiveAction } from "@/lib/clinic-portal/guide-status";

const empty: GuideActionState = {};

export function GuideRowActions({
  guideId,
  canManage,
  isPublishedPublic,
  previewHref,
  destructiveAction,
}: {
  guideId: string;
  canManage: boolean;
  isPublishedPublic: boolean;
  previewHref: string | null;
  destructiveAction: GuideDestructiveAction | null;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteGuideDraftAction,
    empty
  );
  const [discardState, discardAction, discarding] = useActionState(
    discardGuideDraftChangesAction,
    empty
  );

  useEffect(() => {
    if (discardState.ok) {
      setDiscardOpen(false);
      router.refresh();
    }
  }, [discardState, router]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canManage ? (
        <Link
          href={`/guides/${guideId}/edit`}
          className="staffBtn staffBtnPrimary"
        >
          Edit
        </Link>
      ) : null}
      <Link
        href={`/guides/${guideId}/preview`}
        className="staffBtn staffBtnSecondary"
      >
        Preview
      </Link>
      {isPublishedPublic && previewHref ? (
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="staffBtn staffBtnQuiet"
        >
          View patient guide
          <span className="sr-only"> (opens in a new tab)</span>
          <ExternalLinkIcon className="ml-1" />
        </a>
      ) : null}
      {canManage && destructiveAction ? (
        <OverflowMenu label="More actions">
          {destructiveAction === "delete_draft" ? (
            <button
              type="button"
              role="menuitem"
              className="staffOverflowItem staffOverflowItemDanger"
              onClick={() => setDeleteOpen(true)}
            >
              Delete draft
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="staffOverflowItem staffOverflowItemDanger"
              onClick={() => setDiscardOpen(true)}
            >
              Discard draft changes
            </button>
          )}
        </OverflowMenu>
      ) : null}

      {deleteState.error || discardState.error ? (
        <p className="w-full text-sm text-red-600" role="alert">
          {deleteState.error ?? discardState.error}
        </p>
      ) : null}

      <form
        id={`delete-draft-${guideId}`}
        action={deleteAction}
        className="hidden"
      >
        <input type="hidden" name="guideId" value={guideId} />
      </form>
      <form
        id={`discard-draft-${guideId}`}
        action={discardAction}
        className="hidden"
      >
        <input type="hidden" name="guideId" value={guideId} />
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
            `delete-draft-${guideId}`
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
      <ConfirmDialog
        open={discardOpen}
        title="Discard draft changes?"
        description="Patients will continue seeing the currently published version."
        cancelLabel="Keep editing"
        confirmLabel={discarding ? "Discarding…" : "Discard changes"}
        confirmTone="danger"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          const form = document.getElementById(
            `discard-draft-${guideId}`
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
    </div>
  );
}
