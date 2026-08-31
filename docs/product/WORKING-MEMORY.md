# Working memory — Care Guide aftercare reset

This file helps later implementation sessions. It is **not** the product contract.

Authoritative requirements: [PRD.md](PRD.md)  
Decisions: [../adr/README.md](../adr/README.md)

Last updated: 2026-08-31 (Phase 1A domain foundation)

---

## Product direction vs current implementation

|                                |                                                                                                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product direction**          | B2B aftercare SaaS: branded tenant hostnames, canonical guide library, practice enablement/overrides, durable URLs + QR, mobile-first anonymous patient pages, operator admin, basic anonymous analytics |
| **Current implementation**     | Staff auth + parked chairside sessions + **Phase 1A aftercare data/domain foundation** (no public tenant routes yet)                                                                                     |
| **Aftercare MVP implemented?** | **No** — Phase 1A only                                                                                                                                                                                   |

Do not claim branded subdomains, public aftercare pages, QR codes, or operator aftercare admin exist until they are built.

---

## Phase 1A (implemented)

Data/domain foundation only. No `proxy.ts`, no hostname routing, no patient-facing pages.

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

## Do not do (until a later explicit task)

- Phase 1B hostname routing (`proxy.ts`, `lib/tenancy/parse-hostname.ts`, `app/_sites/**`, `*.localhost`)
- Patient-facing aftercare pages or branding components
- Enable `cacheComponents: true`
- Delete or refactor parked chairside functionality
- Depend aftercare on `ProcedureSession`
- Reuse `ProcedureTemplate` as the aftercare Guide Template
- Use real Pacific Dental brand assets
- Author scraped/clinically authoritative copy from random websites

---

## Reusable foundation

- Next.js App Router, React, Tailwind, PostgreSQL, Prisma
- `Clinic` (`id`, `name`, **`slug`**), `User`, `ClinicMembership`, **`ClinicProfile`**
- Staff auth: `auth.ts`, `lib/auth/*`, `/login`, `/dashboard` layout guard `requireStaffSession()`
- Clinic-scoped query patterns (membership-derived clinic id)
- Aftercare domain: `GuideTemplate` → `GuideTemplateRevision` → `GuideTemplateSection`; `PracticeGuide` + override/addition

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

**1B** — hostname tenant resolution, local `*.localhost` simulation, public routes.  
**1C+** — patient UI, revalidation, remaining vertical-slice surfaces.

Phase 1 is a technical vertical slice, not commercial MVP. Commercial MVP is after Phase 3 (see PRD §19 and §22).

---

## Documentation files

| File                             | Role                                    |
| -------------------------------- | --------------------------------------- |
| `docs/README.md`                 | Docs index                              |
| `docs/product/PRD.md`            | PRD v1.0                                |
| `docs/product/WORKING-MEMORY.md` | This file                               |
| `docs/adr/*.md`                  | Architecture decisions 0001–0010        |
| `README.md`                      | Repo entry; direction vs implementation |
