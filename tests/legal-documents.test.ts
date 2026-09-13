import { describe, expect, it } from "vitest";

import { PRODUCT_NAME } from "@/lib/branding/product-name";
import { PRIVACY_DOCUMENT } from "@/lib/legal/privacy";
import {
  LEGAL_DOCUMENT_STATUS,
  LEGAL_PLACEHOLDERS,
} from "@/lib/legal/status";
import { TERMS_DOCUMENT } from "@/lib/legal/terms";
import {
  PRIVACY_PAGE_LEGALLY_APPROVED,
  TERMS_PAGE_LEGALLY_APPROVED,
} from "@/lib/seo/diagnostics";

describe("legal drafts", () => {
  it("keeps terms as a thorough draft with unresolved entity placeholders", () => {
    expect(TERMS_DOCUMENT.title).toBe("Terms & Conditions");
    expect(TERMS_DOCUMENT.status).toBe(LEGAL_DOCUMENT_STATUS);
    expect(TERMS_PAGE_LEGALLY_APPROVED).toBe(false);
    expect(TERMS_DOCUMENT.sections.map((section) => section.title)).toEqual([
      "1. About River Aftercare",
      "2. Acceptance of the Terms",
      "3. Who may use the service",
      "4. Accounts and authorised users",
      "5. Clinic responsibilities",
      "6. Content and aftercare information",
      "7. Clinical responsibility",
      "8. Patient-facing pages",
      "9. Prohibited use",
      "10. Intellectual property",
      "11. Clinic branding and content licence",
      "12. Platform templates and River Aftercare content",
      "13. Third-party services",
      "14. Availability, maintenance, and changes",
      "15. Fees and subscriptions",
      "16. Trial, cancellation, and termination principles",
      "17. Data and privacy",
      "18. Security responsibilities",
      "19. Disclaimers",
      "20. Limitation of liability",
      "21. Indemnity",
      "22. Suspension and termination",
      "23. Changes to Terms",
      "24. Governing law",
      "25. Contact",
    ]);
    const body = JSON.stringify(TERMS_DOCUMENT);
    expect(body).toContain(PRODUCT_NAME);
    expect(body).toContain(LEGAL_PLACEHOLDERS.legalEntityName);
    expect(body).toContain(LEGAL_PLACEHOLDERS.governingLaw);
    expect(body).not.toContain("HIPAA compliance");
    expect(body).toContain("is a medical device claim");
  });

  it("keeps privacy factual about current processing and unprovisioned infra", () => {
    expect(PRIVACY_DOCUMENT.title).toBe("Privacy Policy");
    expect(PRIVACY_DOCUMENT.status).toBe(LEGAL_DOCUMENT_STATUS);
    expect(PRIVACY_PAGE_LEGALLY_APPROVED).toBe(false);
    expect(PRIVACY_DOCUMENT.sections.map((section) => section.id)).toEqual([
      "who",
      "scope",
      "marketing-visitors",
      "enquiries",
      "staff-accounts",
      "practice-configuration",
      "technical",
      "patient-architecture",
      "no-patient-account",
      "cookies",
      "analytics",
      "processors",
      "hosting",
      "email",
      "security",
      "retention",
      "rights",
      "international",
      "children",
      "changes",
      "contact",
    ]);
    const body = JSON.stringify(PRIVACY_DOCUMENT);
    expect(body).toContain("We do not currently operate a marketing analytics");
    expect(body).toContain("Production infrastructure is not provisioned yet");
    expect(body).not.toContain("We store all information with Neon");
    expect(body).not.toContain("Vercel");
    expect(body).not.toContain("Cloudflare");
    expect(body).toContain(LEGAL_PLACEHOLDERS.legalContactEmail);
  });
});
