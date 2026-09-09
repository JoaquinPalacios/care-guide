# Care Guide documentation

This directory is the product and architecture documentation for Care Guide.

## Authoritative product contract

| Document                                                         | Purpose                                                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [product/PRD.md](product/PRD.md)                                 | **Care Guide PRD v1.0 — Aftercare SaaS.** Authoritative product requirements, MVP scope, phases, and parked-chairside boundary. |
| [product/POST-LAUNCH-ROADMAP.md](product/POST-LAUNCH-ROADMAP.md) | Post-launch Check-ins, RecoveryPlan, template library, and future verticals. Not current implementation.                        |
| [adr/](adr/README.md)                                            | Architecture Decision Records for the aftercare product reset.                                                                  |
| [product/WORKING-MEMORY.md](product/WORKING-MEMORY.md)           | Working notes for later implementation sessions. Not a substitute for the PRD.                                                  |
| [architecture/PERFORMANCE.md](architecture/PERFORMANCE.md)       | Patient-route CSS/JS measurement contract and Phase 1F.1 budget.                                                                |

## How to read these documents

1. Start with the [PRD](product/PRD.md) for product intent, MVP capabilities, exclusions, and phases.
2. Read the [ADRs](adr/README.md) for the architectural decisions the PRD depends on.
3. Use [WORKING-MEMORY.md](product/WORKING-MEMORY.md) only as a map of the current repository.

The aftercare **product** described in the PRD is not a complete commercial MVP. Phase 1A–1C plus 1E hardening, 1F public-experience work, Phase 1G’s interactive `demodental` recovery demo, and **Phase 1G.1 launch-scope cleanup** are implemented. Phase 1D was absorbed into 1C. QR, operator admin, analytics, persisted RecoveryPlan, and Check-ins are later. The application also contains a parked chairside procedure-session product. See PRD §26, [ADR 0009](adr/0009-existing-chairside-product-is-parked.md), [ADR 0015](adr/0015-recovery-plan-is-not-procedure-session.md), and [POST-LAUNCH-ROADMAP.md](product/POST-LAUNCH-ROADMAP.md).

**Aftercare Guide** is the current provisional commercial/product name. The repository remains `care-guide`.
