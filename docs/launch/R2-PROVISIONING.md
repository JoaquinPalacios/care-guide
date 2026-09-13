# R2 provisioning — clinic branding assets

Manual runbook for Joaquín. Cursor / CI must **not** execute these steps, log into Cloudflare, create buckets or tokens, change DNS, or write production secrets.

Production clinic-asset provider: **Cloudflare R2**. Application runtime stays on **Vercel**. See [../architecture/CLINIC-ASSETS.md](../architecture/CLINIC-ASSETS.md) and [ADR 0022](../adr/0022-cloudflare-r2-is-clinic-asset-provider.md).

Do not put credentials in the repository.

## 1. Cloudflare account / project prerequisites

1. Use the River Aftercare Cloudflare account that will also hold authoritative DNS (when the production domain exists).
2. Confirm you can open **R2** in the dashboard.
3. The production hostname is **not** acquired yet. Plan the asset host as `assets.<platform-domain>` and keep that string out of application code. The app reads `CLINIC_ASSET_PUBLIC_ORIGIN`.
4. Next.js stays on Vercel. R2 is object storage + public asset CDN, not the app host.

## 2. Create the R2 bucket

1. R2 → **Create bucket**.
2. Recommended name: `clinic-branding-assets` (must match `R2_BUCKET`).
3. Location: choose the jurisdiction/region appropriate for the practice data residency decision. Default to the account’s primary R2 location if none is set yet.
4. This bucket is **public-asset-only** clinic branding (logos / future small brand marks). Do **not** store private documents, patient files, or backups here.
5. Do **not** enable a general bucket listing/index. Objects are reachable only by exact key.
6. Leave the bucket without a public `r2.dev` browsing index if the dashboard offers to disable it. Production reads go through the custom domain.

## 3. Create a scoped R2 API token

1. R2 → **Manage R2 API Tokens** (or account API tokens with R2 object permissions).
2. Create a token for the application server only.
3. Restrict the token to **this bucket** when Cloudflare offers bucket scoping.

## 4. Least privileges

The application needs object **read, write, and delete** on `clinic-branding-assets` only:

| Permission                      | Needed | Why                                       |
| ------------------------------- | ------ | ----------------------------------------- |
| Object Read                     | Yes    | Optional same-origin fallback `GetObject` |
| Object Write                    | Yes    | `PutObject` for ADMIN uploads             |
| Object Delete                   | Yes    | Best-effort delete on replace/remove      |
| Admin Read / Admin Read & Write | **No** | Would allow account-wide bucket admin     |
| Account-level Cloudflare admin  | **No** | Far too broad                             |

Do not grant account-wide R2 admin. Do not reuse this token for DNS, Workers, or other Cloudflare APIs.

Save:

- Access Key ID → `R2_ACCESS_KEY_ID`
- Secret Access Key → `R2_SECRET_ACCESS_KEY`
- Account ID → `R2_ACCOUNT_ID`

## 5. Custom domain `assets.<platform-domain>`

1. After the platform domain exists and Cloudflare is authoritative DNS:
   - Create a hostname `assets.<platform-domain>`.
   - In the R2 bucket, **Connect custom domain** → `assets.<platform-domain>`.
2. Do not hard-code the final domain in the app. Set:

   `CLINIC_ASSET_PUBLIC_ORIGIN=https://assets.<platform-domain>`

3. Public read is by object key only:

   `https://assets.<platform-domain>/clinics/<clinicId>/branding/<uuid>.<ext>`

4. Optional later (not required, **no Worker**): a Response Header Transform Rule on that hostname adding `X-Content-Type-Options: nosniff`. R2 already returns `Content-Type` and `Cache-Control` from object metadata.
5. CSP is not required for launch: SVG is sanitized and loaded only as `<img>`.

## 6. Application environment variables

Set on the **Vercel project / server** only (Production, and Preview if you want uploads there). Never `NEXT_PUBLIC_` for R2 credentials.

```bash
CLINIC_ASSET_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=
R2_BUCKET=clinic-branding-assets
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
CLINIC_ASSET_PUBLIC_ORIGIN=https://assets.<platform-domain>
```

Optional:

```bash
# Only if you need a jurisdiction endpoint such as
# https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com
R2_S3_ENDPOINT=
```

When `R2_S3_ENDPOINT` is unset, the app derives `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.

Redeploy after setting env so server processes see the values. Practice Upload / Replace / Remove appear only when this driver is configured.

## 7. Verify upload

1. Sign in as a clinic **ADMIN** (not STAFF).
2. Practice → Identity → choose a PNG/JPEG/WebP (≤2 MB) or SVG (≤1 MB) → **Upload logo**.
3. Confirm the UI shows **Uploaded** and a preview `<img>`.
4. Confirm `ClinicProfile.logoUrl` is a key `clinics/<clinicId>/branding/<uuid>.<ext>`, not a Cloudflare URL.

## 8. Verify public read

1. Open the patient tenant homepage and a published guide.
2. The clinic mark must load from `CLINIC_ASSET_PUBLIC_ORIGIN` + key.
3. `curl -I` the object URL: HTTP 200, expected `Content-Type`.
4. Confirm a guessed directory URL does **not** list the bucket.

## 9. Verify cache headers

```bash
curl -sI "https://assets.<platform-domain>/clinics/<clinicId>/branding/<uuid>.png"
```

Expect:

```text
content-type: image/png
cache-control: public, max-age=31536000, immutable
```

Use GET in a browser if a HEAD request reports misleading CDN cache status.

## 10. Verify SVG

1. Upload a simple logo SVG.
2. Confirm it renders as `<img>`, not inline markup.
3. Confirm a hostile SVG (`<script>`, `onload`, `foreignObject`, `javascript:` href) is rejected or stripped by the server and never stored with active content.
4. Confirm `content-type: image/svg+xml`.

## 11. Verify replacement and deletion

1. **Replace:** upload a second file. The preview updates. The old key should be deleted from R2 (best-effort). A leftover old object is acceptable if delete fails; the clinic must still see the new logo.
2. **Remove:** ADMIN removes the logo. Patient UI falls back to the display name. No broken `<img>`.

## 12. Rollback

Application rollback (no Cloudflare teardown required):

1. On Vercel, unset `CLINIC_ASSET_STORAGE_DRIVER` (or set it away from `r2`) and redeploy.
2. Practice shows the storage-unavailable copy. Existing `logoUrl` keys will not resolve until origin+driver are restored; demo paths still work.
3. To restore service, put the same env back. Keys in the database remain valid because they are not provider URLs.

Infrastructure rollback:

1. Disconnect the custom domain from the bucket if the hostname must go away.
2. Revoke the R2 API token.
3. Do not delete the bucket until you accept losing uploaded logos. Prefer token revoke + env unset.

## Local development

- Automated tests: `CLINIC_ASSET_STORAGE_DRIVER=memory` (Playwright webServer and Vitest). Never hits Cloudflare.
- Manual real-R2: optional development bucket + the same env names. Do not commit values.
- Do not require MinIO or a local filesystem fake of production.

## Storage class

`clinic-branding-assets` = **PUBLIC-ASSET-ONLY**. Future private assets use a separate bucket and token.
