# Post-launch roadmap — Aftercare Guide

This document records **post-launch** product work. It is not a licence to start that work from a cleanup or marketing task.

Authoritative contract: [PRD.md](PRD.md)  
Architecture: [ADR 0006](../adr/0006-canonical-guide-plus-practice-configuration.md), [ADR 0010](../adr/0010-practice-guides-explicitly-pin-canonical-revisions.md), [ADR 0015](../adr/0015-recovery-plan-is-not-procedure-session.md)

---

## Launch vs post-launch

**Current production launch contains no persisted patient check-ins.**

The launch patient experience is an anonymous published guide:

- Today (demo fixture on `demodental` only)
- Timeline
- Print / Save PDF

Check-in is **POST-LAUNCH**. It is not part of MVP launch UI, even as a hidden client prototype.

Today is not a real per-patient capability until a persisted anonymous RecoveryPlan / share-link domain exists. The generic `/extraction` guide does not know a patient's real treatment day.

---

## Check-ins — premium / add-on

Check-ins are a future **PREMIUM / ADD-ON** capability (or a higher Connected / Recovery tier). Do **not** set a final price here.

A real implementation requires all of:

| Requirement                               | Why                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| RecoveryPlan persistence                  | Day-aware “today” and check-in history need a started recovery, not `Date.now()` |
| Opaque patient / recovery token           | Unguessable public URL; no patient account                                       |
| Patient-reported health information       | Feeling / note is health data, not a marketing form                              |
| Retention / deletion policy               | Health information cannot be kept indefinitely without a stated policy           |
| Tenant isolation                          | Clinic A must never see Clinic B check-ins                                       |
| Audit / event history                     | Who read or acted on a check-in, and when                                        |
| Clinic dashboard                          | Staff need a place to review responses                                           |
| Alerts / notifications (if ever added)    | Optional later; not implied by storing a check-in                                |
| Explicit non-emergency-monitoring wording | Check-in is not clinical monitoring or an emergency service                      |
| Operational expectations                  | Who reads responses, during which hours, and what happens if nobody does         |
| Security / privacy review                 | Required before any persistence, analytics, or notification                      |

Check-in is **not** emergency monitoring. Copy must say so. Do not reuse `ProcedureSession`.

Potential commercial model (not priced):

- optional paid add-on, or
- a higher Connected / Recovery plan tier

Feature availability should be gateable per clinic / plan (`enabled` / `disabled`). When disabled, Check-in is omitted entirely.

---

## RecoveryPlan (not implemented)

Future concept, documented in ADR 0015:

```text
GuideTemplate
  → published revision
  → resolved / composed guide
  → future RecoveryPlan
       clinicId
       guide / revision pin
       startedAt / procedureDate
       opaque public token
       status
```

Then:

```text
Today
Timeline
Print / PDF
optional future Check-ins
```

**RecoveryPlan ≠ ProcedureSession.** Do not implement RecoveryPlan from this document. The current Day 1 Today experience is an explicit demo fixture.

---

## Template / content model

Launch business model:

```text
canonical Aftercare Guide templates
        ↓
clinic enables a template
        ↓
clinic may override sections
        ↓
clinic may add local sections / information
        ↓
clinic may create its own custom guide
        ↓
preview
        ↓
publish a pinned revision
```

An update to an Aftercare Guide canonical template must **never** silently mutate a clinic's already-approved / published patient guide. Practices pin a revision (ADR 0010). Adopting a newer canonical revision is an explicit later operator action.

Clinical content must be reviewed / approved separately. Do not seed clinically authoritative versions from this roadmap.

### Initial dental template direction (candidates, not seeded)

- Tooth Extraction
- Wisdom Teeth Removal
- Dental Implant
- Scaling & Root Planing / Periodontal Deep Cleaning
- Periodontal Surgery
- Root Canal

These are content-library candidates. Exact published titles can follow clinical review.

---

## Future verticals

Architecture is intentionally multi-specialty. Terminology and data names stay generic.

Current commercial sequencing:

```text
Dental
  → cosmetic / injectables
  → physiotherapy
  → podiatry
  → dermatology
  → veterinary
  → surgery / allied health
```

Do **not** implement later verticals now. Do not build abstractions purely for speculative future requirements beyond keeping the model generic.

### Physiotherapy (future fit)

When that vertical is an explicit programme, the same guide / recovery model should fit:

- recovery plans
- home exercise guidance
- staged rehabilitation
- restrictions
- progression milestones
- videos later
- clinic-specific instructions

Not in launch. Dental first.

---

## Platform Contact / Pricing

Aftercare Guide **sales** Contact and Pricing belong only on the **root marketing domain**.

They must not appear on tenant hosts such as `demodental`. Tenant pages expose only:

- clinic contact
- clinic phone
- clinic urgent / emergency instructions

Platform Contact / Pricing live only on the **root marketing domain** (`/pricing`, `/contact`). They must not appear on tenant hosts such as `demodental`. Tenant pages expose only:

- clinic contact
- clinic phone
- clinic urgent / emergency instructions

Working published prices (provisional AUD): Essential A$79 / month, Practice A$149 / month, Group custom pricing. Check-ins remain unpriced post-launch premium/add-on work. Contact delivery is a server-side clinic enquiry form (`MARKETING_CONTACT_TO_EMAIL` / SMTP). See [MARKETING-CONTACT.md](../architecture/MARKETING-CONTACT.md).

---

## Explicitly not this document

- Phase 2 clinic / operator admin
- Persisted RecoveryPlan
- Reuse of ProcedureSession
- Clinically authoritative template authoring
- Final pricing
