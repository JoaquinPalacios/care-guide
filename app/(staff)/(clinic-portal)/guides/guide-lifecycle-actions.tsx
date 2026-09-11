"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteGuideDraftAction,
  discardGuideDraftChangesAction,
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
  onDiscarded,
}: {
  guideId: string;
  destructiveAction: GuideDestructiveAction | null;
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
      if (discardState.restored) {
        onDiscarded?.(discardState.restored);
      }
      router.refresh();
    }
  }, [discardState, onDiscarded, router]);

  if (!destructiveAction) {
    return deleteState.error || discardState.error ? (
      <p className="text-sm text-red-600" role="alert">
        {deleteState.error ?? discardState.error}
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

      {deleteState.error || discardState.error ? (
        <p className="text-sm text-red-600" role="alert">
          {deleteState.error ?? discardState.error}
        </p>
      ) : null}

      <form id={deleteFormId} action={deleteAction} className="hidden">
        <input type="hidden" name="guideId" value={guideId} />
      </form>
      <form id={discardFormId} action={discardAction} className="hidden">
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
    </>
  );
}
