# Working memory — Care Guide aftercare reset

This file helps later implementation sessions. It is **not** the product contract.

Authoritative requirements: [PRD.md](PRD.md)  
Decisions: [../adr/README.md](../adr/README.md)

Last updated: 2026-08-31 (Phase 0 documentation only)

---

## Product direction vs current implementation

| | |
| --- | --- |
| **Product direction** | B2B aftercare SaaS: branded tenant hostnames, canonical guide library, practice enablement/overrides, durable URLs + QR, mobile-first anonymous patient pages, operator admin, basic anonymous analytics |
| **Current implementation** | Clinic staff auth + parked chairside procedure sessions and `/display/[token]` |
| **Aftercare MVP implemented?** | **No** |

Do not claim branded subdomains, aftercare guides, QR codes, or operator aftercare admin exist until they are built.

---

## Do not do (until a later explicit task)

- Implement Phase 1 application code
- Modify Prisma schema / create aftercare migrations
- Delete or refactor parked chairside functionality
- Depend aftercare on `ProcedureSession`
- Reuse `ProcedureTemplate` as the aftercare Guide Template
- Use real Pacific Dental brand assets
- Author scraped/clinically authoritative copy from random websites
- Commit/push as part of the original Phase 0 documentation task unless later instructed

---

## Reusable foundation

- Next.js App Router, React, Tailwind, PostgreSQL, Prisma
- `Clinic`, `User`, `ClinicMembership`
- Staff auth: `auth.ts`, `lib/auth/*`, `/login`, `/dashboard` layout guard `requireStaffSession()`
- Clinic-scoped query patterns (membership-derived clinic id)

`Clinic` currently has `id` + `name` only (no tenant slug, branding, or contacts).

---

## Parked chairside map (do not extend for aftercare)

| Area | Location |
| --- | --- |
| Schema | `prisma/schema.prisma` — `ProcedureTemplate`, stages, rooms, doctors, `ProcedureSession`, display prefs, overrides, transitions |
| Seed | `prisma/seed.mjs` — Rivers Care Demo Clinic; starter walkthrough + scaling & root planing chairside templates; optional external `aftercareUrl` |
| Create session | `app/sessions/new/*`, `lib/sessions/create-procedure-session.ts` |
| Control | `app/session/[id]/control/*`, `lib/sessions/move-procedure-session-stage.ts`, `complete-procedure-session.ts` |
| Patient display | `app/display/[token]/*`, `lib/sessions/load-patient-display.ts` |
| Realtime | `lib/realtime/*` (Supabase; optional in local `.env.example`) |
| Staff dashboard | `app/dashboard/page.tsx` (in-progress sessions), `app/dashboard/procedures/page.tsx` (read-only chairside templates) |

Completed sessions may show an external `ProcedureTemplate.aftercareUrl`. That is **not** the aftercare product.

---

## Demo data

Seeded fictional clinic: **Rivers Care Demo Clinic** (`clinic_demo_rivers`).

- Admin: `admin@care-guide.test`
- Staff: `staff@care-guide.test`
- Shared demo password: `CareGuideDemo123!`

Pacific Dental appears in the PRD only as a **conceptual** hostname example (`pacificdental.<platform-domain>`).

---

## Phase 1 (not started)

When explicitly authorised, Phase 1 proves **one** dental tenant end-to-end: slug, hostname resolution, branding, contacts, new aftercare domain model, canonical guide, enablement, additions/overrides, draft/published, public home + guide routes, mobile-first rendering, local hostname simulation, **no `ProcedureSession` dependency**.

Phase 1 is a technical vertical slice, not commercial MVP. Commercial MVP is after Phase 3 (see PRD §19 and §22).

---

## Documentation files

| File | Role |
| --- | --- |
| `docs/README.md` | Docs index |
| `docs/product/PRD.md` | PRD v1.0 |
| `docs/product/WORKING-MEMORY.md` | This file |
| `docs/adr/*.md` | Architecture decisions 0001–0009 |
| `README.md` | Repo entry; direction vs implementation |
