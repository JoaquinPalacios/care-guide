# Clinic logo object storage

Practice identity stores `ClinicProfile.logoUrl` as a **provider-independent reference**:

- Demo / static marks: a same-origin path such as `/demo/riverside-mark.svg`
- Uploaded marks: an immutable object key `clinics/<clinicId>/branding/<uuid>.<ext>`

The patient renderer resolves that reference with `resolveClinicLogoSrc` and always renders the mark as `<img src="...">`. Uploaded SVG is never inlined, never passed to `dangerouslySetInnerHTML`, and never mounted via `object`/`embed`.

## Current status

**Application support for Cloudflare R2 is complete. Production delivery still requires Joaquín to provision the bucket, API token, custom domain, and env vars.** This repository does not create Cloudflare resources.

The repository now has:

- `ClinicAssetStorage` (`uploadLogo`, `deleteLogo`, `readLogo`, `getPublicLogoUrl`)
- `R2ClinicAssetStorage` adapter (`@aws-sdk/client-s3`, server-only, S3-compatible R2 API)
- In-memory driver for automated tests only (`CLINIC_ASSET_STORAGE_DRIVER=memory`) — not a filesystem and not for production
- Validation: PNG / JPEG / WebP (2 MB) and SVG (1 MB); MIME, extension, and magic/markup checked independently
- Server-only SVG sanitization (`jsdom` XML parse + DOMPurify SVG profile)
- ADMIN-only, same-clinic mutation (`uploadClinicLogo` / `removeClinicLogo`)
- Same-origin GET `/clinic-branding/<clinicId>/<filename>` as the **test / unconfigured-origin** fallback
- Production public URLs: `CLINIC_ASSET_PUBLIC_ORIGIN` + object key (target `https://assets.<platform-domain>/clinics/...`)
- Practice UI: current logo, Upload / Replace / Remove when storage is configured; explicit infrastructure-unavailable copy when it is not

Do not claim production clinics can upload logos until the R2 bucket and `assets.<domain>` hostname exist in the deployed environment. Derive availability from the storage driver.

Cursor / CI must not provision Cloudflare. Joaquín follows [../launch/R2-PROVISIONING.md](../launch/R2-PROVISIONING.md).

## Secure SVG contract

Accepted clinic logos:

| Kind            | Max size | Notes                                                               |
| --------------- | -------- | ------------------------------------------------------------------- |
| PNG, JPEG, WebP | 2 MB     | Magic bytes must match MIME and extension                           |
| SVG             | 1 MB     | Well-formed XML, sensible `viewBox` or width/height, then sanitized |

SVG rejection / removal includes at least:

- `<script>` and other active HTML
- event attributes (`onload`, `onclick`, …)
- `<foreignObject>`
- `javascript:` / `data:` / `vbscript:` URLs
- external `href` / `xlink:href` / HTTP(S) resources
- unsafe CSS `url()`
- DTD/ENTITY payloads and non-XML processing instructions

Sanitization is **server-only**. Regex is not the security boundary. The stored object is a generated `*.svg` with `Content-Type: image/svg+xml`. Clients render it as an image.

## Production provider

**Cloudflare R2** is River Aftercare’s production clinic-asset provider.

Rationale:

- Extremely low storage cost
- No egress fee from R2
- S3-compatible portability via `@aws-sdk/client-s3`
- Custom asset domain (`assets.<platform-domain>`)
- Bounded public-asset domain, separate from the Vercel application origin
- Avoids coupling clinic logos to Vercel Blob or Supabase Storage

Cloudflare DNS / R2 is **not** the application runtime. Next.js remains on Vercel. Parked chairside **Supabase Realtime** is unrelated and stays in the repo.

Do not use Vercel Blob, the local filesystem, or `public/uploads`. The previous Supabase Storage clinic-asset adapter is removed.

The `memory` driver exists so unit and Playwright tests can exercise upload/replace/remove without Cloudflare. It is not a production fallback. Optional real-R2 credentials may be pointed at a development bucket for manual checks. MinIO / Docker S3 are not required.

## Required provisioning (human / infra)

See the runbook: [../launch/R2-PROVISIONING.md](../launch/R2-PROVISIONING.md).

Server-only env (never `NEXT_PUBLIC_`):

```bash
CLINIC_ASSET_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_BUCKET=<clinic-branding-assets>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
CLINIC_ASSET_PUBLIC_ORIGIN=https://assets.<platform-domain>
# Optional. When unset, derived as https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
# R2_S3_ENDPOINT=
```

`CLINIC_ASSET_PUBLIC_ORIGIN` is used when the server renders `<img src>`. It is not a credential. Do not prefix R2 keys with `NEXT_PUBLIC_`.

After env is set, Practice Upload / Replace / Remove become live for clinic ADMIN. STAFF remains forbidden (Practice returns 404; mutations also reject).

## Key and URL contract

| Stored `ClinicProfile.logoUrl`            | Resolved `img src` (production)                                   | Test / no origin                          |
| ----------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| `clinics/<clinicId>/branding/<uuid>.webp` | `https://assets.<domain>/clinics/<clinicId>/branding/<uuid>.webp` | `/clinic-branding/<clinicId>/<uuid>.webp` |
| `clinics/<clinicId>/branding/<uuid>.svg`  | `https://assets.<domain>/clinics/<clinicId>/branding/<uuid>.svg`  | `/clinic-branding/<clinicId>/<uuid>.svg`  |
| `/demo/riverside-mark.svg`                | `/demo/riverside-mark.svg`                                        | same                                      |

Never trust original filenames. Never store Cloudflare, R2.dev, or other provider URLs in `ClinicProfile.logoUrl`. Resolve through `clinicAssetPublicUrl` / `resolveClinicLogoSrc` only.

No schema migration: the existing `logoUrl` column already stored provider-independent paths, not full Supabase URLs. Uploaded values now store the object key instead of the same-origin proxy path so production can serve from the asset domain without rewriting the database when the hostname changes.

Replace uploads write a new object, then update Prisma, then delete the previous **clinic branding** key only. Demo paths such as `/demo/riverside-mark.svg` are never deleted from object storage.

If the new object uploads but the database update fails, the application attempts to delete the new orphan and shows a safe error. If the database update succeeds but the old-object delete fails, the clinic sees success and the failure is logged for later cleanup.

## Object metadata

R2 `PutObject` sets:

- `Content-Type`: `image/png`, `image/jpeg`, `image/webp`, or `image/svg+xml`
- `Cache-Control`: `public, max-age=31536000, immutable`

Keys are new UUIDs on every upload. Do not overwrite the same key.

## Public delivery and headers

Production logos are **intentionally public** clinic-branding assets. Knowing the object key is enough to fetch the image. Do not store private documents in this bucket. Do not enable a bucket listing/index.

R2 object metadata preserves `Content-Type` and `Cache-Control` on custom-domain GET. Custom headers such as `X-Content-Type-Options: nosniff` are **not** stored as R2 object metadata. A Cloudflare Worker is **not** required. If Joaquín wants `nosniff` later, a zone Response Header Transform Rule on `assets.<domain>` can add it without a Worker. CSP is not materially necessary: SVG is sanitized, loaded only through `<img>`, and never inlined.

The `/clinic-branding/...` route remains for the memory driver and still sets `nosniff` + a restrictive CSP for that fallback path.

## Authorization

Logo mutation requires authenticated clinic **ADMIN**, clinic membership, and `targetClinicId === authenticated clinic`. STAFF cannot upload, replace, or remove. OPERATOR remains a separate surface. Do not trust a client-supplied clinic id; server actions use `requireClinicAdmin()` membership.
