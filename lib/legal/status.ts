/**
 * Launch legal document status. Copy is a substantial draft, not counsel-approved.
 * Do not treat these pages as a completed launch gate.
 */
export const LEGAL_DOCUMENT_STATUS = "DRAFT_FOR_LEGAL_REVIEW";

export const LEGAL_LAST_UPDATED_ISO = "2026-09-13";

export const LEGAL_PLACEHOLDERS = {
  legalEntityName:
    "[Legal entity name — to be confirmed before launch]",
  abnAcn: "[ABN/ACN — to be confirmed before launch]",
  registeredAddress:
    "[Registered office address — to be confirmed before launch]",
  governingLaw:
    "[Governing State or Territory of Australia — to be confirmed before launch]",
  legalContactEmail:
    "[Legal contact email — to be confirmed before launch]",
} as const;

export function formatLegalLastUpdated(
  isoDate: string = LEGAL_LAST_UPDATED_ISO
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
