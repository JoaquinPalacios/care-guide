# ADR 0019 — Clinic logo upload waits for production object storage

- **Status:** Accepted
- **Date:** 2026-09-11
- **PRD:** [../product/PRD.md](../product/PRD.md) §10.2

## Context

`ClinicProfile.logoUrl` already stores a same-origin image path. The patient renderer sanitizes it with `toSafeLogoSrc` (PNG, JPEG, WebP, SVG paths; no remote URLs, `data:`, or traversal).

Clinics should eventually upload a logo. The repository’s Supabase client is used for **Realtime only** (parked chairside). There is no Storage bucket, Vercel Blob, S3 adapter, or authenticated upload route.

Local filesystem (`public/uploads`), database bytea/base64 blobs, and unauthenticated public writes are not production-safe for this product.

## Decision

Phase 2A does **not** implement logo upload.

- Keep `ClinicProfile.logoUrl` and the current sanitizer.
- Practice settings expose the current path and preview.
- Real upload is a pre-launch infrastructure dependency: provision production object storage, then add a server-validated upload for PNG/JPEG/WebP (no SVG initially), ~2 MB, generated object keys, clinic-owned paths.

Do not ship a fake production upload.

## Consequences

- Demo logo `/demo/riverside-mark.svg` continues to work.
- Launch checklist must include object storage before clinic-uploaded logos.
- Arbitrary CSS, HTML, and remote stylesheet URLs remain forbidden.
