# ADR 0006 — Canonical guide + practice configuration model

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§10.3–10.5, 12, 13

## Context

If every practice authored aftercare from scratch, Care Guide would be a CMS, not a maintained library business. If every practice received identical uneditable copy, the product could not match local protocols, phone numbers, or clinical preferences.

Content is health-related. Collapsing canonical text and practice edits into one untraceable blob would block later governance, review, and platform-wide template updates.

## Decision

Care Guide owns reusable **canonical Guide Templates**.

A practice **enables** templates relevant to its services, optionally records **Practice Additions** and **Practice Overrides**, then **previews** and **publishes** a **Practice Guide**.

Canonical content, practice additions, and practice overrides remain conceptually distinguishable in the system of record even though the patient sees one composed page.

Disabled or unpublished guides must not appear publicly.

The same canonical guide can be enabled by multiple practices, each with its own configuration.

## Consequences

- Library + enablement is the core commercial mechanic.
- Publishing, not merely editing, controls patient visibility.
- Future template updates need a defined rollout policy (open decision OD-4 in the PRD).

## Notes for later implementation

Do not store the patient-visible guide as the only copy of content without provenance. Draft vs published is an MVP requirement; richer clinical review fields may wait.
