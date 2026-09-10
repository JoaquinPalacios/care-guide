import Link from "next/link";

import { BackArrowIcon } from "@/app/(staff)/components/icons";

export function StaffPreviewToolbar({
  backHref,
  backLabel,
  editHref,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
}) {
  return (
    <header className="staffPreviewToolbar">
      <Link href={backHref} className="staffPreviewBack">
        <BackArrowIcon />
        {backLabel}
      </Link>
      <p className="staffPreviewStatus">Draft preview</p>
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
