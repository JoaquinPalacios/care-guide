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
  status: typeof LEGAL_DOCUMENT_STATUS;
  lastUpdatedIso: string;
  lastUpdatedLabel: string;
  sections: readonly LegalSection[];
}

export const LEGAL_DRAFT_BANNER = `DRAFT FOR LEGAL REVIEW. This page is published so clinics and reviewers can read the intended launch terms. It is not approved legal advice, and it does not complete the production launch gate.`;

export function legalDocumentMeta(input: {
  slug: LegalDocument["slug"];
  title: string;
  intro: string;
  sections: readonly LegalSection[];
}): LegalDocument {
  return {
    slug: input.slug,
    eyebrow: "Legal",
    title: input.title,
    intro: input.intro,
    status: LEGAL_DOCUMENT_STATUS,
    lastUpdatedIso: LEGAL_LAST_UPDATED_ISO,
    lastUpdatedLabel: formatLegalLastUpdated(),
    sections: input.sections,
  };
}

export { LEGAL_PLACEHOLDERS, PRODUCT_NAME };
