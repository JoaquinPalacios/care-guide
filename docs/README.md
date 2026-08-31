# Care Guide documentation

This directory is the product and architecture documentation for Care Guide.

## Authoritative product contract

| Document                                                   | Purpose                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [product/PRD.md](product/PRD.md)                           | **Care Guide PRD v1.0 — Aftercare SaaS.** Authoritative product requirements, MVP scope, phases, and parked-chairside boundary. |
| [adr/](adr/README.md)                                      | Architecture Decision Records for the aftercare product reset.                                                                  |
| [product/WORKING-MEMORY.md](product/WORKING-MEMORY.md)     | Working notes for later implementation sessions. Not a substitute for the PRD.                                                  |
| [architecture/PERFORMANCE.md](architecture/PERFORMANCE.md) | Patient-route CSS measurement contract and Phase 1C budget.                                                                     |

## How to read these documents

1. Start with the [PRD](product/PRD.md) for product intent, MVP capabilities, exclusions, and phases.
2. Read the [ADRs](adr/README.md) for the architectural decisions the PRD depends on.
3. Use [WORKING-MEMORY.md](product/WORKING-MEMORY.md) only as a map of the current repository.

The aftercare **product** described in the PRD is not a complete commercial MVP. Phase 1A–1C are implemented (domain, hostname routing, styling isolation, public patient pages). QR, operator admin, and analytics are later. The application also contains a parked chairside procedure-session product. See PRD §26 and [ADR 0009](adr/0009-existing-chairside-product-is-parked.md).
