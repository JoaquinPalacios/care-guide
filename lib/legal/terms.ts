import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  LEGAL_PLACEHOLDERS,
  legalDocumentMeta,
  type LegalSection,
} from "@/lib/legal/document";

const P = LEGAL_PLACEHOLDERS;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "about",
    title: "1. About River Aftercare",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} is a business-to-business aftercare publishing platform for healthcare practices. Clinics use it to turn approved post-treatment instructions into branded, mobile-first web pages that patients can reopen without an app or a patient account.`,
      },
      {
        type: "p",
        text: `The first vertical is dental. The product is a structured publishing platform, not live clinical monitoring, a patient health record, a messaging product, or emergency care.`,
      },
      {
        type: "placeholder",
        text: `The legal entity that operates ${PRODUCT_NAME} is ${P.legalEntityName}. Australian Business Number / Company Number: ${P.abnAcn}. Registered office: ${P.registeredAddress}.`,
      },
    ],
  },
  {
    id: "acceptance",
    title: "2. Acceptance of the Terms",
    blocks: [
      {
        type: "p",
        text: `These Terms & Conditions (“Terms”) apply when a practice, its authorised staff, or a visitor uses the ${PRODUCT_NAME} website, staff portal, or related services. By creating an account, submitting an enquiry, or using the service, you agree to these Terms.`,
      },
      {
        type: "p",
        text: "If you do not agree, do not use the service. These Terms are a draft for legal review and may change before a paid production launch.",
      },
    ],
  },
  {
    id: "who-may-use",
    title: "3. Who may use the service",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} is offered to healthcare practices and their authorised personnel. It is a business customer product. It is not a consumer health app and is not directed at children.`,
      },
      {
        type: "p",
        text: "You must have authority to bind the practice that will publish aftercare content. Patients who open a public guide do so as readers of clinic-published information; they are not required to create an account for generic public guides at launch.",
      },
    ],
  },
  {
    id: "accounts",
    title: "4. Accounts and authorised users",
    blocks: [
      {
        type: "p",
        text: "Staff accounts are issued for clinic personnel. The practice is responsible for who is invited, for keeping credentials confidential, and for activity under its accounts.",
      },
      {
        type: "ul",
        items: [
          "Do not share login credentials.",
          "Tell us promptly if you believe an account has been compromised.",
          "Authorised users must be people the practice has permitted to manage aftercare content or clinic settings.",
        ],
      },
    ],
  },
  {
    id: "clinic-responsibilities",
    title: "5. Clinic responsibilities",
    blocks: [
      {
        type: "p",
        text: "The practice remains responsible for the aftercare information it publishes, including any edits, local instructions, and clinic additions. Publishing a guide is a clinic decision.",
      },
      {
        type: "ul",
        items: [
          "Review templates and overrides before they are shown to patients.",
          "Keep clinic identity, contact details, and emergency instructions accurate.",
          "Unpublish or update content that is no longer appropriate.",
          "Do not submit patient clinical records or other patient personal information through marketing or support forms.",
        ],
      },
    ],
  },
  {
    id: "content",
    title: "6. Content and aftercare information",
    blocks: [
      {
        type: "p",
        text: "Clinic-owned aftercare copy, branding, and configuration remain the practice’s content. Platform templates may be adapted by the clinic. Templates are structured starting points. They are not automatically clinically certified, accredited, or a substitute for the treating practitioner’s judgement.",
      },
    ],
  },
  {
    id: "clinical-responsibility",
    title: "7. Clinical responsibility",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} does not practise medicine or dentistry, does not provide clinical advice, and does not replace the treating clinician. The clinic is responsible for whether published instructions are appropriate for the procedures it provides.`,
      },
      {
        type: "p",
        text: "Nothing on the platform is a medical device claim, a guarantee of clinical outcomes, or a representation that content has been certified by a regulator.",
      },
    ],
  },
  {
    id: "patient-pages",
    title: "8. Patient-facing pages",
    blocks: [
      {
        type: "p",
        text: "Public patient guides are informational web pages published by the clinic under the clinic’s brand. They do not replace emergency care, an in-person review, or professional judgement. If a patient needs urgent help, they should use the clinic’s published emergency instructions or local emergency services.",
      },
      {
        type: "p",
        text: "At launch, generic public guides do not require a patient account and are not designed to store patient personal information. Sharing a guide URL is like sharing a practice webpage.",
      },
    ],
  },
  {
    id: "prohibited-use",
    title: "9. Prohibited use",
    blocks: [
      {
        type: "p",
        text: "You must not use the service to:",
      },
      {
        type: "ul",
        items: [
          "Break the law or infringe anyone’s rights.",
          "Upload malware, scrape in an abusive way, or attempt unauthorised access.",
          `Misrepresent ${PRODUCT_NAME} as the treating clinic or as emergency care.`,
          "Publish content you do not have the right to publish.",
          "Use the service to collect patient personal information in ways the current product is not designed to support.",
        ],
      },
    ],
  },
  {
    id: "ip",
    title: "10. Intellectual property",
    blocks: [
      {
        type: "p",
        text: `The ${PRODUCT_NAME} name, marks, software, documentation, and platform templates (as distinct from a clinic’s own adapted copy) are owned by the operator of the service or its licensors. These Terms do not transfer ownership of the platform to the clinic.`,
      },
    ],
  },
  {
    id: "clinic-licence",
    title: "11. Clinic branding and content licence",
    blocks: [
      {
        type: "p",
        text: `The clinic grants ${PRODUCT_NAME} a limited licence to host, display, and transmit the clinic’s branding and aftercare content solely to operate the service for that clinic, including patient pages on the clinic’s tenant hostname.`,
      },
      {
        type: "p",
        text: "The clinic represents that it has the rights needed to use that branding and content.",
      },
    ],
  },
  {
    id: "platform-templates",
    title: "12. Platform templates and River Aftercare content",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} may provide canonical templates, such as a reviewed Tooth Extraction starting guide. Clinics may adapt templates. Additional procedure templates may be enabled during onboarding when they exist; they should not be assumed to be in the current library.`,
      },
      {
        type: "p",
        text: "Platform templates are not a clinical certification. The clinic remains responsible for published clinical instructions.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "13. Third-party services",
    blocks: [
      {
        type: "p",
        text: "The service may depend on infrastructure and communications providers (for example hosting, database, email delivery, or object storage) once production is provisioned. Those providers are not yet a final production set. The Privacy Policy explains the intended categories. This document does not claim that a specific vendor is already in production.",
      },
    ],
  },
  {
    id: "availability",
    title: "14. Availability, maintenance, and changes",
    blocks: [
      {
        type: "p",
        text: `We aim to keep ${PRODUCT_NAME} available, but we do not guarantee uninterrupted access, a specific uptime percentage, or that the service will be error-free. We may perform maintenance, deploy changes, or suspend access to protect the service or other customers.`,
      },
    ],
  },
  {
    id: "fees",
    title: "15. Fees and subscriptions",
    blocks: [
      {
        type: "p",
        text: "Published Essential and Practice prices on the marketing site are working Australian prices. They are provisional and not a final commercial contract. Group pricing is custom. Self-serve billing is not published yet.",
      },
      {
        type: "p",
        text: "Fees, invoicing, and any later subscription terms will be confirmed in a separate commercial agreement or an updated version of these Terms before they become binding for a paying clinic.",
      },
    ],
  },
  {
    id: "trial-cancellation",
    title: "16. Trial, cancellation, and termination principles",
    blocks: [
      {
        type: "p",
        text: "Access may begin with an assisted onboarding or design-partner arrangement rather than a self-serve trial. Either party may end a non-contracted evaluation by notice. If a paid agreement exists, cancellation and termination follow that agreement.",
      },
      {
        type: "p",
        text: "We may suspend or terminate access for material breach, unpaid fees where a paid agreement exists, unlawful use, or risk to the service. After termination, public patient pages for that clinic may be unpublished. Export and retention details will be confirmed with counsel and in the Privacy Policy.",
      },
    ],
  },
  {
    id: "data-privacy",
    title: "17. Data and privacy",
    blocks: [
      {
        type: "p",
        text: `How ${PRODUCT_NAME} handles information is described in the Privacy Policy. That policy is also a draft for legal review. In summary, marketing visitors and clinic staff accounts are in scope; generic public patient guides are not designed to collect patient personal information.`,
      },
    ],
  },
  {
    id: "security",
    title: "18. Security responsibilities",
    blocks: [
      {
        type: "p",
        text: "We take reasonable technical and organisational steps to protect the service. No method of transmission or storage is completely secure. Clinics must protect their own accounts, devices, and the accuracy of the content they publish.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "19. Disclaimers",
    blocks: [
      {
        type: "p",
        text: `To the extent permitted by law, ${PRODUCT_NAME} is provided on an “as is” and “as available” basis. We do not warrant that:`,
      },
      {
        type: "ul",
        items: [
          "Published aftercare content is clinically complete or suitable for every patient.",
          "The service is free of defects or will meet every operational requirement.",
          "The product is HIPAA certified, certified under the Australian Privacy Act, a medical device, or clinically accredited.",
        ],
      },
      {
        type: "p",
        text: "Non-excludable rights under the Australian Consumer Law, if they apply, are not excluded.",
      },
    ],
  },
  {
    id: "liability",
    title: "20. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "This section is cautious draft language for counsel. It is not a finished allocation of risk.",
      },
      {
        type: "p",
        text: `To the extent permitted by law, ${PRODUCT_NAME} and its operators are not liable for indirect, incidental, special, consequential, or lost-profit damages, or for clinical outcomes arising from clinic-published instructions. Direct liability, if any, will be limited in a reviewed commercial agreement — often to fees paid in a preceding period — except where liability cannot be limited.`,
      },
    ],
  },
  {
    id: "indemnity",
    title: "21. Indemnity",
    blocks: [
      {
        type: "p",
        text: `The clinic agrees, to the extent permitted by law, to indemnify ${PRODUCT_NAME} and its operators against claims arising from the clinic’s aftercare content, branding, unauthorised use of the service, or failure to obtain rights or clinical review for published instructions. This is standard draft language and remains subject to legal review.`,
      },
    ],
  },
  {
    id: "suspension",
    title: "22. Suspension and termination",
    blocks: [
      {
        type: "p",
        text: "We may suspend accounts or published pages to address security issues, legal risk, or material breach. We will aim to notify the clinic when it is reasonable and lawful to do so. Termination for convenience of a paid contract, if offered, will be described in the commercial terms then in force.",
      },
    ],
  },
  {
    id: "changes",
    title: "23. Changes to Terms",
    blocks: [
      {
        type: "p",
        text: "We may update these Terms. Material changes will be indicated by updating the “Last updated” date on this page. Continued use after changes become effective constitutes acceptance of the updated Terms, except where a signed agreement says otherwise.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "24. Governing law",
    blocks: [
      {
        type: "placeholder",
        text: `These Terms are intended to be governed by the laws of ${P.governingLaw}. Courts of that jurisdiction are intended to have exclusive jurisdiction, except where non-excludable law says otherwise. This governing-law statement is a placeholder until counsel confirms the entity and venue.`,
      },
    ],
  },
  {
    id: "contact",
    title: "25. Contact",
    blocks: [
      {
        type: "p",
        text: `Questions about these Terms can be sent through the public Contact page on this website. Please do not include patient or clinical information in an enquiry.`,
      },
      {
        type: "placeholder",
        text: `Legal correspondence: ${P.legalContactEmail}. ${P.legalEntityName}. ${P.registeredAddress}.`,
      },
    ],
  },
];

export const TERMS_DOCUMENT = legalDocumentMeta({
  slug: "/terms",
  title: "Terms & Conditions",
  intro: `${PRODUCT_NAME} is a B2B aftercare publishing platform. Clinics publish clinic-branded instructions. Patients can read generic public guides without an account. This draft does not claim clinical accreditation, guaranteed uptime, or a finished commercial contract.`,
  sections: SECTIONS,
});
