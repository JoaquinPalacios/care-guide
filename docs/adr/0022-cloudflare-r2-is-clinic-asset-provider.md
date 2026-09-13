# ADR 0022 — Cloudflare R2 is the production clinic asset provider

- **Status:** Accepted
- **Date:** 2026-09-13
- **PRD:** [../product/PRD.md](../product/PRD.md) §10.2
- **Supersedes provider choice in:** [0019](0019-clinic-logo-upload-requires-object-storage.md)

## Context

Phase 2A.4 completed the application boundary for clinic logos (ADMIN upload, validation, SVG sanitization, `<img>` rendering) behind `ClinicAssetStorage`. The provisional production adapter was Supabase Storage because the repo already used `@supabase/supabase-js` for parked chairside Realtime.

Supabase Realtime is not a Storage bucket. Binding clinic branding to Supabase mixed a parked chairside dependency with a launch-critical public-asset path, and same-origin proxying through Next.js would put logo bytes on the Vercel origin.

River Aftercare already listed R2 as a production-readiness gate. Logos are small (≤2 MB), public, cacheable, and few per clinic.

## Decision

- **Cloudflare R2** is the production clinic-asset provider for clinic logos and future small clinic brand marks (isologo / similar).
- Talk to R2 with the latest stable `@aws-sdk/client-s3` from the **Next.js server only**. No browser SDK. No presigned browser upload for launch: files are small and must be validated/sanitized on the server.
- Store a provider-independent **object key** in `ClinicProfile.logoUrl`. Resolve `img src` at runtime from `CLINIC_ASSET_PUBLIC_ORIGIN` + key.
- Use immutable keys `clinics/<clinicId>/branding/<uuid>.<ext>`.
- Keep the in-memory driver for automated tests. Do not introduce MinIO, Docker S3, or a fake filesystem production path.
- Do not provision Cloudflare, DNS, or Vercel env from application PRs. Joaquín follows [../launch/R2-PROVISIONING.md](../launch/R2-PROVISIONING.md).
- Leave parked chairside Supabase Realtime code in place.

Cloudflare DNS / R2 ≠ application runtime. Next.js remains on Vercel.

## Consequences

- Production logo upload stays dark until the R2 bucket, scoped token, `assets.<domain>`, and server env exist.
- Demo `/demo/riverside-mark.svg` continues to work without R2.
- SVG remains sanitized on the server and rendered only as `<img>`.
- A Cloudflare Worker is not required for launch headers. `Cache-Control` and `Content-Type` are set on `PutObject`. Optional `X-Content-Type-Options: nosniff` can be a Transform Rule later.
- This bucket is public-asset-only. Future private documents need a separate bucket and policy.

## Notes for later implementation

- Do not grant account-wide R2 admin tokens.
- Do not put private clinical documents in the branding bucket.
- Do not add a Worker solely to set headers unless a concrete browser bug requires it.
