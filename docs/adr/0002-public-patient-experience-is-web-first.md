# ADR 0002 — Public patient experience is web-first

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§7, 10.7, 16, 20

## Context

Patients need aftercare immediately after treatment, often on a phone, from a QR code or SMS link. A native app or patient account would add installation, login, and privacy cost without helping the core job.

The existing patient surface (`/display/[token]`) is a large-format live session display. That UX is not the aftercare experience.

## Decision

The public patient experience is **web-first and mobile-first**.

MVP includes:

- no native patient application;
- no patient login;
- no patient account.

A published guide must be immediately useful when opened in a mobile browser.

## Consequences

- Patient routes are public (for published content) and anonymous.
- Design quality is judged on phone readability, hierarchy, warnings, and tap-to-contact — not on chairside display modes.
- App-store, push-notification, and patient-identity features are out of MVP.

## Notes for later implementation

Do not reuse `/display/[token]` as the aftercare renderer. Aftercare is a distinct public surface resolved by tenant hostname + guide slug.
