import Link from "next/link";

import { StatusPills } from "@/app/(staff)/components/status-pills";
import { BackArrowIcon } from "@/app/(staff)/components/icons";
import type { ClinicGuideStatusPill } from "@/lib/clinic-portal/guide-status";

export function StaffPreviewToolbar({
  backHref,
  backLabel,
  editHref,
  statusPills,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
  statusPills?: readonly ClinicGuideStatusPill[];
}) {
  return (
    <header className="staffPreviewToolbar">
      <Link href={backHref} className="staffPreviewBack">
        <BackArrowIcon />
        {backLabel}
      </Link>
      <div className="staffPreviewStatus">
        <p>Draft preview</p>
        {statusPills && statusPills.length > 0 ? (
          <StatusPills pills={statusPills} />
        ) : null}
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
