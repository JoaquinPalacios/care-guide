import type { ClinicGuideStatusPill } from "@/lib/clinic-portal/guide-status";

export function StatusPills({
  pills,
}: {
  pills: readonly ClinicGuideStatusPill[];
}) {
  if (pills.length === 0) {
    return null;
  }

  return (
    <ul className="staffStatusPills">
      {pills.map((pill) => (
        <li key={pill.label} className="staffStatusPill">
          {pill.label}
        </li>
      ))}
    </ul>
  );
}
