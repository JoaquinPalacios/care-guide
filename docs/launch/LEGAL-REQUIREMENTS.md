# Legal launch requirements — River Aftercare

Public `/privacy` and `/terms` are **production-facing drafts for legal review**. They do not complete the production launch gate and have **not** received final legal approval.

## About

Public `/about` is published from factual product docs. It does not claim certification, regulatory approval, customer counts, or health outcomes.

## Privacy

**Status:** Production-facing draft implemented at `/privacy`. **LEGAL REVIEW STILL REQUIRED.** Not approved.

The published draft covers operator identity (sole trader trading as River Aftercare, ABN 32 671 297 130, Tweed Heads South NSW), scope, current processing, the MVP patient-data boundary, cookies/localStorage, analytics (none in the current app), service-provider _categories_, overseas processing (not claimed as Australia-only), security measures that exist in the application, data-breach response, intended retention, access/correction, complaints, children, and contact.

Unresolved before production:

- full legal name of the sole trader (`[FULL LEGAL NAME]`)
- River Aftercare business-name registration status
- privacy/legal email (`[PRIVACY EMAIL]`)
- GST registration status (not stated in public copy)
- named production subprocessors once hosting, database, object storage, DNS, email and monitoring are provisioned
- overseas-processing countries once providers are confirmed
- enforceable retention/backup configuration in production infrastructure
- practical clinic-content export process to honour the 30-day exit wording
- counsel-approved privacy-status language (APP entity / NDB applicability)
- update this policy when analytics or a mail vendor goes live

Do not treat the draft as Privacy Act certification, HIPAA compliance, or a finished subprocessor list.

## Terms

**Status:** Production-facing draft implemented at `/terms`. **LEGAL REVIEW STILL REQUIRED.** Not approved.

The published draft covers B2B Customer definition (public guide readers are not Customers), clinical responsibility, patient-data boundary, invoice billing in AUD (monthly in advance, 14-day payment, bank transfer initially), month-to-month subscription, cancellation at period end, overdue suspension after notice, NSW governing law with non-exclusive jurisdiction, liability cap, and a narrowed third-party indemnity.

Unresolved before production:

- full legal name of the sole trader
- River Aftercare business-name registration status
- GST registration status
- legal/privacy email
- counsel review of limitation of liability, indemnity, and Terms generally

Do not treat the draft as a finished contract.

## Medical / content disclaimer

Patient pages already avoid invented clinical authority. A reviewed disclaimer for clinic-published instructions remains part of the legal pack.

## Launch TODO (do not fabricate)

| Fact                     | Repository truth                                                                 |
| ------------------------ | -------------------------------------------------------------------------------- |
| Legal entity name        | `[FULL LEGAL NAME]` — sole trader trading as River Aftercare                     |
| ABN                      | 32 671 297 130                                                                   |
| ACN                      | Not applicable — not currently an Australian company                             |
| Public location          | Tweed Heads South, New South Wales, Australia (no residential street address)    |
| Governing law            | New South Wales, Australia (non-exclusive jurisdiction)                          |
| Legal / privacy email    | `[PRIVACY EMAIL]` — Contact form is the public path until a mailbox is confirmed |
| GST registration         | Unknown — public copy says GST will be charged where applicable                  |
| Production subprocessors | Not provisioned — categories only                                                |
