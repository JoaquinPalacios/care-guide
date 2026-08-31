# ADR 0007 — No patient PII required for MVP

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§7, 10.9, 15, 16, 20

## Context

Personalised aftercare (this patient’s extraction, this patient’s phone number) would require patient identity, treatment records, and a much heavier compliance posture. The MVP job is: give *this practice’s* patients *this procedure’s* branded guidance, via a URL anyone with the link can open.

The existing chairside display is token-scoped to a live session but still avoids collecting patient PII in schema. Aftercare should go further: no session, no patient record, no login.

## Decision

MVP public guides are **procedure / practice resources**, not patient records.

MVP must not require patient profile, login, name, date of birth, medical record, treatment record, email, or phone number.

Analytics must not introduce patient identity. Avoid collecting sensitive health information unnecessarily.

Patient-specific aftercare is a possible later phase only if product value justifies the complexity. Do not design MVP around it.

## Consequences

- URLs such as `pacificdental.<platform-domain>/extraction` contain no patient identity.
- Care Guide does not need to know which person received a given procedure.
- Sharing a guide URL is like sharing a practice webpage, not like opening a chart.

## Notes for later implementation

Do not add `patientId` to aftercare routes “for later.” Do not log identifiers that re-identify a patient as a condition of viewing a guide.
