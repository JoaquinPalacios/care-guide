# Clinic logo object storage

Practice identity already stores `ClinicProfile.logoUrl` as a **same-origin** path. The patient renderer keeps using `toSafeLogoSrc` (PNG, JPEG, WebP, SVG paths; no remote URLs, `data:`, or traversal).

## Current status

**Logo upload is blocked by external storage provisioning.**

The repository has:

- `ClinicAssetStorage` (`uploadLogo`, `deleteLogo`, `getPublicLogoUrl`)
- `SupabaseClinicAssetStorage` adapter
- PNG / JPEG / WebP validation (MIME, 2 MB max, magic bytes; **no SVG**)
- ADMIN-only, same-clinic authorization helper
- Practice UI: current logo preview + explicit unavailable copy
- **No** file input, **no** `public/uploads`, **no** local filesystem, **no** base64 blobs

Do not claim upload is production-ready until the bucket below exists and is wired in the deployed environment.

## Preferred driver

Supabase Storage, because the repo already uses `@supabase/supabase-js` for parked chairside Realtime. Realtime credentials are **not** a provisioned Storage bucket. Do not turn Realtime on merely to store logos.

Do not use Vercel Blob or S3 unless a later infrastructure decision replaces this note.

## Required provisioning (human / infra)

1. Create or reuse a production Supabase project (not from this Cursor task).
2. Create a private bucket named `clinic-branding` (or set `CLINIC_ASSET_STORAGE_BUCKET`).
3. Deny public writes. Reads should be server-side only; the app will expose a same-origin path.
4. Set:

```bash
CLINIC_ASSET_STORAGE_DRIVER=supabase
CLINIC_ASSET_STORAGE_BUCKET=clinic-branding
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only>
```

5. Then implement the remaining production path: authenticated ADMIN upload/replace/remove Server Action, generated keys `clinics/<clinicId>/branding/<id>.<ext>`, Prisma `logoUrl` as `/clinic-branding/<clinicId>/<id>.<ext>`, and a same-origin GET that streams the object. Patient pages must keep using `toSafeLogoSrc`.

## Key and URL contract

| Storage key                             | Same-origin public path                 |
| --------------------------------------- | --------------------------------------- |
| `clinics/<clinicId>/branding/<id>.webp` | `/clinic-branding/<clinicId>/<id>.webp` |

Never trust original filenames. Never store remote Supabase URLs in `ClinicProfile.logoUrl`.

## Authorization

Logo mutation requires authenticated clinic **ADMIN**, clinic membership, and `targetClinicId === authenticated clinic`. STAFF cannot upload, replace, or remove. OPERATOR remains a separate surface.
