# ADR 0003 — Tenant identity uses hostname

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§10.1, 11, 18.5

## Context

The commercial product includes a branded practice presence. Path-prefixed tenant URLs such as `<platform-domain>/pacificdental/extraction` make the platform look like the primary brand and complicate printed QR material.

Custom customer domains (for example `aftercare.pacificdental.com.au`) are a likely future premium tier, so tenant identity should not be hard-coded as a path segment or as a single deployment per customer.

The commercial platform domain is **not yet selected**.

## Decision

Standard practices use:

```text
<tenant-slug>.<platform-domain>
```

Tenant identity is resolved from **hostname**, not from a required practice slug in the URL path.

Examples (conceptual):

```text
pacificdental.<platform-domain>/
pacificdental.<platform-domain>/extraction
```

Use the placeholder `<platform-domain>` until a commercial domain is chosen. Do not hard-code a guessed final domain into architecture docs or, later, into application code as if it were settled.

Hostname is ultimately **tenant configuration**, so a future custom-domain tier can attach another hostname to the same tenant without forking the app. Custom domains are not MVP.

## Consequences

- Local development must simulate hostnames (Phase 1).
- Public routing keys off host + guide slug.
- `Clinic` will need a tenant slug (or equivalent) in a later implementation phase; it does not have one today.
- DNS and hosting remain infrastructure choices for later; this ADR is a product requirement.

## Implementation notes (Phase 1B)

`CARE_GUIDE_ROOT_DOMAIN` is the platform root. `lib/tenancy/parse-hostname.ts` classifies Host. `proxy.ts` rewrites `<slug>.<root>` to `/_sites/<slug>/…` with no database access. Direct `/_sites` is 404. `Clinic.slug` (added in Phase 1A) is loaded in `app/%5Fsites/[tenant]`. Custom domains remain out of scope.
