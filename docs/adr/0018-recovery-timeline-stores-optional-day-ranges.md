# ADR 0018 — Recovery timeline stages store optional structured day ranges

- **Status:** Accepted
- **Date:** 2026-09-11
- **PRD:** [../product/PRD.md](../product/PRD.md) §10.5
- **Related:** [0014](0014-recovery-timeline-stages-are-data-driven-sections.md)

## Context

Timeline stages already had display copy (`periodLabel`) such as “First few hours” or “Days 2–3”. The Phase 1G Today demo inferred day ranges by parsing those strings. That is acceptable as a fallback, but clinic editors should not be forced to encode timing only in human labels, and RecoveryPlan later will need numeric ranges.

Guessing clinical day ranges from arbitrary free text is unsafe.

## Decision

Store optional structured timing on timeline-capable section rows:

- `startDay` nullable integer (`>= 0`)
- `endDay` nullable integer (`>= startDay`)
- `periodLabel` remains display copy

Both structured fields are null, or both are set. Editor-created stages should write structured ranges. Existing demo labels are backfilled only where the mapping is deterministic (`First few hours` → 0–0, `Today / first 24 hours` → 1–1, `Days 2–3` → 2–3, `Days 4–7` → 4–7).

The Today demo resolver prefers structured ranges and still parses `periodLabel` when structured fields are absent. Overlapping structured ranges are rejected in the editor. Stages without structured timing remain renderable.

This prepares for RecoveryPlan. It does **not** persist RecoveryPlan or Check-ins.

## Consequences

- Clinics can define flexible stages/ranges instead of one row per calendar day.
- Patient rendering does not depend on parsing clinic-authored free text when structured fields exist.
- Future RecoveryPlan can consume the same day-range contract.
