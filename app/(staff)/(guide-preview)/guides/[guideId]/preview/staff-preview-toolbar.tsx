import Link from "next/link";

import { GuideStatusPills } from "@/app/(staff)/components/guide-status-pills";
import { BackArrowIcon } from "@/app/(staff)/components/icons";
import type { ClinicGuideLifecycleStatus } from "@/lib/clinic-portal/guide-status";

export function StaffPreviewToolbar({
  backHref,
  backLabel,
  editHref,
  lifecycle,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
  lifecycle?: ClinicGuideLifecycleStatus;
}) {
  return (
    <header className="staffPreviewToolbar">
      <Link href={backHref} className="staffPreviewBack">
        <BackArrowIcon />
        {backLabel}
      </Link>
      <div className="staffPreviewStatus flex flex-col items-center gap-1">
        <p className="m-0">Draft preview</p>
        {lifecycle ? <GuideStatusPills lifecycle={lifecycle} /> : null}
      </div>
      {editHref ? (
        <Link href={editHref} className="staffPreviewEdit">
          Edit guide
        </Link>
      ) : (
        <span />
      )}
    </header>
  );
}
