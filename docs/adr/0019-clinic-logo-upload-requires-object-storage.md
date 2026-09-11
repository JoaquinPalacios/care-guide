# ADR 0019 — Clinic logo upload waits for production object storage

- **Status:** Accepted
- **Date:** 2026-09-11
- **Updated:** 2026-09-12 (Phase 2A.4 — application upload complete; bucket still external)
- **PRD:** [../product/PRD.md](../product/PRD.md) §10.2

## Context

`ClinicProfile.logoUrl` already stores a same-origin image path. The patient renderer sanitizes it with `toSafeLogoSrc` (PNG, JPEG, WebP, SVG paths; no remote URLs, `data:`, or traversal) and renders `<img src>`.

Clinics should upload a logo themselves before launch. The repository’s Supabase client is used for **Realtime** (parked chairside) unless a Storage bucket is provisioned. There is no Vercel Blob, S3 adapter, or local `public/uploads` writer in the deployed environment.

Local filesystem, database bytea/base64 blobs, and unauthenticated public writes are not production-safe for this product.

SVG clinic marks are professionally common. A blanket “SVG not accepted” rule is too strict, but uploaded SVG markup must never be trusted or inlined.

## Decision

Phase 2A.4 **completes the application boundary** and still **does not provision** production storage.

- Keep `ClinicProfile.logoUrl` and `toSafeLogoSrc`.
- Keep `ClinicAssetStorage` with a Supabase adapter. Add `readLogo` so the app can stream private objects on a same-origin route.
- Accept PNG, JPEG, WebP (2 MB) and SVG (1 MB). Sanitize SVG on the server with JSDOM + DOMPurify before storage. Render only as `<img>`.
- Practice settings show the current mark plus Upload / Replace / Remove when the driver is configured. When it is not, show an infrastructure-unavailable state derived from configuration — not “coming before launch”.
- Production still depends on a private `clinic-branding` bucket, service-role credentials, and `CLINIC_ASSET_STORAGE_DRIVER=supabase`. See [../architecture/CLINIC-ASSETS.md](../architecture/CLINIC-ASSETS.md).

Do not ship a fake filesystem upload. Do not execute the provisioning script against production from Cursor.

## Consequences

- Demo logo `/demo/riverside-mark.svg` continues to work.
- Launch checklist must include object storage before clinic-uploaded logos work in production.
- Arbitrary CSS, HTML, remote stylesheet URLs, and inline SVG injection remain forbidden.
- A `memory` driver exists for tests only.
