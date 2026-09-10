# Working memory — Care Guide aftercare reset

This file helps later implementation sessions. It is **not** the product contract.

Authoritative requirements: [PRD.md](PRD.md)  
Decisions: [../adr/README.md](../adr/README.md)

Last updated: 2026-09-10 (Marketing final polish: calmer motion, shared inner-page heroes, simplified contact form)

---

## Product direction vs current implementation

|                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product direction**          | B2B aftercare SaaS: branded tenant hostnames, canonical guide library, practice enablement/overrides, durable URLs + QR, mobile-first anonymous patient pages, operator admin, basic anonymous analytics                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Current implementation**     | Staff auth + parked chairside sessions + Phase 1A–1C aftercare + **Phase 1E browser/performance acceptance** + **Phase 1F public marketing face** through **1F.16 / reveal timing** + **Phase 1G interactive patient demo** + **Phase 1G.1 launch-scope cleanup** + **marketing completion** (`/`, `/pricing`, `/contact` on the root host) + **marketing conversion polish** + **marketing final polish** (calmer motion, shared inner-page heroes, simplified clinic enquiry form). Motion is approved for marketing presentation only. Patient clinical content remains motion-light and document-first. Check-in is post-launch only — see [POST-LAUNCH-ROADMAP.md](POST-LAUNCH-ROADMAP.md). A Cloudflare Turnstile challenge is HIGH PRIORITY before or immediately after launch and is **not implemented**. |
| **Aftercare MVP implemented?** | **No** — Phase 1 technical vertical slice is implemented and hardened. Commercial MVP is after Phase 3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Do not claim QR codes, operator aftercare admin, or analytics exist until they are built. Hostname routing (Phase 1B) and branded patient pages (Phase 1C) are implemented. Phase 1E added Playwright + axe browser acceptance; it did not add product features.

---

## Phase status

| Phase                  | Status                                                         |
| ---------------------- | -------------------------------------------------------------- |
| 1A                     | COMPLETE / APPROVED                                            |
| 1B                     | COMPLETE / APPROVED                                            |
| 1B.5                   | COMPLETE / APPROVED                                            |
| 1C                     | COMPLETE / APPROVED                                            |
| 1D                     | ABSORBED INTO PHASE 1C / NO SEPARATE IMPLEMENTATION            |
| 1E                     | COMPLETE — TECHNICALLY READY FOR LOCAL JOAQUÍN ACCEPTANCE      |
| 1F                     | COMPLETE — READY FOR LOCAL JOAQUÍN REVIEW                      |
| 1F.1                   | COMPLETE — PREMIUM PRODUCT EXPERIENCE READY FOR REVIEW         |
| 1F.2                   | COMPLETE — READY FOR LOCAL JOAQUÍN REVIEW                      |
| 1F.3                   | COMPLETE — VISUAL SIMPLIFICATION READY FOR JOAQUÍN REVIEW      |
| 1F.4                   | COMPLETE — MARKETING MOTION READY FOR JOAQUÍN REVIEW           |
| 1F.5                   | COMPLETE — HERO COMPOSITION READY FOR JOAQUÍN REVIEW           |
| 1F.6                   | COMPLETE — PREMIUM MOBILE HERO READY FOR JOAQUÍN REVIEW        |
| 1F.7                   | COMPLETE — HERO INTERACTION POLISH READY FOR JOAQUÍN REVIEW    |
| 1F.8                   | COMPLETE — PREMIUM HERO ATMOSPHERE READY FOR JOAQUÍN REVIEW    |
| 1F.9                   | COMPLETE — RESPONSIVE PRODUCT PREVIEW READY FOR JOAQUÍN REVIEW |
| 1F.10                  | COMPLETE — PREMIUM STORYTELLING READY FOR JOAQUÍN REVIEW       |
| 1F.11                  | COMPLETE — STORY CLARITY READY FOR JOAQUÍN REVIEW              |
| 1F.12                  | COMPLETE — DESIGN COHERENCE READY FOR JOAQUÍN REVIEW           |
| 1F.13                  | COMPLETE — CLOSING COMPOSITION READY FOR JOAQUÍN REVIEW        |
| 1F.14                  | COMPLETE — FINAL MARKETING REFINEMENT READY FOR JOAQUÍN REVIEW |
| 1F.15                  | COMPLETE — MOBILE STORYTELLING READY FOR JOAQUÍN REVIEW        |
| 1F.16                  | COMPLETE — MOTION CHOREOGRAPHY READY FOR JOAQUÍN REVIEW        |
| 1F.10vt                | COMPLETE — VIEWPORT REVEAL TIMING READY FOR JOAQUÍN REVIEW     |
| 1G                     | COMPLETE — INTERACTIVE RECOVERY DEMO READY FOR JOAQUÍN REVIEW  |
| 1G.1                   | COMPLETE — LAUNCH-SCOPE CLEANUP                                |
| Marketing completion   | COMPLETE — PRICING + CONTACT READY FOR JOAQUÍN REVIEW          |
| Marketing polish       | COMPLETE — CONVERSION POLISH READY FOR JOAQUÍN REVIEW          |
| Marketing final polish | COMPLETE — READY FOR JOAQUÍN REVIEW                            |
| 2+                     | Not started                                                    |

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

Patient-specific Client Components: theme toggle when enabled, plus the Phase 1G `PatientDemoExperience` island and print trigger on demo guide/print routes. Native `<a>` / `<img>` (no `next/link` or `next/image` on the patient surface).

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

## Phase 1F.4 (implemented)

Marketing-only Motion choreography plus CSS-only patient polish. No Phase 2. Aftercare still does not depend on `ProcedureSession`.

| Surface            | Behaviour                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing reveals  | `LazyMotion` + `motion/react-m`, `whileInView` once, stagger 85ms, tween `easeOut`, `transform` + `opacity`                                                                                  |
| Chapter wash       | Removed in 1F.11. Static chapter surfaces only. Future Motion may animate background colour / CSS variables — not a blurred overlay. One SVG wave remains between hero and the soft chapter. |
| Fail-open          | Blocking bootstrap `data-mk-motion`; pending reveals hidden only when `enhance`; 1.6s fail-open; `<noscript>` override                                                                       |
| Patient guide card | CSS-only hover (−2px) / arrow (+4px) / focus ring. Server Component. No Motion, tilt, or 3D.                                                                                                 |
| Recovery timeline  | One `--cg-recovery-surface` chapter; stages remain cardless                                                                                                                                  |

Motion is **not** loaded on tenant routes. See [PERFORMANCE.md](../architecture/PERFORMANCE.md) for the 1F.4 bundle table.

---

## Phase 1F.5 (implemented)

Static marketing hero composition only. No Motion choreography change. No Phase 2. Patient product UI was not redesigned.

| Area               | Behaviour                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Light hero         | Warm-white `--mk-hero` (`#fffcf8`), dark ink, restrained periwinkle/cool-cyan glow toward the device stage                       |
| Dark hero          | Deep ink foundation (`#07090e`) with a restrained periwinkle/cobalt glow, not a neon wash                                        |
| Layout             | Full-width editorial H1, then a 42/58 supporting-copy / product-preview row at `64rem+`                                          |
| Device stage       | HTML/CSS browser portal (clinic aftercare home) behind an overlapping phone (extraction recovery timeline). `aria-hidden="true"` |
| Clinic vs platform | Riverside teal stays inside the mockup. Platform chrome/CTAs stay periwinkle/cobalt/ink                                          |
| Wave               | One shallower inline SVG between hero and the soft chapter; light hairline / dark restrained edge                                |

---

## Phase 1F.6 (implemented)

Static marketing hero refinement only. No Motion change. No Phase 2. Patient product UI was not redesigned.

| Area         | Behaviour                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Hierarchy    | Centered eyebrow + H1 in `heroTitleBlock` (max 62rem). Lower 42/58 row keeps left-aligned copy/CTAs and a single phone stage       |
| Device       | One CSS/SVG phone shell (bezel, island, glass highlight). Screen is HTML/CSS Riverside extraction recovery proof. `aria-hidden`    |
| Atmosphere   | Light: warm white `--mk-hero` with periwinkle/cyan radials toward the device. Dark: ink base with restrained cobalt/cyan glow      |
| Separator    | One shallow SVG curve: next-chapter fill, dissolving periwinkle→cyan→periwinkle stroke, blurred glow. Same geometry, token colours |
| Clinic brand | Riverside teal stays inside the phone. Platform chrome/CTAs stay periwinkle/cobalt/ink                                             |

Hero-attributed client JS added: **0**. No external device mockup. No Motion work in this pass.

---

## Phase 1F.7 (implemented)

Hero spacing, premium device shell, and CSS-only interaction polish. No Motion change. No Phase 2. No video yet.

| Area           | Behaviour                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing        | Desktop rhythm: eyebrow sits ~72–96px below the navbar; H1 follows; lower 42/58 row has more air. Controlled `min-height` uses `svh` minus header, never `100vh`                                          |
| Separator      | Same layered SVG wave, now flush at the hero section bottom so it reads as the chapter boundary                                                                                                           |
| Device         | Larger CSS phone (~18.5rem at 90rem+). Thinner rim, cleaner bezel, island, glass highlight, near + ambient + floor shadow. Screen remains Riverside extraction timeline                                   |
| Architecture   | Server-rendered `PhoneShell` → `PhoneScreen` → `ProductPreviewScreen`. Later swap the screen child for a short product loop. **No video, no Client Component, no GIF.**                                   |
| Future media   | Planned: WebM + MP4 fallback, `autoplay muted loop playsInline`, poster/static fallback. Intended 6–8s walkthrough: clinic home → Tooth Extraction → timeline → warning/contact → loop. GIF is rejected.  |
| Interactions   | CSS-only hover / `:focus-visible` / `:active` on primary/secondary CTAs, nav colour + hairline, compact theme trigger including `[aria-expanded="true"]`. Token: `--mk-interact-duration: 180ms ease-out` |
| Reduced motion | Translation hover lifts are removed. Colour, border, and focus rings remain                                                                                                                               |

Hero-attributed client JS added: **0**. Existing marketing Motion island is unchanged. Tenant UI was not modified.

---

## Phase 1F.8 (implemented)

Static marketing hero atmosphere plus a real iPhone hardware frame. No Motion change. No Phase 2. No video yet.

| Area         | Behaviour                                                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atmosphere   | Bottom-center layered radials plus a soft periwinkle→cyan wash into the existing wave. Light: pale periwinkle bloom + cool-cyan mist on warm white. Dark: cobalt radial, periwinkle bloom, faint cyan edge on ink |
| Device       | Rivers Digital Catión iPhone mockup (`cationBlue.png` from Sanity) copied to `/marketing/iphone-frame.webp`. Hardware overlay; live HTML/CSS Riverside extraction screen in the transparent opening               |
| Architecture | Server-rendered `PhoneShell` → `PhoneScreen` → `ProductPreviewScreen`. Native `<img>` (`fetchPriority="low"`) so the frame is not an LCP candidate and adds **0** client JS                                       |
| Position     | `align-self: center` plus a 24px desktop raise (`translateY(-1.5rem)`). Width follows the real 800/1620 aspect (~14.6rem at 90rem) so the full silhouette and separator stay in the 1440×900 viewport             |
| Future media | Unchanged: WebM + MP4 fallback inside `PhoneScreen`. GIF rejected                                                                                                                                                 |

Hero-attributed client JS added: **0**. No Motion work in this pass. Tenant UI was not modified. Rivers Digital repo was not modified.

---

## Phase 1F.9 (implemented)

Mobile marketing navigation, section spacing tokens, and a richer static phone-screen hierarchy. No Motion change. No Phase 2. No video. No hamburger menu.

| Area           | Behaviour                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile nav     | Below `47.99rem`, same-page anchors (`How it works`, `Clinic preview`) are `display: none`. Header keeps Aftercare Guide, Staff sign in, and the compact theme control. Tablet/desktop keep those two anchors plus Staff sign in. Footer anchors remain. There is no public Early Access link. |
| Wordmark       | `white-space: nowrap` plus a slightly smaller mobile mark/type so “Aftercare Guide” stays one line at 360/390                                                                                                                                                                                  |
| Section rhythm | `--mk-section-pad-y: clamp(4rem, 6vw, 6rem)` on inner `.band`s; `--mk-chapter-pad-y: clamp(6rem, 8vw, 8rem)` on chapter starts and the closing CTA. Blends are `4rem`. Hero keeps custom spacing.                                                                                              |
| Phone screen   | Still `PhoneShell` → `PhoneScreen` → `ProductPreviewScreen`. Hardware frame unchanged. Screen stays light (`color-scheme: light`, `#ffffff`) even when marketing chrome is dark.                                                                                                               |
| Preview copy   | Clinic → terminology → Tooth Extraction → Your recovery → current Immediate care stage with a short demo line → quieter Days 2–3 / Days 4–7 → “Need help? Call Riverside Dental →” (not a real link)                                                                                           |

Hero-attributed client JS added: **0**. Mobile navbar is CSS. Phone preview remains `aria-hidden`.

### Future section entrance choreography (not implemented)

Restrained section reveals remain appropriate. Do **not** ship this in 1F.9.

Future baseline when a later motion pass is explicit:

| Beat       | Delay  |
| ---------- | ------ |
| eyebrow    | 0ms    |
| heading    | +70ms  |
| body       | +140ms |
| visual/CTA | +210ms |

Motion: opacity `0 → 1`, `y` `14–18px → 0`, duration ~500ms, once per section. No word-by-word or letter-by-letter reveal. No large slide distances. `prefers-reduced-motion` must disable translation.

---

## Phase 1F.10 (implemented)

Premium process storytelling, asymmetric feature bento, and restored theme popover. No Motion change. No Phase 2. Hero composition frozen.

| Area             | Behaviour                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme popover    | Compact 10.125rem utility menu, CSS-anchored top-right under the trigger, 38px rows, inline SVG glyphs, periwinkle selected row, checkmark on the current value. Native `popover="auto"` behaviour kept. |
| How it works     | Semantic `<ol>` connected journey. Desktop: one horizontal periwinkle→cyan rail with numbered nodes and short drops into four cards. Mobile: continuous vertical rail. Decorative rail is `aria-hidden`. |
| Why clinics      | Replaced in 1F.11 by three benefit pillars plus a customisation strip.                                                                                                                                   |
| Motion readiness | `data-mk-process`, `data-mk-process-rail`, `data-mk-process-card`. No new `use client`.                                                                                                                  |

Hero-attributed client JS added: **0**. New marketing Client Components: **0**. Tenant CSS unchanged at **9,538** raw.

---

## Phase 1F.11 (implemented)

Story clarity below the frozen hero. No Motion entrance choreography. No Phase 2. Hero composition frozen.

| Area            | Behaviour                                                                                                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Process         | Continuous rail through nodes 01–04. Desktop equal-height cards with a shared visual / STEP / title slot. Subtle midpoint arrowheads between nodes, never beside them. Mobile stays a vertical rail sized naturally.  |
| Why clinics     | Three equal benefit pillars (Looks like your clinic / Built for patients / Simple to operate) plus one controlled-customisation strip. Product-native micro-previews only. QR/admin mentioned as future, not current. |
| Problem/Product | Editorial friction list (three points) paired with a typographic product equation: Approved guide + Clinic brand → Patient aftercare page. Same soft chapter; complementary left/right rhythm.                        |
| Closing         | Theme-aware. Light: soft periwinkle-neutral surface, dark ink, periwinkle CTA. Dark: deep ink, warm light text. Compact demo CTA + footer share the closing chapter. No forced dark band in light mode.               |
| Interactions    | Marketing CTA hover/active no longer translate. Nav and footer text links use a centre-out `scaleX` underline (`--mk-interact-duration`). Focus rings remain.                                                         |
| Chapter wash    | IntersectionObserver background wash, blend gradients, and `--mk-chapter-bg` transition removed. Static surfaces only.                                                                                                |

### Future chapter background animation (not implemented)

Later, with Motion, major chapter background tokens may transition smoothly as the user scrolls. That pass should animate **background colour / CSS variables**, not a blurred overlay crossing the page.

Hero-attributed client JS added: **0**. New marketing Client Components: **0**. Chapter-wash observer removed from `MarketingExperience`.

---

## Phase 1F.12 (implemented)

Static design coherence below the frozen hero and frozen How It Works. No Motion entrance choreography. No scroll-driven background. No Phase 2.

| Area           | Behaviour                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Links          | Nav/footer text links keep the centre-out underline. Underline uses `currentColor`, so text and underline always match. Light hover/focus: muted → ink. Dark hover/focus: muted grey → warm near-white. |
| Buttons        | Still no translate/scale. Primary hover is a slightly deeper periwinkle plus a small shadow; active is tighter. Secondary stays outlined with a stronger border/fill. Focus rings remain independent.   |
| Problem        | Eyebrow spans the section. Desktop H2 and friction `01–03` sit in a two-column row so `01` aligns with the heading, not the eyebrow. Mobile is eyebrow → H2 → list.                                     |
| Product        | Left assembly canvas: Approved guide + Riverside clinic brand → light patient-page fragment. Decorative / `aria-hidden`. No second phone.                                                               |
| Why clinics    | Three pillars unchanged. Controlled customisation is a four-column desktop strip (intro + Brand + Corners + Appearance), stacking to one column at 390.                                                 |
| Clinic preview | Right column is a static patient-home panel (Riverside Dental Demo, Tooth Extraction row, Call the practice) plus a caption. Brand Flexibility is the three identity cards above.                       |
| Closing        | Inverted bookend: periwinkle→cyan hairline at the top of the closing chapter; bottom-centre radial glow fading upward. Light stays light. Dark stays dark. No second wave.                              |

Hero composition and How It Works rail/cards were not materially changed. **New marketing client JS added: 0.**

---

## Phase 1F.13 (implemented)

Static closing-composition refinement only. No Motion entrance choreography. No scroll-driven background. No Phase 2. Frozen sections (Hero, Problem, Product, How It Works, Why Clinics Use It, Clinic Preview) were not redesigned.

| Area          | Behaviour                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Secondary CTA | Centre-out `::before` surface fill (`scaleX(0)` → `scaleX(1)`, origin center, ~180ms). The button itself does not translate or scale. Reduced motion applies the fill immediately. Focus ring remains. |
| Early Access  | Desktop ~58/42 conversion / design-partner columns. Right column is an editorial 01–03 list (Guide setup, Clinic branding, Patient handoff). Mobile stacks conversion copy above the partner list.     |
| Prospect CTA  | `View the clinic demo` only. Staff sign in stays in header and footer. No invented Request access / Contact us link; lead capture is future work.                                                      |
| Closing light | Bottom-centre footer glow removed. Inner footer separator is the light source (~82% from the left), with radial periwinkle/cyan bloom upward into Early Access and downward into the footer. No blur.  |

Hero composition and How It Works rail/cards were not materially changed. **New marketing client JS added: 0.**

---

## Phase 1F.14 (implemented)

Narrow final marketing refinement. No new sections. No Phase 2. Frozen: Hero, Problem, Product, How It Works layout, Why Clinics pillars/layout, Controlled Customisation geometry, Clinic Preview structure, Early Access structure, closing atmosphere (except footer overflow).

| Area               | Behaviour                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand Flexibility  | Eyebrow renamed from Brand Directions. H2 uses the shared `sectionTitle` scale. Customer copy only. Three full-colour identity cards with a shared 1rem radius, inset hairline, and equal desktop height. |
| Theme trigger      | Circular centre-origin `scale(0) → scale(1)` fill. Icon stays still. Reduced motion applies the fill immediately. Compact popover unchanged.                                                              |
| Footer             | Separator atmosphere `::before` is `position: absolute; inset: 0; pointer-events: none` so it cannot extend document height. Desktop copyright-to-end gap is the footer padding (~2.6rem / 42px).         |
| Public copy        | Internal roadmap/dev notes removed (provisional-name line, lead-capture implementation note, “not in this release”, “arbitrary CSS”, “phone-sized layout”).                                               |
| Prospect CTA       | Still `View the clinic demo` only. **Proper design-partner lead capture remains a commercial-launch requirement.** Do not invent a dead public CTA.                                                       |
| Typography presets | Investigated only. **Not implemented.** No schema, no Google Font packages, **0 font bytes** added.                                                                                                       |

### Future typography presets (not implemented)

Do **not** add an arbitrary Google Fonts picker. Do **not** load `fonts.googleapis.com` at runtime. Use `next/font` (self-hosted at build) and emit only the active tenant preset from the server theme CSS.

Current stacks:

- Patient: system/native `ui-sans-serif, system-ui, sans-serif` in `aftercare.css`. No `next/font`.
- Marketing: the same system stack in `marketing.css`. No `next/font`.
- Staff: Geist + Geist Mono via `next/font/google` (parked staff surface only).

A future `ClinicProfile.typographyPreset` should apply on the tenant `aftercareTheme` wrapper as `--cg-font-heading` / `--cg-font-body`, selected by the server when composing theme CSS. No client FontProvider. Headings and body should not vary independently for CLINICAL/MODERN; EDITORIAL may use a display face for headings only, with body remaining a highly readable sans. Prioritise long-form patient readability over marketing display.

| Preset    | Intended tone                                   | Likely loading strategy                                        | Estimated asset count                      |
| --------- | ----------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| CLINICAL  | Calm native clinical reading                    | System/native stack. No extra font files.                      | 0 WOFF2                                    |
| MODERN    | Contemporary practice, still long-form readable | One variable sans via `next/font`, latin subset, one/two axes. | 1 variable WOFF2                           |
| EDITORIAL | Distinct heading voice; body stays readable     | One display/heading font + system or the Modern sans for body. | 1 heading WOFF2 (+ 0–1 body if not system) |

Do not import all three `next/font` families in the shared aftercare layout — Next would self-host and preload unused faces. Select the preset on the server and emit only that `@font-face`. Measure actual WOFF2 transfer before shipping. No ADR in this phase.

Hero-attributed client JS added: **0**. New marketing Client Components: **0**. New font bytes: **0**.

---

## Phase 1F.15 (implemented)

Mobile composition and content-density refinement only. No Phase 2. No Motion. Desktop marketing layouts remain frozen aside from shared Why Clinics copy shortening.

| Area              | Behaviour                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product           | DOM is copy then assembly visual. Mobile reads copy → visual. Desktop CSS Grid areas keep visual LEFT / copy RIGHT. Copy-to-visual gap is `2.25rem`. No `column-reverse`.                               |
| How it works      | Desktop connected rail unchanged. Mobile drops the long left rail and `01–04` nodes. Full-width stacked cards with STEP 1–4 inside each card, short centred periwinkle→cyan connectors, natural height. |
| Why clinics       | Same three pillars + Controlled Customisation. Each pillar is title + one sentence + two proof points. Customisation strip unchanged. Copy is shared across viewports.                                  |
| Brand Flexibility | Mobile `padding-top` reduced from `--mk-chapter-pad-y` (96px) to `4rem` / 64px. Desktop chapter padding unchanged. Problem chapter still uses 96px on mobile.                                           |
| Early Access      | Mobile `padding-top` `4rem` / 64px. `padding-bottom` remains `2.25rem` / 36px. Desktop chapter padding unchanged.                                                                                       |

Hero, Problem layout, Clinic Preview, Footer, and mobile nav were not redesigned. **New marketing client JS added: 0.**

---

## Phase 1F.16 (implemented)

One-shot marketing Motion choreography plus public Early Access removal. No Phase 2. Aftercare still does not depend on `ProcedureSession`.

The public Early Access / Design Partner section was removed because founder-led sales handles initial clinic acquisition. Future lead capture/contact can be introduced when a genuine channel exists. Internal product documentation about design partners remains (PRD / working memory).

| Area                    | Behaviour                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Motion principle        | ENTER ONCE, REMAIN VISIBLE. No exit animation for ordinary page sections. Scrolling away and back does not replay or hide.                                                                                                                                                                                              |
| Root cause (1F.4–1F.15) | `viewport.once` was already true. Lower sections appeared to reset because `marketing.css` ran `@keyframes mk-fail-open` at 1.6s on `.mkReveal[data-mk-pending]`. CSS animations override Motion inline styles, so off-screen pending items became visible, then `whileInView` played hidden→visible when they entered. |
| Orchestration           | One `useInView({ once: true })` boundary per section (`MarketingRevealGroup`). Children inherit `visible` via variants with section-specific delays. Hero keeps mount `whileInView` once and is otherwise frozen.                                                                                                       |
| Fail-open               | SSR stays visible (no `opacity:0` in HTML). CSS hides pending only under `html[data-mk-motion="enhance"]`. No fail-open keyframes. `@media (scripting: none)` + `<noscript>` unhide. Feature-load catch sets `data-mk-motion="reduce"`.                                                                                 |
| Reduced motion          | Bootstrap `reduce`; pending CSS does not apply; MotionConfig `reducedMotion="user"`; content is immediately visible with no translation/scale/rail delay.                                                                                                                                                               |
| Closing                 | Compact `#see-it` CTA: “See it in practice” / “See the patient experience for yourself.” / Riverside Dental Demo copy / **View the clinic demo**. Desktop copy left, button right. Footer atmosphere from 1F.14/1F.15 preserved.                                                                                        |

Public landing narrative: Header → Hero → Problem → Product → How It Works → Why Clinics Use It → Brand Flexibility → Clinic Preview → compact demo CTA → Footer.

See [PERFORMANCE.md](../architecture/PERFORMANCE.md) for the 1F.16 bundle table.

---

## Phase 1F.10 reveal timing (implemented after 1F.16)

Marketing entrance-timing refinement only. No Phase 2. No static UI redesign. Aftercare still does not depend on `ProcedureSession`. The original Phase 1F.10 storytelling section above is unchanged; this pass reuses the brief label for viewport/card choreography.

| Area              | Behaviour                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Viewport          | Shared `useMarketingRevealViewport`: `once: true`, top margin `9999px`. Bottom inset is **~-80px** on mobile (`< 48rem`), **~-200px** on desktop/large (`≥ 64rem`), and linearly interpolated on tablet.                                                |
| Editorial groups  | `MarketingRevealGroup` still orchestrates eyebrow → heading → copy → CTA at 0 / 70 / 140 / 210ms. Duration remains 520ms tween `easeOut`.                                                                                                               |
| Cards             | `MarketingRevealCard` owns its own `useInView({ once: true })`. How it works steps, Why Clinics pillars + customisation strip, Brand Flexibility cards, and Problem friction items no longer inherit the section's hidden/visible state.                |
| Desktop vs mobile | Reveal **threshold** is width-based (mobile ~-80px, desktop ~-200px, tablet interpolated). Card **choreography** is not width-branched: stacked mobile cards enter one-by-one; a desktop row that enters together uses `70ms × index`, capped at 250ms. |
| Reduced motion    | Unchanged: bootstrap `reduce`, pending CSS skipped, content visible immediately.                                                                                                                                                                        |
| Hero / patient    | Hero viewport unchanged. No Motion on tenant patient routes.                                                                                                                                                                                            |

See [PERFORMANCE.md](../architecture/PERFORMANCE.md) for the reveal-timing bundle table.

---

## Phase 1G (implemented)

Interactive recovery **demo** on `demodental` only. No Phase 2. No persisted RecoveryPlan. No `ProcedureSession`. No patient PII.

Phase 1G.1 removed Check-in from the launch product. Check-ins remain documented as post-launch premium/add-on work.

| Area             | Behaviour                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Demo banner      | One banner: “Interactive demo” / “Sample content only · Not clinical advice · Changes aren't saved”. Seed copy no longer repeats DEMO CONTENT ONLY / practice-override implementation language. |
| Navigation       | Today / Timeline tabs + Print / Save PDF. Mobile tabs scroll. Check-in is absent from launch UI.                                                                                                |
| Today            | Default view. Explicit fixture **Day 1 of 7**. Resolver maps simulated day → current/next `RECOVERY_TIMELINE` stage + progress. Not `Date.now()`. Not a real per-patient treatment day.         |
| Timeline         | Existing stages with earlier / current / upcoming. Subtle content-column separators between stages. Continuous clinic-accent rail. Not clinical “completed”.                                    |
| Print            | `/extraction/print` plus `@media print`. Same `GuideDocument` / composed sections as the web guide. Browser Print / Save as PDF. No PDF library. Not a patient-specific Care Plan.              |
| Client island    | `PatientDemoExperience` (Today / Timeline) + existing `PatientThemeControl` + tiny `PrintTrigger`. Guide body stays Server Components.                                                          |
| Marketing reveal | Responsive IO margin: mobile ~**-80px**, desktop/large ~**-200px**, tablet interpolated. Editorial ~720ms / 110ms stagger; cards ~650ms / 95ms (cap 320ms). cubic-bezier(.22, 1, .36, 1).       |
| Attribution      | “Powered by Aftercare Guide” in a centred document-flow footer when `showCareGuideAttribution` is true.                                                                                         |
| Performance      | Tenant CSS **16,204** raw (budget 16,384). Demo island **4,818** raw (−1,950 vs 1G). Theme control unchanged. No Motion on tenant. See [PERFORMANCE.md](../architecture/PERFORMANCE.md).        |

Local URLs unchanged, plus:

- `http://demodental.localhost:3000/extraction/print` — printable recovery guide

---

## Phase 1G.1 (implemented)

Launch-scope cleanup. No Phase 2. No persisted RecoveryPlan.

| Change           | Result                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing reveal | Same viewport thresholds. Slightly slower / calmer choreography.                                                                                        |
| Check-in         | Removed from tenant/demo UI, client island, CSS, and current-product tests. Preserved in [POST-LAUNCH-ROADMAP.md](POST-LAUNCH-ROADMAP.md).              |
| Timeline         | Subtle 1px separators in the content column; rail stays continuous.                                                                                     |
| Footer           | Centred, muted, not sticky. Hidden when attribution is disabled.                                                                                        |
| Print            | Dedicated print document from the same GuideDocument. Button copy is **Print / Save PDF**.                                                              |
| Template model   | Documented canonical → enable → override → addition → custom → preview → publish/pin. Canonical updates never silently mutate a published clinic guide. |

---

## Marketing completion (implemented)

Root-platform commercial pages. No billing integration. No lead database. No tenant sales UI.

| Area            | Location / behaviour                                                                                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes          | Apex `/`, `/pricing`, `/contact` rewrite to `/_marketing`, `/_marketing/pricing`, `/_marketing/contact`. Direct `/_marketing` stays 404.                                                                                                                                                                 |
| Tenant / staff  | `demodental` `/pricing` and `/contact` 404. `app.` host is unchanged. Platform Pricing/Contact never render inside tenant chrome.                                                                                                                                                                        |
| Working prices  | Essential **A$79 / month**, Practice **A$149 / month** (Recommended), Group **Custom pricing**. Provisional AUD. No annual toggle. No published setup fee.                                                                                                                                               |
| Launch vs later | Active plan lists are launchable aftercare capabilities. Check-ins, connected recovery plans, messaging, and integrations sit in **Coming after launch** only. No Check-in price.                                                                                                                        |
| Contact         | Platform conversion page: concise hero + clinic enquiry form. Server action → validated `ContactEnquiry` → `MarketingContactMailer` (SMTP or local `memory`). No fake success. Subject: `Aftercare Guide — clinic enquiry — <clinic>`. See [MARKETING-CONTACT.md](../architecture/MARKETING-CONTACT.md). |
| Navigation      | Desktop: Pricing, Contact, Staff sign in, theme. Mobile: brand, Staff sign in, compact site menu (Pricing + Contact only), theme. Homepage How it works / Clinic preview stay on `/` and in the footer.                                                                                                  |
| Spacing         | `--mk-eyebrow-heading-gap`, `--mk-heading-intro-gap`, `--mk-heading-content-gap`, `--mk-card-grid-gap`. Heading groups use `headingBlock` / `headingFollow`.                                                                                                                                             |
| Heroes          | Homepage remains the largest product hero. Pricing/Contact use `MarketingPageHero` with related but distinct atmosphere and a **shared** inner-page SVG edge.                                                                                                                                            |
| Demo            | Homepage **View the clinic demo** still goes to the production tenant patient renderer (`demodental`). Closing CTA **Request a demo** goes to `/contact`.                                                                                                                                                |
| SEO             | `app/sitemap.ts` and `app/robots.ts` list `/`, `/pricing`, `/contact` only. No `/_marketing` or `/_sites`. Optional `CARE_GUIDE_METADATA_BASE`. SoftwareApplication JSON-LD without ratings, offers, or certifications.                                                                                  |
| Performance     | See [PERFORMANCE.md](../architecture/PERFORMANCE.md). Contact adds a narrow form island; Motion remains shared. No Tailwind.                                                                                                                                                                             |

Local URLs:

- `http://localhost:3000/` — product story
- `http://localhost:3000/pricing` — working plans
- `http://localhost:3000/contact` — clinic enquiry form
- `http://demodental.localhost:3000/pricing` — 404
- `http://demodental.localhost:3000/contact` — 404

---

## Marketing conversion polish (implemented)

Calmer marketing reveals, inner-page heroes, heading/content spacing tokens, simplified persistent nav, and a real clinic enquiry form. No Phase 2. Tenant patient UX was not redesigned.

| Area         | Behaviour                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Motion       | Same viewport thresholds (~-80px mobile, ~-200px desktop, tablet interpolated). Editorial **720ms / 110ms**. Cards **650ms / 95ms**, cap **320ms**. `y` 14px, once, cubic-bezier(.22, 1, .36, 1). Reduced motion unchanged. |
| Pricing hero | Medium-depth atmospheric light, no phone mockup, shallower asymmetric luminous edge into plans.                                                                                                                             |
| Contact hero | Quieter, smaller atmosphere, tapered off-centre arc into the form. Copy is eyebrow + H1 + short intro only.                                                                                                                 |
| Nav          | Persistent nav is Pricing / Contact / Staff sign in / Theme. How it works and Clinic preview remain homepage sections and footer links.                                                                                     |
| Form         | Full name, work email, practice name, locations (1 / 2–5 / 6+), optional phone and message. Honeypot + validation + throttle.                                                                                               |
| Delivery     | SMTP via nodemailer, or `MARKETING_CONTACT_MAILER=memory` for local/E2E. Production still needs real credentials.                                                                                                           |

---

## Marketing final polish (implemented)

Motion, inner-page hero rhythm, shared conversion button, simplified contact form. No Phase 2. No Turnstile. Tenant patient UX was not redesigned. Aftercare still does not depend on `ProcedureSession`.

| Area              | Behaviour                                                                                                                                                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Motion            | Same viewport thresholds (~-80px mobile, ~-200px desktop, tablet interpolated). Editorial **800ms / 125ms**. Cards **700ms / 105ms**, cap **350ms**. `y` 14px, once, cubic-bezier(.22, 1, .36, 1). Reduced motion unchanged. Duration stays ≤825ms.                                                  |
| Inner-page heroes | Shared `--mk-hero-bottom-gap: calc(1.35rem + 2.5rem)` on `.pageHeroInner`. Pricing and Contact share one inner-page SVG edge (`mkPageWaveInnerPage`). Homepage keeps its unique wave. `data-mk-page-hero` remains `pricing` \| `contact`.                                                            |
| Primary button    | Shared `.button.primary` with a 1px hover lift (removed under `prefers-reduced-motion`). Explicit `MarketingPrimaryLink` / `MarketingPrimaryAnchor` / `MarketingPrimaryButton` — not boolean soup. Contact **Send enquiry** / **Sending…** uses the same system with a reserved label width.         |
| Footer            | `--mk-footer-pad-top: 2rem` (32px). Compact footer otherwise unchanged.                                                                                                                                                                                                                              |
| Form              | Required: Full name, Email, Practice / clinic name. Optional: Phone, Anything you'd like us to know? Locations field removed. User-facing copy says Email, not Work email. Internal name may remain `workEmail`. Honeypot + validation + throttle kept.                                              |
| Anti-spam         | **Cloudflare Turnstile is HIGH PRIORITY before or immediately after launch. Not implemented.** Server-side verification, graceful failure, accessibility required when added. See [POST-LAUNCH-ROADMAP.md](POST-LAUNCH-ROADMAP.md) and [MARKETING-CONTACT.md](../architecture/MARKETING-CONTACT.md). |
| Nav               | Unchanged: desktop Pricing / Contact / Staff sign in / Theme. Mobile Staff sign in + site menu (Pricing + Contact) + Theme.                                                                                                                                                                          |

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
- Tenancy: `lib/tenancy/*`, `proxy.ts`, `app/(aftercare)/%5Fsites/[tenant]`, `app/(marketing)/%5Fmarketing` (`/`, `/pricing`, `/contact`)
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
- Page-level demo banner for `demodental` only: “Interactive demo — Sample content only · Not clinical advice · Changes aren't saved.”

Pacific Dental appears in the PRD only as a **conceptual** hostname example (`pacificdental.<platform-domain>`).

---

## Phase 1 remainder (not started)

Phase 1G.1 is the launch-scope cleanup for the current aftercare branch. Root-platform `/pricing` and `/contact` are implemented. Commercial MVP is after Phase 3 (see PRD §19 and §22). Do not begin Phase 2 from this branch.

See [POST-LAUNCH-ROADMAP.md](POST-LAUNCH-ROADMAP.md) for Check-ins, RecoveryPlan, dental template candidates, and future verticals.

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

| File                                     | Role                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `docs/README.md`                         | Docs index                                                                      |
| `docs/product/PRD.md`                    | PRD v1.0                                                                        |
| `docs/product/WORKING-MEMORY.md`         | This file                                                                       |
| `docs/product/POST-LAUNCH-ROADMAP.md`    | Launch-adjacent Turnstile note, Check-ins, RecoveryPlan, templates, verticals   |
| `docs/adr/*.md`                          | Architecture decisions 0001–0015                                                |
| `docs/architecture/PERFORMANCE.md`       | Patient CSS/JS measurement contract, Phase 1E budget, and 1F.4 Motion isolation |
| `docs/architecture/MARKETING-CONTACT.md` | Clinic enquiry form fields, SMTP env, and launch mailbox recommendation         |
| `README.md`                              | Repo entry; direction vs implementation                                         |
