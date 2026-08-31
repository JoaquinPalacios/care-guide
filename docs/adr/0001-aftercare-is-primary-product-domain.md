# ADR 0001 — Aftercare is the primary product domain

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§2–3, §18, §26

## Context

This repository currently implements a clinic-staff chairside product: rooms, doctors, `ProcedureSession`, in-chair stages, `/display/[token]`, and Supabase Realtime. Repository documentation previously described that workflow as Care Guide itself.

Care Guide is now formally reset. The primary commercial product is B2B branded aftercare SaaS. Continuing to treat chairside sessions as the core domain would produce the wrong architecture, URLs, content model, and MVP.

## Decision

Aftercare is the primary product domain.

The existing chairside session system is parked and **must not define aftercare architecture**. Aftercare must not depend on `ProcedureSession`. A permanent aftercare guide is not a completed session.

## Consequences

- New implementation work is evaluated against aftercare value, not against live session completeness.
- Chairside code remains in the tree (see [ADR 0009](0009-existing-chairside-product-is-parked.md)) but is out of current MVP scope.
- README and product docs must distinguish product direction from current implementation.

## Notes for later implementation

Do not add aftercare fields onto `ProcedureSession` or treat `ProcedureTemplate.aftercareUrl` as the aftercare product.
