# ADR 0019 — Clinic logo upload waits for production object storage

- **Status:** Accepted
- **Date:** 2026-09-11
- **Updated:** 2026-09-11 (Phase 2A.3 storage boundary)
- **PRD:** [../product/PRD.md](../product/PRD.md) §10.2

## Context

`ClinicProfile.logoUrl` already stores a same-origin image path. The patient renderer sanitizes it with `toSafeLogoSrc` (PNG, JPEG, WebP, SVG paths; no remote URLs, `data:`, or traversal).

Clinics should upload a logo themselves before launch. The repository’s Supabase client is used for **Realtime only** (parked chairside) unless a Storage bucket is provisioned. There is no Vercel Blob, S3 adapter, or authenticated upload route in the deployed environment.

Local filesystem (`public/uploads`), database bytea/base64 blobs, and unauthenticated public writes are not production-safe for this product.

## Decision

Phase 2A.3 does **not** enable production logo upload.

- Keep `ClinicProfile.logoUrl` and the current sanitizer.
- Keep a `ClinicAssetStorage` interface and `SupabaseClinicAssetStorage` adapter for the day a bucket exists.
- Practice settings show the current mark and an explicit unavailable state. There is no file input while storage is unconfigured.
- Real upload remains a pre-launch infrastructure dependency: provision a `clinic-branding` bucket, then add a server-validated upload for PNG/JPEG/WebP (no SVG), ~2 MB, generated object keys, clinic-owned paths, ADMIN-only.

Do not ship a fake production upload.

## Consequences

- Demo logo `/demo/riverside-mark.svg` continues to work.
- Launch checklist must include object storage before clinic-uploaded logos.
- Arbitrary CSS, HTML, and remote stylesheet URLs remain forbidden.
- Provisioning steps live in [../architecture/CLINIC-ASSETS.md](../architecture/CLINIC-ASSETS.md).
