# Clinic logo object storage

Practice identity stores `ClinicProfile.logoUrl` as a **same-origin** path. The patient renderer keeps using `toSafeLogoSrc` (PNG, JPEG, WebP, SVG paths; no remote URLs, `data:`, or traversal) and always renders the mark as `<img src="...">`. Uploaded SVG is never inlined, never passed to `dangerouslySetInnerHTML`, and never mounted via `object`/`embed`.

## Current status (Phase 2A.4)

**Application upload is complete. Production delivery still requires an external Storage bucket.**

The repository now has:

- `ClinicAssetStorage` (`uploadLogo`, `deleteLogo`, `readLogo`, `getPublicLogoUrl`)
- `SupabaseClinicAssetStorage` adapter (service-role, private bucket)
- In-memory driver for automated tests only (`CLINIC_ASSET_STORAGE_DRIVER=memory`) — not a filesystem and not for production
- Validation: PNG / JPEG / WebP (2 MB) and SVG (1 MB); MIME, extension, and magic/markup checked independently
- Server-only SVG sanitization (`jsdom` XML parse + DOMPurify SVG profile)
- ADMIN-only, same-clinic mutation (`uploadClinicLogo` / `removeClinicLogo`)
- Same-origin GET `/clinic-branding/<clinicId>/<filename>` with `X-Content-Type-Options: nosniff` and a restrictive CSP
- Practice UI: current logo, Upload / Replace / Remove when storage is configured; explicit infrastructure-unavailable copy when it is not

Do not claim production clinics can upload logos until the bucket below exists in the deployed environment. Do not tell a production clinic the feature is “coming before launch” — derive availability from the storage driver.

Cursor / CI must not provision the bucket. Joaquín (or infra) runs [../../scripts/provision-clinic-branding-bucket.mjs](../../scripts/provision-clinic-branding-bucket.mjs) against the target Supabase project.

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

## Preferred driver

Supabase Storage, because the repo already uses `@supabase/supabase-js` for parked chairside Realtime. Realtime credentials are **not** a provisioned Storage bucket. Do not turn Realtime on merely to store logos.

Do not use Vercel Blob, S3, or `public/uploads` unless a later infrastructure decision replaces this note.

The `memory` driver exists so unit tests can exercise upload/replace/remove without a bucket. It is not a production fallback.

## Required provisioning (human / infra)

1. Create or reuse a production Supabase project (not from this Cursor task).
2. Create a **private** bucket named `clinic-branding` (or set `CLINIC_ASSET_STORAGE_BUCKET`). Public anonymous reads and writes must be denied. The Next.js server reads objects with the **service role** key and exposes them on a same-origin path.
3. Set, on the application server only:

```bash
CLINIC_ASSET_STORAGE_DRIVER=supabase
CLINIC_ASSET_STORAGE_BUCKET=clinic-branding
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only>
```

4. Do not prefix the service role key with `NEXT_PUBLIC_`.
5. After env is set, Practice Upload / Replace / Remove become live for clinic ADMIN. STAFF remains forbidden.

Declarative helper (does not run in CI; pass credentials locally):

```bash
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<server-only> \
node scripts/provision-clinic-branding-bucket.mjs
```

## Key and URL contract

| Storage key                               | Same-origin public path                   |
| ----------------------------------------- | ----------------------------------------- |
| `clinics/<clinicId>/branding/<uuid>.webp` | `/clinic-branding/<clinicId>/<uuid>.webp` |
| `clinics/<clinicId>/branding/<uuid>.svg`  | `/clinic-branding/<clinicId>/<uuid>.svg`  |

Never trust original filenames. Never store remote Supabase URLs in `ClinicProfile.logoUrl`.

Replace uploads write a new object, then update Prisma, then delete the previous **clinic-branding** key only. Demo paths such as `/demo/riverside-mark.svg` are never deleted from object storage.

## Application delivery

`GET /clinic-branding/[clinicId]/[filename]`:

- Resolves the generated storage key
- Streams bytes from the configured driver
- Sets `Content-Type` from the extension (`image/svg+xml; charset=utf-8` for SVG)
- Sets `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`, `Cross-Origin-Resource-Policy: same-origin`, and `Content-Security-Policy: default-src 'none'; sandbox`

The hostname proxy already lets `*.svg|png|jpg|jpeg|webp` through on tenant hosts so the patient renderer can load the same-origin mark.

## Authorization

Logo mutation requires authenticated clinic **ADMIN**, clinic membership, and `targetClinicId === authenticated clinic`. STAFF cannot upload, replace, or remove. OPERATOR remains a separate surface.
