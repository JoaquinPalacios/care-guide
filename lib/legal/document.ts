import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  formatLegalLastUpdated,
  LEGAL_DOCUMENT_STATUS,
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_PLACEHOLDERS,
} from "@/lib/legal/status";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "placeholder"; text: string };

export interface LegalSection {
  id: string;
  title: string;
  blocks: readonly LegalBlock[];
}

export interface LegalDocument {
  slug: "/privacy" | "/terms";
  eyebrow: string;
  title: string;
  intro: string;
  draftBanner: string;
  status: typeof LEGAL_DOCUMENT_STATUS;
  lastUpdatedIso: string;
  lastUpdatedLabel: string;
  sections: readonly LegalSection[];
}

export const TERMS_DRAFT_BANNER = `DRAFT FOR LEGAL REVIEW. These terms are being prepared for ${PRODUCT_NAME}'s production launch and have not yet received final legal approval.`;

export const PRIVACY_DRAFT_BANNER = `DRAFT FOR LEGAL REVIEW. This policy reflects the current ${PRODUCT_NAME} product and intended launch operations but has not yet received final legal approval.`;

export function legalDocumentMeta(input: {
  slug: LegalDocument["slug"];
  title: string;
  intro: string;
  draftBanner: string;
  sections: readonly LegalSection[];
}): LegalDocument {
  return {
    slug: input.slug,
    eyebrow: "Legal",
    title: input.title,
    intro: input.intro,
    draftBanner: input.draftBanner,
    status: LEGAL_DOCUMENT_STATUS,
    lastUpdatedIso: LEGAL_LAST_UPDATED_ISO,
    lastUpdatedLabel: formatLegalLastUpdated(),
    sections: input.sections,
  };
}

export { LEGAL_PLACEHOLDERS, PRODUCT_NAME };
