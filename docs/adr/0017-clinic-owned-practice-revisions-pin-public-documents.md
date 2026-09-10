# ADR 0017 — Clinic-owned practice revisions pin the public patient document

- **Status:** Accepted
- **Date:** 2026-09-11
- **PRD:** [../product/PRD.md](../product/PRD.md) §§12.2, 13.1–13.3
- **Related:** [0010](0010-practice-guides-explicitly-pin-canonical-revisions.md)

## Context

Phase 1A pinned a **canonical** `GuideTemplateRevision` on `PracticeGuide`. Overrides and additions were live rows. Editing those rows would have changed the public patient document in place.

Clinics now need draft / preview / publish. A later canonical library update still must never silently rewrite an already-published clinic guide. Custom (template-less) guides also need a publication snapshot.

## Decision

Add clinic-owned `PracticeGuideRevision` rows:

- Version `0` is the mutable working draft.
- Versions `1+` are immutable `PUBLISHED` snapshots.
- Save draft updates version `0` only.
- Publish **copies** the draft into the next published version. It does not mutate an existing published row.
- Public tenant loaders serve the highest published clinic revision (`version > 0`).
- If a legacy row has no clinic content revisions yet, public loaders may still compose the canonical pin + overrides + additions.

`PracticeGuide.guideTemplateId` and `pinnedRevisionId` are optional together (both null for a custom guide, or both set for a template-backed guide). Unique `(clinicId, guideTemplateId)` still prevents enabling the same canonical template twice. Postgres allows multiple nulls, so several custom guides per clinic are allowed.

ADR 0010 remains: a template-backed guide still pins a canonical revision for provenance. Public patient copy is no longer derived from live override rows once clinic content revisions exist.

## Consequences

- Draft preview is an authenticated app-host route using the same patient renderer.
- Save and Publish are separate actions.
- A new canonical `GuideTemplateRevision` does not change already-published clinic snapshots.
- Adopting a newer canonical revision remains a later explicit workflow.
