# Architecture Decision Records

This log records product-architecture decisions for Care Guide after the v1.0 aftercare reset.

These records are documentation only. They do not implement behaviour.

## Format

Each ADR is a numbered Markdown file:

```text
docs/adr/NNNN-short-title.md
```

Use this lightweight structure:

- **Status** — Accepted, Proposed, Superseded, or Deprecated
- **Date**
- **Context**
- **Decision**
- **Consequences**
- **Notes for later implementation** — constraints only; not a work ticket

Do not create an ADR for a reversible UI detail. Create one when a later implementation session would otherwise have to guess the product boundary.

## Index

| ADR                                                                          | Title                                                        | Status   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ | -------- |
| [0001](0001-aftercare-is-primary-product-domain.md)                          | Aftercare is the primary product domain                      | Accepted |
| [0002](0002-public-patient-experience-is-web-first.md)                       | Public patient experience is web-first                       | Accepted |
| [0003](0003-tenant-identity-uses-hostname.md)                                | Tenant identity uses hostname                                | Accepted |
| [0004](0004-staff-admin-and-patient-surfaces-are-separated.md)               | Staff/admin and patient surfaces are logically separated     | Accepted |
| [0005](0005-aftercare-uses-a-new-domain-model.md)                            | Aftercare uses a new domain model                            | Accepted |
| [0006](0006-canonical-guide-plus-practice-configuration.md)                  | Canonical guide + practice configuration model               | Accepted |
| [0007](0007-no-patient-pii-required-for-mvp.md)                              | No patient PII required for MVP                              | Accepted |
| [0008](0008-dental-first.md)                                                 | Dental first                                                 | Accepted |
| [0009](0009-existing-chairside-product-is-parked.md)                         | Existing chairside product is parked, not deleted            | Accepted |
| [0010](0010-practice-guides-explicitly-pin-canonical-revisions.md)           | Practice guides explicitly pin canonical revisions           | Accepted |
| [0011](0011-patient-styling-uses-css-modules-and-semantic-runtime-tokens.md) | Patient styling uses CSS Modules and semantic runtime tokens | Accepted |

Related product contract: [../product/PRD.md](../product/PRD.md).
Performance contract: [../architecture/PERFORMANCE.md](../architecture/PERFORMANCE.md).
