# Working memory — Care Guide aftercare reset

This file helps later implementation sessions. It is **not** the product contract.

Authoritative requirements: [PRD.md](PRD.md)  
Decisions: [../adr/README.md](../adr/README.md)

Last updated: 2026-08-31 (Phase 1B.5 patient styling + performance foundation)

---

## Product direction vs current implementation

|                                |                                                                                                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product direction**          | B2B aftercare SaaS: branded tenant hostnames, canonical guide library, practice enablement/overrides, durable URLs + QR, mobile-first anonymous patient pages, operator admin, basic anonymous analytics |
| **Current implementation**     | Staff auth + parked chairside sessions + Phase 1A aftercare data/domain + Phase 1B tenant hostname routing + **Phase 1B.5 patient styling/performance foundation** (no Phase 1C patient UI yet)          |
| **Aftercare MVP implemented?** | **No** — Phase 1A + 1B + 1B.5 only                                                                                                                                                                       |

Do not claim branded patient aftercare UI, QR codes, or operator aftercare admin exist until they are built. Hostname routing (Phase 1B) is implemented. Phase 1B.5 proves CSS isolation and server theme tokens; the tenant pages are still a routing/styling boundary, not the product UI.

---

## Phase 1A (implemented)

Data/domain foundation. Patient UI is not in 1A.

| Area                   | Location                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema / migration     | `prisma/schema.prisma`, `prisma/migrations/20260831120000_add_aftercare_phase_1a_domain`                                                                                                       |
| Composition            | `lib/aftercare/compose-guide-document.ts` (pure; no Prisma)                                                                                                                                    |
| Slug validation        | `lib/aftercare/slug.ts` — `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 3–32 chars                                                                                                                             |
| Public loaders         | `getClinicBySlug`, `getPublishedPracticeGuide`, `listPublishedPracticeGuides`                                                                                                                  |
| Publication predicates | `lib/aftercare/public-practice-guide-predicates.ts`                                                                                                                                            |
| Pin integrity          | Composite FK `PracticeGuide(pinnedRevisionId, guideTemplateId)` → `GuideTemplateRevision(id, guideTemplateId)` — [ADR 0010](../adr/0010-practice-guides-explicitly-pin-canonical-revisions.md) |

Public loaders require **all** of: `isEnabled === true`, `PracticeGuide.status === PUBLISHED`, `pinnedRevision.status === PUBLISHED`, clinic scope. No auth. No `ProcedureSession`.

`Clinic.slug` is unique and required. Existing rows were backfilled (demo clinic → `demodental`; other rows → `clinic-` + md5 prefix). Format CHECK is in the migration.

Caching: no `cacheComponents`, no `cacheTag()`. Request-level `React.cache()` was not added in 1A.

---

## Phase 1B (implemented)

Hostname tenant resolution. No branded patient UI.

| Area            | Location                                                                          |
| --------------- | --------------------------------------------------------------------------------- |
| Root domain     | `CARE_GUIDE_ROOT_DOMAIN` (`lib/tenancy/root-domain.ts`)                           |
| Parser          | `lib/tenancy/parse-hostname.ts` — apex/app staff, reserved, tenant, invalid       |
| Reserved labels | `lib/tenancy/reserved-slugs.ts`                                                   |
| Proxy           | `proxy.ts` — rewrite only; no Prisma/auth/tenant-existence lookup                 |
| Internal routes | `app/%5Fsites/[tenant]/**` (URL `/_sites/<slug>/…`, blocked from the public Host) |
| Tenant check    | `requireTenantClinic` → `getClinicBySlug` → `notFound()`                          |

Local URLs: `localhost:3000` and `app.localhost:3000` stay staff/parked. `demodental.localhost:3000` rewrites internally. `unknown.localhost:3000` is a generic 404. Tenant hosts block `/login`, `/dashboard`, `/sessions`, `/session`, `/display`, `/api/auth`. Direct `/_sites` is 404.

Internal aftercare files now live at `app/(aftercare)/%5Fsites/[tenant]`. Public rewrite target remains `/_sites/<slug>/…`.

---

## Phase 1B.5 (implemented)

Patient styling + performance foundation. No Phase 1C product UI.

| Area              | Location                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Staff root        | `app/(staff)/layout.tsx` + `staff.css` (Tailwind)                                         |
| Aftercare root    | `app/(aftercare)/layout.tsx` + `aftercare.css` (no Tailwind)                              |
| Theme resolver    | `lib/branding/aftercare-theme.ts` — hex-only, contrast fallback, semantic `--cg-*` tokens |
| CSS Module proof  | `app/(aftercare)/practice-brand-proof.tsx`                                                |
| Performance notes | [../architecture/PERFORMANCE.md](../architecture/PERFORMANCE.md)                          |
| Styling ADR       | [ADR 0011](../adr/0011-patient-styling-uses-css-modules-and-semantic-runtime-tokens.md)   |

Tenant branding is server-rendered CSS variables. No client ThemeProvider. No arbitrary ClinicProfile CSS fields.

---

## Do not do (until a later explicit task)

- Phase 1C patient-facing aftercare pages or branding components beyond the 1B.5 proof header
- Enable `cacheComponents: true`
- Delete or refactor parked chairside functionality
- Depend aftercare on `ProcedureSession`
- Reuse `ProcedureTemplate` as the aftercare Guide Template
- Use real Pacific Dental brand assets
- Author scraped/clinically authoritative copy from random websites
- Parent-domain auth cookies (`Domain=.localhost`)

---

## Reusable foundation

- Next.js App Router, React, Tailwind (staff only), CSS Modules (patient), PostgreSQL, Prisma
- `Clinic` (`id`, `name`, **`slug`**), `User`, `ClinicMembership`, **`ClinicProfile`**
- Staff auth: `auth.ts`, `lib/auth/*`, `/login`, `/dashboard` layout guard `requireStaffSession()`
- Clinic-scoped query patterns (membership-derived clinic id)
- Aftercare domain: `GuideTemplate` → `GuideTemplateRevision` → `GuideTemplateSection`; `PracticeGuide` + override/addition
- Tenancy: `lib/tenancy/*`, `proxy.ts`, `app/(aftercare)/%5Fsites/[tenant]`
- Patient theme: `lib/branding/aftercare-theme.ts`

---

## Parked chairside map (do not extend for aftercare)

| Area            | Location                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema          | `prisma/schema.prisma` — `ProcedureTemplate`, stages, rooms, doctors, `ProcedureSession`, display prefs, overrides, transitions                 |
| Seed            | `prisma/seed.mjs` — Rivers Care Demo Clinic; starter walkthrough + scaling & root planing chairside templates; optional external `aftercareUrl` |
| Create session  | `app/sessions/new/*`, `lib/sessions/create-procedure-session.ts`                                                                                |
| Control         | `app/session/[id]/control/*`, `lib/sessions/move-procedure-session-stage.ts`, `complete-procedure-session.ts`                                   |
| Patient display | `app/display/[token]/*`, `lib/sessions/load-patient-display.ts`                                                                                 |
| Realtime        | `lib/realtime/*` (Supabase; optional in local `.env.example`)                                                                                   |
| Staff dashboard | `app/dashboard/page.tsx` (in-progress sessions), `app/dashboard/procedures/page.tsx` (read-only chairside templates)                            |

Completed sessions may show an external `ProcedureTemplate.aftercareUrl`. That is **not** the aftercare product.

---

## Demo data

Seeded fictional clinic: **Rivers Care Demo Clinic** (`clinic_demo_rivers`).

- Tenant slug: `demodental`
- Patient-facing profile name: **Riverside Dental Demo**
- Admin: `admin@care-guide.test`
- Staff: `staff@care-guide.test`
- Shared demo password: `CareGuideDemo123!`

Aftercare seed (Phase 1A):

- Canonical template **Tooth Extraction** (`extraction`, specialty `DENTAL`)
- Published revision v1 with ordered demo sections (explicitly labelled non-clinical)
- Published/enabled PracticeGuide pinned to that revision
- One practice override (`first-24-hours`) and one addition (`weekend-contact` after `contact-practice`)

Pacific Dental appears in the PRD only as a **conceptual** hostname example (`pacificdental.<platform-domain>`).

---

## Phase 1 remainder (not started)

**1C+** — patient UI, revalidation, remaining vertical-slice surfaces.

Phase 1 is a technical vertical slice, not commercial MVP. Commercial MVP is after Phase 3 (see PRD §19 and §22).

---

## Tooling debt

TypeScript is `7.0.2`. Current `typescript-eslint` stable releases do not yet support TypeScript 7 (`ts.Extension` was removed from the compiler API).

Current bridge:

- ESLint 10
- `@next/eslint-plugin-next`
- Babel TypeScript parser (`@babel/eslint-parser`)

This temporarily means we do not have the same TypeScript-aware ESLint rule coverage.

**TODO:** Re-evaluate typescript-eslint on each dependency refresh and restore it once stable TypeScript 7 support is released. Do not install unsupported or canary typescript-eslint merely to regain those rules.

---

## Documentation files

| File                               | Role                                           |
| ---------------------------------- | ---------------------------------------------- |
| `docs/README.md`                   | Docs index                                     |
| `docs/product/PRD.md`              | PRD v1.0                                       |
| `docs/product/WORKING-MEMORY.md`   | This file                                      |
| `docs/adr/*.md`                    | Architecture decisions 0001–0011               |
| `docs/architecture/PERFORMANCE.md` | Patient CSS measurement contract and 1C budget |
| `README.md`                        | Repo entry; direction vs implementation        |
