# Working memory — Care Guide aftercare reset

This file helps later implementation sessions. It is **not** the product contract.

Authoritative requirements: [PRD.md](PRD.md)  
Decisions: [../adr/README.md](../adr/README.md)

Last updated: 2026-09-07 (Phase 1F.3 visual simplification, document-led patient experience)

---

## Product direction vs current implementation

|                                |                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product direction**          | B2B aftercare SaaS: branded tenant hostnames, canonical guide library, practice enablement/overrides, durable URLs + QR, mobile-first anonymous patient pages, operator admin, basic anonymous analytics                                                                                                                                                                                                                                  |
| **Current implementation**     | Staff auth + parked chairside sessions + Phase 1A–1C aftercare + **Phase 1E browser/performance acceptance** + **Phase 1F public marketing face** + **Phase 1F.1 Aftercare Guide branding, tenant presentation settings, and premium marketing/tenant UX** + **Phase 1F.2 marketing polish, recovery timeline, and local login DX** + **Phase 1F.3 visual simplification and document-led patient pages**. Phase 1D was absorbed into 1C. |
| **Aftercare MVP implemented?** | **No** — Phase 1 technical vertical slice is implemented and hardened. Commercial MVP is after Phase 3.                                                                                                                                                                                                                                                                                                                                   |

Do not claim QR codes, operator aftercare admin, or analytics exist until they are built. Hostname routing (Phase 1B) and branded patient pages (Phase 1C) are implemented. Phase 1E added Playwright + axe browser acceptance; it did not add product features.

---

## Phase status

| Phase | Status                                                    |
| ----- | --------------------------------------------------------- |
| 1A    | COMPLETE / APPROVED                                       |
| 1B    | COMPLETE / APPROVED                                       |
| 1B.5  | COMPLETE / APPROVED                                       |
| 1C    | COMPLETE / APPROVED                                       |
| 1D    | ABSORBED INTO PHASE 1C / NO SEPARATE IMPLEMENTATION       |
| 1E    | COMPLETE — TECHNICALLY READY FOR LOCAL JOAQUÍN ACCEPTANCE |
| 1F    | COMPLETE — READY FOR LOCAL JOAQUÍN REVIEW                 |
| 1F.1  | COMPLETE — PREMIUM PRODUCT EXPERIENCE READY FOR REVIEW    |
| 1F.2  | COMPLETE — READY FOR LOCAL JOAQUÍN REVIEW                 |
| 1F.3  | COMPLETE — VISUAL SIMPLIFICATION READY FOR JOAQUÍN REVIEW |
| 2+    | Not started                                               |

Phase 1D is not a missing slice. Phase 1C already shipped canonical composition, practice overrides, practice additions, semantic section rendering, warning/emergency rendering, and the real patient guide UI. A separate 1D implementation would have been artificial. Historical phase numbers are not renumbered.

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

Local URLs: `localhost:3000` is the public marketing homepage. `app.localhost:3000` stays staff/parked. `demodental.localhost:3000` rewrites internally. `unknown.localhost:3000` is a generic 404. Tenant hosts block `/login`, `/dashboard`, `/sessions`, `/session`, `/display`, `/api/auth`. Direct `/_sites` and `/_marketing` are 404.

Internal aftercare files now live at `app/(aftercare)/%5Fsites/[tenant]`. Public rewrite target remains `/_sites/<slug>/…`. The marketing homepage rewrites to `/_marketing`.

---

## Phase 1B.5 (implemented)

Patient styling + performance foundation. Replaced the Phase 1B.5 brand-proof header in 1C.

| Area              | Location                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Staff root        | `app/(staff)/layout.tsx` + `staff.css` (Tailwind)                                                                    |
| Aftercare root    | `app/(aftercare)/layout.tsx` + `aftercare.css` (no Tailwind)                                                         |
| Theme resolver    | `lib/branding/aftercare-theme.ts` — hex-only, contrast fallback, light/dark semantic `--cg-*` tokens, radius presets |
| Patient CSS       | `app/(aftercare)/patient.module.css`                                                                                 |
| Performance notes | [../architecture/PERFORMANCE.md](../architecture/PERFORMANCE.md)                                                     |
| Styling ADR       | [ADR 0011](../adr/0011-patient-styling-uses-css-modules-and-semantic-runtime-tokens.md)                              |

Tenant branding is server-rendered CSS variables. No client ThemeProvider. No arbitrary ClinicProfile CSS fields. Dark/light follows clinic `themeMode` (`LIGHT` / `DARK` / `SYSTEM`) via `color-scheme` and `light-dark()` tokens. An optional patient theme-toggle Client Component is rendered only when `allowPatientThemeToggle` is true.

---

## Phase 1C (implemented)

Public patient experience on tenant hostnames. No patient login, no PII, no analytics, no QR, no operator CMS.

| Area               | Location                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Tenant home        | `app/(aftercare)/%5Fsites/[tenant]/page.tsx`                                                                                  |
| Public guide       | `app/(aftercare)/%5Fsites/[tenant]/[guideSlug]/page.tsx`                                                                      |
| Patient components | `app/(aftercare)/components/*` — Server Components; optional `PatientThemeControl` only when a clinic enables it (Phase 1F.1) |
| Chrome resolver    | `lib/aftercare/practice-chrome.ts` + `safe-href.ts`                                                                           |
| Demo notice        | `lib/aftercare/demo-tenant.ts` — `demodental` only; easy to remove                                                            |
| Metadata           | `lib/aftercare/tenant-metadata.ts` — `{Practice} — {instruction label}` / `{Guide} · {Practice}`, `noindex`                   |
| Section tone       | `lib/aftercare/guide-section-tone.ts` — kind-driven, not section-key-driven                                                   |
| Demo mark          | `public/demo/riverside-mark.svg` (`ClinicProfile.logoUrl`)                                                                    |

Patient-specific Client Components: **0** unless the clinic enables `allowPatientThemeToggle`. Native `<a>` / `<img>` (no `next/link` or `next/image` on the patient surface).

Local URLs:

- `http://demodental.localhost:3000/` — practice aftercare home
- `http://demodental.localhost:3000/extraction` — Tooth Extraction composed guide

Homepage lists only enabled + published PracticeGuides pinned to a published revision, ordered by `sortOrder` then `publicSlug`. Unknown tenant, unknown/draft/disabled guides → generic 404.

Emergency rule: guide `EMERGENCY` / `WARNING_SIGNS` sections explain condition/context; `ClinicProfile` contact/emergency copy is chrome (“how to reach this practice”). They are not merged.

---

## Phase 1E (implemented)

Quality, performance, and acceptance hardening for the Phase 1 vertical slice. No Phase 2 features.

| Area              | Location                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Browser E2E       | `e2e/*.spec.ts`, `playwright.config.ts` — production `next start` on port 4173, `*.localhost`   |
| Accessibility     | `@axe-core/playwright` 4.13.0 on tenant home and Tooth Extraction                               |
| Fixtures          | `e2e/fixtures/phase1e-data.ts` — Harbor Family Dental + draft/disabled/pinned-draft, cleaned up |
| Composition edges | `tests/compose-guide-document.test.ts`                                                          |
| Performance notes | [../architecture/PERFORMANCE.md](../architecture/PERFORMANCE.md)                                |

Patient-specific Client Components remain **0**. Native `<a>` / `<img>` kept. Playwright and axe are **devDependencies** only.

---

## Phase 1F (implemented)

Public marketing face, patient UX/UI uplift, and branding-token foundation. No Phase 2 operator admin.

| Area               | Location                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Apex routing       | `parseHostname` `marketing` kind; `proxy.ts` rewrites `/` to `/_marketing`               |
| Marketing homepage | `app/(marketing)/%5Fmarketing/page.tsx` + `marketing.css` / `marketing.module.css`       |
| Staff host         | `app.localhost` continues to serve `/`, `/login`, dashboard, and parked chairside        |
| Patient home/guide | Clinic-first post-operative copy and refined CSS Modules                                 |
| Branding fields    | `ClinicProfile.neutralColor`, `ClinicProfile.radiusPreset` (`SHARP` / `MEDIUM` / `SOFT`) |
| Theme              | `lib/branding/aftercare-theme.ts` — light/dark semantic tokens, radius, no arbitrary CSS |
| Routing ADR        | [ADR 0012](../adr/0012-apex-host-is-the-public-marketing-face.md)                        |

Patient-specific Client Components remain **0** unless a clinic enables the optional patient theme toggle. Dark/light follows `prefers-color-scheme` unless the clinic locks `LIGHT` or `DARK`.

Local URLs:

- `http://localhost:3000/` — public marketing homepage
- `http://app.localhost:3000/` — internal staff workspace
- `http://demodental.localhost:3000/` — Riverside Dental Demo aftercare home
- `http://demodental.localhost:3000/extraction` — Tooth Extraction guide

---

## Phase 1F.1 (implemented)

Premium Aftercare Guide marketing identity, tenant presentation settings, and optional patient theme control. No Phase 2 operator admin.

**Aftercare Guide** is the current provisional commercial/product name. The repository, npm package, and `CARE_GUIDE_*` environment prefixes remain `care-guide`.

| Area                 | Location                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Product name         | `lib/branding/product-name.ts`                                                                                  |
| Marketing            | `app/(marketing)/%5Fmarketing/page.tsx` — cobalt/periwinkle platform palette, 80rem container, editorial layout |
| Marketing theme      | Isolated `MarketingThemeControl` Client Component; `SYSTEM` default; localStorage persistence                   |
| Terminology          | `ClinicProfile.instructionTerminology` → `lib/aftercare/instruction-terminology.ts`                             |
| Clinic theme policy  | `ClinicProfile.themeMode` (`LIGHT` / `DARK` / `SYSTEM`) serialized as `html { color-scheme }`                   |
| Patient theme toggle | `ClinicProfile.allowPatientThemeToggle`; isolated `PatientThemeControl` only when true                          |
| Attribution          | “Powered by Aftercare Guide”                                                                                    |
| Presentation ADR     | [ADR 0013](../adr/0013-provisional-aftercare-guide-presentation-controls.md)                                    |

Riverside Dental Demo seed: `POST_TREATMENT`, `SYSTEM`, `allowPatientThemeToggle = true`.

Future `typographyPreset` (`CLINICAL` / `MODERN` / `EDITORIAL`) is documented, not implemented. Arbitrary tenant CSS remains prohibited. Marketing brand colour is intentionally separate from tenant clinic colours.

---

## Phase 1F.2 (implemented)

Premium polish, recovery timeline, and local login DX. No Phase 2 operator admin.

| Area              | Location                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Marketing eyebrow | `AFTERCARE PLATFORM` (category language, not a branded claim)                                  |
| Section surfaces  | Reusable `surfaceBase` / `surfaceSubtle` / `surfaceContrast` / `surfaceBrand` full-bleed bands |
| Marketing footer  | Product name, short tagline, in-page links, year copyright                                     |
| Theme control     | Compact icon + native popover (`AppearanceMenu`); System / Light / Dark; same persistence      |
| Recovery timeline | `GuideTemplateSection.periodLabel` + consecutive `RECOVERY_TIMELINE` grouping                  |
| Timeline ADR      | [ADR 0014](../adr/0014-recovery-timeline-stages-are-data-driven-sections.md)                   |
| Booking CTA       | Not rendered. `bookingUrl` remains on `ClinicProfile` for later structured CTA config          |
| Local login       | `LOCAL_ADMIN_*` and `LOCAL_STAFF_*`; seed upserts hashed users; refused in production          |

Demo extraction stages: First few hours → Today / first 24 hours → Days 2–3 → Days 4–7, then what-is-normal, warnings, contact. Demo copy is paraphrased from SA Dental extraction guidance structure, not verbatim, and remains labelled non-clinical.

Patient CTAs should later become structured configuration (`call`, `contact page`, `booking`, `email`, `emergency/after-hours`) with enable/disable, label, and order. Not implemented now.

Local staff URL: `http://app.localhost:3000/login`. Credentials come from `LOCAL_<ROLE>_EMAIL` / `LOCAL_<ROLE>_PASSWORD`.

---

## Phase 1F.3 (implemented)

Visual simplification only. No Phase 2 operator admin. No clinical-content architecture change.

Marketing is four visual chapters, not a band per section:

| Chapter | Surface token       | Contents                                    |
| ------- | ------------------- | ------------------------------------------- |
| 1       | `marketingBase`     | Sticky header + hero + product preview      |
| 2       | `marketingSoft`     | Problem, product, how it works, why clinics |
| 3       | `marketingShowcase` | Branding comparison + clinic preview        |
| 4       | `marketingClosing`  | Early-access CTA + footer                   |

Internal chapter 2/3 rhythm uses spacing, type scale, alignment, and thin rules (`chapterRule`). Removed `surfaceBase` / `surfaceSubtle` / `surfaceContrast` / `surfaceBrand`.

Patient light canvas is white (`#ffffff`). Clinic `neutralColor` may tint `--cg-surface-subtle` only; it no longer paints the page. Dark patient canvas is `#111318` with `#171a1f` for warning/urgent surfaces. Clinic teal stays on the mark, primary CTA, timeline rule/markers, and (in light mode) small labels.

Patient pages are document-led: homepage guide list is a row with an arrow, not a card; standard guide sections are heading + body; consecutive `RECOVERY_TIMELINE` stages share one “Recovery guide” journey. Visual grammar borrowed from parked staff/chairside UX (white canvas, uppercase labels, thin rules, timeline markers, restrained accent) without PIN, patient name, plan ID, medications, or session data.

**Current staff UI is parked legacy product UX.** Phase 2 will replace the visible staff homepage/navigation with the Aftercare Guide operator workspace. Chairside functionality was not changed in 1F.3.

---

## Do not do (until a later explicit task)

- Phase 2 operator admin, QR, analytics, SMS/email, billing, custom domains, extra specialties, clinical CMS, rich-text editor, patient-specific guides, chairside integration
- Enable `cacheComponents: true`
- Delete or refactor parked chairside functionality
- Depend aftercare on `ProcedureSession`
- Reuse `ProcedureTemplate` as the aftercare Guide Template
- Use real Pacific Dental brand assets
- Author scraped/clinically authoritative copy from random websites
- Parent-domain auth cookies (`Domain=.localhost`)

---

## Reusable foundation

- Next.js App Router, React, Tailwind (staff only), CSS Modules (patient + marketing), PostgreSQL, Prisma
- `Clinic` (`id`, `name`, **`slug`**), `User`, `ClinicMembership`, **`ClinicProfile`** (`primaryColor`, `accentColor`, `neutralColor`, `radiusPreset`, `instructionTerminology`, `themeMode`, `allowPatientThemeToggle`)
- Staff auth: `auth.ts`, `lib/auth/*`, `/login`, `/dashboard` layout guard `requireStaffSession()`
- Clinic-scoped query patterns (membership-derived clinic id)
- Aftercare domain: `GuideTemplate` → `GuideTemplateRevision` → `GuideTemplateSection`; `PracticeGuide` + override/addition
- Tenancy: `lib/tenancy/*`, `proxy.ts`, `app/(aftercare)/%5Fsites/[tenant]`, `app/(marketing)/%5Fmarketing`
- Patient theme: `lib/branding/aftercare-theme.ts`
- Patient pages: `app/(aftercare)/components/*`, `lib/aftercare/practice-chrome.ts`
- Browser acceptance: `e2e/*`, `@playwright/test`, `@axe-core/playwright` (dev only)

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
- Demo mark: `/demo/riverside-mark.svg`
- Admin: `LOCAL_ADMIN_EMAIL` / `LOCAL_ADMIN_PASSWORD` (see `.env.example`)
- Staff: `LOCAL_STAFF_EMAIL` / `LOCAL_STAFF_PASSWORD`

Aftercare seed (Phase 1A, logo path updated in 1C; canonical copy made clinic-neutral in 1E):

- Canonical template **Tooth Extraction** (`extraction`, specialty `DENTAL`)
- Published revision v1 with ordered demo sections (explicitly labelled non-clinical)
- Published/enabled PracticeGuide pinned to that revision
- One practice override (`first-24-hours`) and one addition (`weekend-contact` after `contact-practice`)
- Page-level demo notice for `demodental` only: “Demo aftercare content — not clinical advice.”

Pacific Dental appears in the PRD only as a **conceptual** hostname example (`pacificdental.<platform-domain>`).

---

## Phase 1 remainder (not started)

Phase 1 is technically ready for **local visual/device acceptance**. Do not merge to `feature/aftercare-phase-1` or `main` until that happens.

Commercial MVP is after Phase 3 (see PRD §19 and §22). Do not begin Phase 2 from this branch.

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

| File                               | Role                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `docs/README.md`                   | Docs index                                              |
| `docs/product/PRD.md`              | PRD v1.0                                                |
| `docs/product/WORKING-MEMORY.md`   | This file                                               |
| `docs/adr/*.md`                    | Architecture decisions 0001–0014                        |
| `docs/architecture/PERFORMANCE.md` | Patient CSS/JS measurement contract and Phase 1E budget |
| `README.md`                        | Repo entry; direction vs implementation                 |
