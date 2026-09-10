# ADR 0016 — Platform OPERATOR is distinct from clinic ADMIN

- **Status:** Accepted
- **Date:** 2026-09-11
- **PRD:** [../product/PRD.md](../product/PRD.md) §§5.3–5.4, 10.10, 14.1, open decision OD-5

## Context

Clinic membership already has `ADMIN` and `STAFF`. Those roles describe authority **inside one clinic**. Aftercare Guide also needs a way for platform staff to see every subscribing practice.

Reusing clinic `ADMIN` as a global Aftercare Guide administrator would leak operator routes to ordinary clinic users and blur tenant isolation.

## Decision

Add `User.platformRole`:

| Value      | Meaning                                                          |
| ---------- | ---------------------------------------------------------------- |
| `NONE`     | Default. Clinic portal access still requires a clinic membership |
| `OPERATOR` | Platform-level Aftercare Guide operator                          |

- Clinic `ADMIN` / `STAFF` stay clinic-scoped.
- Operator authorization is server-side (`requirePlatformOperator()`). It must not trust client state, query parameters, or a requested `clinicId`.
- A local operator account (`LOCAL_OPERATOR_EMAIL` / `LOCAL_OPERATOR_PASSWORD`) is seeded only outside production and has **no** clinic membership.
- Operator UI lives at `/operator/clinics` under Aftercare Guide platform identity.
- This phase does **not** add impersonation, invitations, or complex team management.

OD-5 is closed: operator identity is a global `PlatformRole`, not clinic `ADMIN`.

## Consequences

- Clinic admins receive not-found behaviour for `/operator/*`.
- Operators without a membership are redirected away from the clinic portal to All Clinics.
- Later invitation/onboarding work can attach clinic memberships without collapsing the platform boundary.
