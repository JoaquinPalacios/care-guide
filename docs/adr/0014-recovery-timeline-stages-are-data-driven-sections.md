# ADR 0014 — Recovery timeline stages are data-driven sections

- **Status:** Accepted
- **Date:** 2026-09-07
- **PRD:** [../product/PRD.md](../product/PRD.md) §§10.3–10.5

## Context

Patient guides need a chronological recovery journey. Periods differ by procedure and specialty (`First 4 hours`, `Day 2–3`, `Week 2+`). Hard-coding dental stages in React would freeze the product to one clinical shape.

`GuideSectionKind` already includes `RECOVERY_TIMELINE`. The previous demo used nearby kinds (`IMMEDIATE_CARE`, `FIRST_24_HOURS`) as flat sections, which did not express a journey.

## Decision

Keep using `GuideTemplateSection` (and practice additions) for recovery stages.

- Consecutive composed sections with `kind = RECOVERY_TIMELINE` render as one chronological timeline.
- Optional `periodLabel` carries the period text. `title` remains the stage heading. `body` remains the guidance. `sortOrder` remains the order.
- Period labels are content, not an enum. The renderer must not assume dental periods.
- Practice overrides continue to replace title/body only; the canonical `periodLabel` is preserved.

Do not add a separate timeline subsystem, patient-specific plan fields, or client-side timeline interaction.

## Consequences

- Guides without timeline sections still render as before.
- Schema change is additive (`periodLabel` nullable).
- Clinical copy remains a later review process. Demo content stays labelled non-authoritative.

## Notes for later implementation

Patient CTAs (call, contact page, booking, email, after-hours) should become structured configuration with enable/disable, label, and order. Booking is not rendered in this phase even when `bookingUrl` exists.
