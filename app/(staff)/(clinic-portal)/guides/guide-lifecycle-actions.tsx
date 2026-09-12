"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteGuideDraftAction,
  discardGuideDraftChangesAction,
  unpublishGuideAction,
  type GuideActionState,
} from "@/app/(staff)/(clinic-portal)/guides/actions";
import { ConfirmDialog } from "@/app/(staff)/components/confirm-dialog";
import { OverflowMenu } from "@/app/(staff)/components/overflow-menu";
import type { GuideDestructiveAction } from "@/lib/clinic-portal/guide-status";
import type { ComposedGuideSection } from "@/lib/aftercare/types";

const empty: GuideActionState = {};

export function GuideLifecycleActions({
  guideId,
  destructiveAction,
  canUnpublish = false,
  onDiscarded,
}: {
  guideId: string;
  destructiveAction: GuideDestructiveAction | null;
  canUnpublish?: boolean;
  onDiscarded?: (restored: {
    title: string;
    publicSlug: string;
    introduction: string;
    sections: ComposedGuideSection[];
  }) => void;
}) {
  const router = useRouter();
  const reactId = useId().replace(/:/g, "");
  const deleteFormId = `delete-draft-${reactId}`;
  const discardFormId = `discard-draft-${reactId}`;
  const unpublishFormId = `unpublish-guide-${reactId}`;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteGuideDraftAction,
    empty
  );
  const [discardState, discardAction, discarding] = useActionState(
    discardGuideDraftChangesAction,
    empty
  );
  const [unpublishState, unpublishAction, unpublishing] = useActionState(
    unpublishGuideAction,
    empty
  );

  useEffect(() => {
    if (discardState.ok) {
      setDiscardOpen(false);
      if (discardState.restored) {
        onDiscarded?.(discardState.restored);
      }
      router.refresh();
    }
  }, [discardState, onDiscarded, router]);

  useEffect(() => {
    if (unpublishState.ok) {
      setUnpublishOpen(false);
      router.refresh();
    }
  }, [unpublishState, router]);

  const error = deleteState.error ?? discardState.error ?? unpublishState.error;

  if (!destructiveAction && !canUnpublish) {
    return error ? (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    ) : null;
  }

  return (
    <>
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
        ) : null}
        {destructiveAction === "discard_draft_changes" ? (
          <button
            type="button"
            role="menuitem"
            className="staffOverflowItem staffOverflowItemDanger"
            onClick={() => setDiscardOpen(true)}
          >
            Discard draft changes
          </button>
        ) : null}
        {canUnpublish ? (
          <button
            type="button"
            role="menuitem"
            className="staffOverflowItem"
            onClick={() => setUnpublishOpen(true)}
          >
            Unpublish guide
          </button>
        ) : null}
      </OverflowMenu>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form id={deleteFormId} action={deleteAction} className="hidden">
        <input type="hidden" name="guideId" value={guideId} />
      </form>
      <form id={discardFormId} action={discardAction} className="hidden">
        <input type="hidden" name="guideId" value={guideId} />
      </form>
      <form id={unpublishFormId} action={unpublishAction} className="hidden">
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
            deleteFormId
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
            discardFormId
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
      <ConfirmDialog
        open={unpublishOpen}
        title="Unpublish this guide?"
        description="Patients using the current public link will no longer be able to open this guide until it is published again."
        cancelLabel="Cancel"
        confirmLabel={unpublishing ? "Unpublishing…" : "Unpublish guide"}
        confirmTone="primary"
        onCancel={() => setUnpublishOpen(false)}
        onConfirm={() => {
          const form = document.getElementById(
            unpublishFormId
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
    </>
  );
}
