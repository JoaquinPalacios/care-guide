import { PRODUCT_NAME } from "@/lib/branding/product-name";
import {
  LEGAL_PLACEHOLDERS,
  legalDocumentMeta,
  type LegalSection,
} from "@/lib/legal/document";

const P = LEGAL_PLACEHOLDERS;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "who",
    title: "1. Who River Aftercare is",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} is a branded aftercare publishing platform for healthcare practices. This Privacy Policy describes how information is handled on the public marketing website, in clinic and staff accounts, and on clinic-branded patient aftercare pages.`,
      },
      {
        type: "placeholder",
        text: `The operator of ${PRODUCT_NAME} is ${P.legalEntityName}, ABN/ACN ${P.abnAcn}, ${P.registeredAddress}.`,
      },
    ],
  },
  {
    id: "scope",
    title: "2. Scope",
    blocks: [
      {
        type: "p",
        text: "This policy covers:",
      },
      {
        type: "ul",
        items: [
          "Visitors to the public River Aftercare marketing site.",
          "People who send a clinic enquiry through the Contact form.",
          "Clinic staff who hold a staff account.",
          "Practice configuration and branding stored for a clinic.",
          "Readers of public patient aftercare pages.",
        ],
      },
      {
        type: "p",
        text: "It does not currently describe a patient login, a patient health record, or personalised per-patient aftercare. Those are not part of the generic MVP guides.",
      },
    ],
  },
  {
    id: "marketing-visitors",
    title: "3. Information collected from marketing visitors",
    blocks: [
      {
        type: "p",
        text: "If you only browse the public marketing pages, we may process technical information that web servers typically generate (such as IP address, browser type, dates and times of requests, and the pages requested). We do not currently operate a marketing analytics product on those pages.",
      },
    ],
  },
  {
    id: "enquiries",
    title: "4. Contact and enquiry information",
    blocks: [
      {
        type: "p",
        text: "The Contact form collects full name, work email, practice or clinic name, optional phone number, and an optional message. A hidden honeypot field is used to reduce spam. The form asks you not to include patient or clinical information.",
      },
      {
        type: "p",
        text: "Enquiry messages are sent by email using the environment-configured mail transport. Production email delivery is not yet a final provisioned vendor. Do not assume a specific provider is already in use.",
      },
    ],
  },
  {
    id: "staff-accounts",
    title: "5. Clinic and staff account information",
    blocks: [
      {
        type: "p",
        text: "Staff accounts store name (if provided), email address, authentication credentials (stored as a password hash, not the password itself), clinic membership and role, and session data needed to stay signed in.",
      },
      {
        type: "p",
        text: "Platform operators who administer clinics see clinic identity and configuration, not a patient record.",
      },
    ],
  },
  {
    id: "practice-configuration",
    title: "6. Practice configuration and branding data",
    blocks: [
      {
        type: "p",
        text: "Clinics may store practice display name, colours, radius, instruction terminology, theme mode, contact details, emergency instructions, logos once object storage is provisioned, and the aftercare guides they create or adapt.",
      },
      {
        type: "p",
        text: "That information is clinic operational data. It is shown on the clinic’s patient pages under the clinic’s brand.",
      },
    ],
  },
  {
    id: "technical",
    title: "7. Technical, device, and log information",
    blocks: [
      {
        type: "p",
        text: "Application hosts may keep server logs (IP address, user agent, requested URL, status codes, timestamps) to operate, secure, and debug the service. Retention of those logs depends on the hosting environment once production is provisioned and is not a fixed period in this repository.",
      },
    ],
  },
  {
    id: "patient-architecture",
    title: "8. Patient guide architecture",
    blocks: [
      {
        type: "p",
        text: "Patient aftercare pages live on a clinic hostname. They present clinic-published procedure guidance. URLs identify a practice and a procedure guide (for example a tooth-extraction page), not a named patient.",
      },
    ],
  },
  {
    id: "no-patient-account",
    title: "9. No patient account and no intended patient PII in generic MVP guides",
    blocks: [
      {
        type: "p",
        text: "Generic public guides at launch do not require a patient to create an account, and they are not designed to collect patient name, date of birth, medical record numbers, or other patient personal information. Do not use marketing or clinic forms to send us patient records.",
      },
    ],
  },
  {
    id: "cookies",
    title: "10. Cookies and authentication",
    blocks: [
      {
        type: "p",
        text: "Staff authentication uses host-only session cookies on the staff hostname. Marketing and patient appearance preferences may be stored in the browser (for example localStorage for Light / Dark / System). These are not advertising trackers.",
      },
      {
        type: "p",
        text: "We do not currently use a cookie-consent marketing stack, because we do not currently run a marketing analytics or advertising pixel.",
      },
    ],
  },
  {
    id: "analytics",
    title: "11. Analytics",
    blocks: [
      {
        type: "p",
        text: "Anonymous guide-view analytics are a post-launch product direction. They are not implemented in the current application. This policy must be updated before any analytics vendor or first-party event table is turned on. Any future analytics must not introduce patient identity.",
      },
    ],
  },
  {
    id: "processors",
    title: "12. Service providers and subprocessors",
    blocks: [
      {
        type: "p",
        text: "Production infrastructure is not provisioned yet. When it is, subprocessors are expected to fall into these categories rather than a claimed live vendor list:",
      },
      {
        type: "ul",
        items: [
          "Application hosting for the website and staff portal.",
          "Managed PostgreSQL database hosting.",
          "Object storage for clinic logos, if upload is enabled.",
          "DNS and related edge services.",
          "Transactional or SMTP email delivery for enquiries and account mail.",
          "Error monitoring, if configured before launch.",
        ],
      },
      {
        type: "p",
        text: "Desired production direction (not a statement that these providers are live) has included application hosting, Australian-region database hosting, object storage, DNS, and transactional email. This policy must be updated with named subprocessors once they are confirmed.",
      },
    ],
  },
  {
    id: "hosting",
    title: "13. Hosting, storage, and data locations",
    blocks: [
      {
        type: "p",
        text: "We do not claim that information is already stored with a named production host, database, or object-storage provider. Those choices remain a launch gate. Processing may occur in Australia and in other regions used by a chosen provider. Do not read this section as a data-residency guarantee.",
      },
    ],
  },
  {
    id: "email",
    title: "14. Email delivery",
    blocks: [
      {
        type: "p",
        text: "Contact enquiries are delivered by the configured SMTP or mail transport in the application environment. A dedicated production mailbox and a chosen transactional provider are still required before public launch. SPF, DKIM, and DMARC cannot exist until a brand domain and mail vendor exist.",
      },
    ],
  },
  {
    id: "security",
    title: "15. Security",
    blocks: [
      {
        type: "p",
        text: "We use reasonable safeguards appropriate to a small B2B web application, including hashed passwords, separated staff and patient hosts, and access controls for clinic data. We do not claim a specific certification (including ISO, SOC, HIPAA, or Privacy Act certification).",
      },
    ],
  },
  {
    id: "retention",
    title: "16. Retention",
    blocks: [
      {
        type: "p",
        text: "This repository does not define fixed retention periods. Enquiry emails are kept as long as needed to respond and operate the service. Staff accounts and clinic configuration are kept while the clinic uses the service and for a reasonable period afterwards. Server logs follow the hosting provider’s defaults unless a production policy says otherwise. Counsel should set retention schedules before launch.",
      },
    ],
  },
  {
    id: "rights",
    title: "17. Access, correction, deletion, and contact",
    blocks: [
      {
        type: "p",
        text: "Depending on applicable law, you may have rights to ask what information we hold about you, to correct it, or to ask us to delete it where we do not need to keep it. Clinic administrators can update much of their practice configuration in the staff portal.",
      },
      {
        type: "p",
        text: "Use the public Contact page for privacy requests. Please do not include patient records in that form.",
      },
      {
        type: "placeholder",
        text: `Privacy contact: ${P.legalContactEmail}.`,
      },
    ],
  },
  {
    id: "international",
    title: "18. International processing",
    blocks: [
      {
        type: "p",
        text: "The product is aimed at Australian dental practices, but we do not claim that all processing stays in Australia. Providers, once chosen, may process data in other countries. This policy will name locations when subprocessors are confirmed.",
      },
    ],
  },
  {
    id: "children",
    title: "19. Children",
    blocks: [
      {
        type: "p",
        text: `${PRODUCT_NAME} is a business service for clinics. It is not directed at children. Public aftercare pages may be read by anyone with the link, including a parent reading a clinic’s procedure guide. We do not knowingly collect children’s personal information through the marketing site or staff accounts.`,
      },
    ],
  },
  {
    id: "changes",
    title: "20. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We will update this page when the draft is legally reviewed, when production subprocessors are confirmed, and if we add analytics or other processing. The “Last updated” date will change when we do.",
      },
    ],
  },
  {
    id: "contact",
    title: "21. Contact",
    blocks: [
      {
        type: "p",
        text: `For privacy questions, use the Contact page on this website or write to the address below once it is confirmed.`,
      },
      {
        type: "placeholder",
        text: `${P.legalEntityName}. ${P.registeredAddress}. ${P.legalContactEmail}.`,
      },
    ],
  },
];

export const PRIVACY_DOCUMENT = legalDocumentMeta({
  slug: "/privacy",
  title: "Privacy Policy",
  intro: `This policy describes the information ${PRODUCT_NAME} actually handles today: marketing enquiries, clinic and staff accounts, and clinic-published aftercare pages. Generic public guides are not a patient record. Production hosts and subprocessors are not yet confirmed.`,
  sections: SECTIONS,
});
