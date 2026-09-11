"use client";

import Link from "next/link";

import { GuideLifecycleActions } from "@/app/(staff)/(clinic-portal)/guides/guide-lifecycle-actions";
import { ExternalLinkIcon } from "@/app/(staff)/components/icons";
import type { GuideDestructiveAction } from "@/lib/clinic-portal/guide-status";

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
      {canManage ? (
        <GuideLifecycleActions
          guideId={guideId}
          destructiveAction={destructiveAction}
        />
      ) : null}
    </div>
  );
}
