# ADR 0015 — RecoveryPlan is not ProcedureSession

- **Status:** Accepted
- **Date:** 2026-09-09
- **PRD:** [../product/PRD.md](../product/PRD.md) §§10.3–10.5, 18.2–18.4

## Context

Phase 1G prototypes a day-aware patient demo (Today / Timeline / optional Check-in / printable care plan) on the fictional `demodental` tenant. The current public guide is a published, anonymous document. A future real product needs a started recovery that can answer “what matters today?” without coupling aftercare to the parked chairside product.

`ProcedureSession` is a live, in-clinic walkthrough with rooms, doctors, PIN/display tokens, and stage transitions. Reusing it for aftercare would encode the wrong lifecycle, the wrong identity model, and the wrong privacy boundary.

## Decision

Keep the current document pipeline:

```text
GuideTemplate
  → published GuideTemplateRevision
  → PracticeGuide (enabled, pinned revision, overrides, additions)
  → composed resolved guide
```

A future **RecoveryPlan** (also called CarePlanInstance in product conversation) is a new aftercare record. It is **not** `ProcedureSession`. It must not reuse chairside session tables, tokens, or stage machines.

Proposed RecoveryPlan fields (not implemented in this phase):

| Field                               | Purpose                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                                | Internal identifier                                                                             |
| `clinicId`                          | Tenant scope                                                                                    |
| `practiceGuideId` / pinned revision | Which published guide this plan follows                                                         |
| `startedAt` / `procedureDate`       | Explicit recovery origin. Never infer from `Date.now()` alone at read time without storing this |
| `publicToken`                       | Opaque unguessable token for the patient URL                                                    |
| `status`                            | e.g. active / completed / void                                                                  |
| `createdAt` / `updatedAt`           | Audit timestamps                                                                                |

Derived (not stored as clinical truth):

```text
RecoveryPlan
  → Today resolver
  → Timeline (earlier / current / upcoming)
  → printable care plan / PDF
  → optional Check-ins (premium)
```

Phase 1G computes Today/Timeline from an **explicit demo fixture** (`simulatedDay`, `recoveryWindowDays`) plus composed `RECOVERY_TIMELINE` sections. It does not persist RecoveryPlan.

Do **not** add: patient name, DOB, PIN, patient account, medication records, appointments, or health-data writes in this phase.

## Check-in commercial boundary

Persisted check-ins are a **premium / add-on** capability. The Phase 1G interaction is demo-only, client-local, discarded on refresh, and must not write to the database, an API, localStorage, or analytics.

A real implementation will require all of:

- RecoveryPlan / plan token
- health-information handling
- retention and deletion policy
- tenant access controls
- audit / event model
- clinic dashboard
- a clear non-emergency-monitoring contract

Feature availability should be gateable per clinic/plan (`enabled` / `disabled`). When disabled, Check-in is omitted from navigation. Phase 1G uses a demo config flag only.

## Accessibility ownership

**Clinic controls:** branding, terminology, guide content, timeline, warnings, contact, feature availability, and default presentation/theme where appropriate.

**Patient / device controls:** theme override where the clinic permits it, reduced motion, and future reading density / text sizing.

A clinic must not be able to disable a user’s `prefers-reduced-motion` preference. Density controls are not in this phase.

## Printable care plan

Print derives from the **same composed guide document** as the web guide. Phase 1G uses print-optimised HTML and `@media print` (browser Print / Save as PDF). Do not add a PDF library until a commercial workflow requires server-generated files.

## Consequences

- Aftercare loaders and patient UI remain free of `ProcedureSession`.
- Demo check-in cannot become accidental PHI storage.
- Later PDF generation, if added, must still start from the resolved guide, not a second copy of clinical text.

## Notes for later implementation

Do not begin RecoveryPlan schema, tokens, or check-in persistence from a marketing/demo polish task. Phase 2 operator admin is a separate explicit programme.
