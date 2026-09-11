#!/usr/bin/env node
/**
 * Declarative helper to create the private clinic-branding Supabase Storage
 * bucket. Cursor / CI must not run this against production.
 *
 * Joaquín (or infra) runs it later with project credentials:
 *
 *   SUPABASE_URL=https://<project>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<server-only> \
 *   node scripts/provision-clinic-branding-bucket.mjs
 *
 * Optional:
 *   CLINIC_ASSET_STORAGE_BUCKET=clinic-branding
 *
 * The application still needs:
 *   CLINIC_ASSET_STORAGE_DRIVER=supabase
 *   CLINIC_ASSET_STORAGE_BUCKET=clinic-branding
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Bucket policy:
 *   - private (not a public bucket)
 *   - no anonymous reads/writes
 *   - Next.js reads/writes with the service role
 *   - patients fetch logos from GET /clinic-branding/<clinicId>/<filename>
 *   - object keys: clinics/<clinicId>/branding/<uuid>.<ext>
 */

const url = (
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  ""
)
  .trim()
  .replace(/\/$/, "");
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
const bucket =
  (process.env.CLINIC_ASSET_STORAGE_BUCKET ?? "clinic-branding").trim() ||
  "clinic-branding";

if (!url || !serviceRoleKey) {
  console.error(
    "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const endpoint = `${url}/storage/v1/bucket`;
const body = {
  id: bucket,
  name: bucket,
  public: false,
  file_size_limit: 2 * 1024 * 1024,
  allowed_mime_types: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
  ],
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const payload = await response.text();

if (response.ok) {
  console.log(`Created private bucket "${bucket}".`);
  process.exit(0);
}

if (response.status === 409 || /already exists/i.test(payload)) {
  console.log(`Bucket "${bucket}" already exists. Leaving it unchanged.`);
  process.exit(0);
}

console.error(`Could not create bucket "${bucket}": ${response.status}`);
console.error(payload);
process.exit(1);
