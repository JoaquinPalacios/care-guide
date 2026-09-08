# Performance — patient aftercare surface

This is an engineering contract for the **patient** multi-tenant surface. Staff/admin and parked chairside may keep Tailwind.

Authoritative styling decision: [ADR 0011](../adr/0011-patient-styling-uses-css-modules-and-semantic-runtime-tokens.md).

## Rules

1. Patient UI defaults to React Server Components.
2. Tenant branding is applied with **server-rendered CSS custom properties** on the tenant wrapper. The first HTML document must already be branded.
3. Patient components use **CSS Modules** (`*.module.css`) against semantic tokens (`--cg-brand`, `--cg-on-brand`, …), not raw `primaryColor` field names.
4. No runtime CSS-in-JS (no styled-components, Emotion, runtime class generators).
5. No arbitrary tenant CSS. `ClinicProfile` must not grow `customCss`, `cssOverride`, `stylesheet`, or `headerHtml` fields. Future options (typography preset, corner style, logo placement) map to predefined tokens.
6. Tailwind is isolated to the staff/admin (and parked chairside) root layout. Do not `@import "tailwindcss"` from the aftercare root.
7. Route CSS payload is measured from a **production** `next build` + `next start`, not from `next dev`.
8. Custom fonts and other third-party assets require an explicit performance review. Phase 1 patient pages use a system font stack.
9. Performance regressions should be measured before acceptance. Do not optimise from assumptions alone.

Staff Tailwind `@theme` is **build-time**. Tenant tokens are **runtime CSS custom properties**. Do not put tenant colours in Tailwind `@theme`.

## How to measure

From a production server (`pnpm build && pnpm start`):

```bash
curl -sS "http://localhost:3000/"
curl -sS "http://demodental.localhost:3000/"
```

For each HTML response:

1. Collect `link[rel=stylesheet]` hrefs and `<script src>` values.
2. Fetch each CSS asset and record raw bytes, gzip (`gzip -9`), and Brotli (quality 11).
3. Confirm whether the CSS contains Tailwind markers (`--tw-`, `@import "tailwindcss"` output).
4. Confirm whether the HTML includes `--cg-*` custom properties (tenant only).
5. Confirm no client component exists solely to apply branding.

Do not add Lighthouse or other large audit dependencies for this check.

## Baseline (Phase 1B, before isolation)

Measured 2026-08-31 against `feature/aftercare-phase-1` at `5b7b09a`, Next.js 16.3.3 production (`next start`).

| Metric                    |               Staff `/` |                           Tenant `demodental/` |
| ------------------------- | ----------------------: | ---------------------------------------------: |
| CSS files                 | 1 (`0fqe2trrvf7__.css`) |                                  1 (same file) |
| CSS raw                   |                  26,928 |                                         26,928 |
| CSS gzip -9               |                   6,354 |                                          6,354 |
| CSS Brotli q11            |                   5,495 |                                          5,495 |
| Tailwind present          |                     yes |                                        **yes** |
| Theme vars in first HTML  |                      no |                                             no |
| Styling-related client JS |  no (framework JS only) |                         no (framework JS only) |
| Geist fonts preloaded     |                     yes | html class present; no woff2 preload on tenant |

The tenant skeleton loaded the staff Tailwind stylesheet because both surfaces shared `app/layout.tsx` → `globals.css`.

Staff `/login` used the same CSS file (26,928 raw). `/dashboard` redirects unauthenticated clients to `/login` (307). Unknown tenant `unknown.localhost` returns a generic 404. Tenant `/login` is blocked by the hostname proxy (empty 404).

## After isolation (Phase 1B.5)

Measured 2026-08-31 against the same branch after the staff/aftercare root-layout split. Production `next start` on port 3001 (port 3000 still held the previous Phase 1B process). Next.js 16.3.3 **did** emit separate CSS for the two root layouts.

Tenant `demodental/` CSS files:

- `3659kj8kv42ie.css` — aftercare base (621 raw)
- `428gkmsbthoaf.css` — `practice-brand-proof` CSS Module (332 raw)

| Metric                    |             Before (tenant) |                                             After (tenant) |              Delta |
| ------------------------- | --------------------------: | ---------------------------------------------------------: | -----------------: |
| CSS files                 |                           1 |                                                          2 | +1 (base + module) |
| CSS raw bytes             |                      26,928 |                                                        953 |     −25,975 (−96%) |
| CSS gzip -9               |                       6,354 |                                                        564 |             −5,790 |
| CSS Brotli q11            |                       5,495 |                                                        444 |             −5,051 |
| Tailwind on tenant        |                         yes |                                                     **no** |           isolated |
| `--cg-*` in first HTML    |                          no | **yes** (`--cg-brand:#0f766e`, `--cg-on-brand:#ffffff`, …) |    server-rendered |
| Styling-related client JS |                        none |                                                       none |          unchanged |
| Geist on tenant           | html class from shared root |                                                     **no** |           isolated |

Staff `/` still loads Tailwind (`3_zekvhor4rt9.css`, 27,165 raw / 6,382 gzip / 5,533 Brotli). Staff URLs, login copy, and `app.localhost` behaviour are unchanged. Unknown tenant remains a generic 404. Tenant `/login` and `/dashboard` remain proxy 404s.

Tenant routes still download Next.js App Router runtime JS. That is framework JS, not theme/styling JS. Theme application requires **0** Client Components.

## Phase 1C budget

Do not accept a patient-route CSS regression that:

- reintroduces the staff Tailwind stylesheet on a tenant hostname;
- requires client JavaScript to apply clinic branding;
- adds arbitrary tenant CSS or a runtime CSS-in-JS library.

Measured Phase 1B.5 tenant CSS is **953 raw / 564 gzip / 444 Brotli**. Phase 1C will add real CSS Modules. Review before merging if tenant CSS would exceed:

|                            |   Raw | gzip -9 | Brotli q11 |
| -------------------------- | ----: | ------: | ---------: |
| Phase 1C tenant CSS budget | 8,192 |   3,072 |      2,560 |

That ceiling is about 8× the 1B.5 proof and still about 70% smaller than the pre-isolation Tailwind payload. Exceeding it is not an automatic product fail, but it requires a measured review. Loading Tailwind on the tenant route **is** an automatic fail.

## After Phase 1C (public patient experience)

Measured 2026-08-31 against `cursor/aftercare-phase-1c-8cd6` after replacing the 1B.5 brand proof with the real homepage and guide. Production `next start` on port 3001. Next.js 16.3.3.

Tenant CSS files (same on `/` and `/extraction`):

- `111_azndupn_s.css` — aftercare base (639 raw)
- `43vuvrb7qr0jf.css` — `patient.module.css` (4,239 raw)

| Metric                             |         1B.5 tenant `/` |           1C tenant `/` | 1C tenant `/extraction` |
| ---------------------------------- | ----------------------: | ----------------------: | ----------------------: |
| CSS files                          |                       2 |                       2 |                       2 |
| CSS raw bytes                      |                     953 |                   4,878 |                   4,878 |
| CSS gzip -9                        |                     564 |                   1,431 |                   1,431 |
| CSS Brotli q11                     |                     444 |                   1,151 |                   1,151 |
| Tailwind on tenant                 |                      no |                      no |                      no |
| `--cg-*` in first HTML             |                     yes |                     yes |                     yes |
| Patient-specific Client Components |                       0 |                       0 |                       0 |
| Styling-related client JS          |                    none |                    none |                    none |
| Theme in first HTML                | `--cg-brand:#0f766e`, … | `--cg-brand:#0f766e`, … | `--cg-brand:#0f766e`, … |

Budget check (ceiling 8,192 raw / 3,072 gzip / 2,560 Brotli): **passed** on both tenant routes.

Tenant routes still download Next.js App Router runtime JS (framework chunks only). The tenant client-reference manifest lists Next internals (`error-boundary`, `http-access-fallback`, metadata, etc.) and **no** `app/(aftercare)` Client Components. Branding does not require client JavaScript.

Staff `/` still loads Tailwind (`3_zekvhor4rt9.css`, 27,165 raw / 6,356 gzip / 5,533 Brotli). Staff `/login`, `app.localhost`, unknown-tenant 404, and tenant `/login` + `/dashboard` proxy 404s are unchanged.

## Phase 1E acceptance (quality, performance, browser)

Measured 2026-09-01 against `cursor/aftercare-phase-1e-hardening` from `807a183`. Production `next start` on port 4173. Next.js 16.3.3.

Ongoing patient CSS budget (unchanged):

|                           |   Raw | gzip -9 | Brotli q11 |
| ------------------------- | ----: | ------: | ---------: |
| Phase 1 tenant CSS budget | 8,192 |   3,072 |      2,560 |

Tenant CSS files (same on `/` and `/extraction`):

- `25lyr2n1eceye.css` — aftercare base (720 raw)
- `2xee_qhb8ibf4.css` — `patient.module.css` (4,285 raw)

| Metric                             |                         Home `/` |     Guide `/extraction` |
| ---------------------------------- | -------------------------------: | ----------------------: |
| CSS requests                       |                                2 |                       2 |
| CSS raw bytes                      |                            5,005 |                   5,005 |
| CSS gzip -9                        |                            1,529 |                   1,529 |
| CSS Brotli q11                     |                            1,214 |                   1,214 |
| Tailwind on tenant                 |                               no |                      no |
| `--cg-*` in first HTML             |                              yes |                     yes |
| Patient-specific Client Components |                                0 |                       0 |
| Patient-specific client JS chunks  |                                0 |                       0 |
| Logo                               | 381 B `/demo/riverside-mark.svg` |                    same |
| Theme in first HTML                |          `--cg-brand:#0f766e`, … | `--cg-brand:#0f766e`, … |

Budget check: **passed**. The 1E delta versus 1C is overflow-wrap and a generic `.notFound` rule (~127 raw). No dead Phase 1B.5 proof CSS, no Tailwind, no staff styles, no duplicate rule cleanup worth doing.

### JavaScript

Patient routes still download Next.js App Router / Turbopack **framework** runtime. HTML lists several `_next/static/chunks/*.js` files plus one `nomodule` polyfill for legacy browsers. Chromium E2E intercepts found **no** chunks attributable to `app/(aftercare)` or other Care Guide patient Client Components.

| JS (framework runtime, not a product budget) | Home | Guide |
| -------------------------------------------- | ---: | ----: |
| Script tags in HTML (incl. nomodule)         |    7 |     7 |
| Patient-specific Client Component JS         |    0 |     0 |

Do **not** set an aggressive framework-runtime JS budget from this baseline. Next/React/Turbopack own those bytes. The accepted Care Guide baseline remains:

```
Patient-specific Client Components = 0
```

### Logo

`/demo/riverside-mark.svg` is same-origin, 381 bytes, `image/svg+xml`, explicit `width=40` `height=40`, decorative `alt=""`. `Cache-Control: public, max-age=0` with `ETag` is the Next `public/` default; the file is small enough that hashed immutable caching is not required. Keep native `<img>`. Do not switch to `next/image` for this SVG. Raster logo optimization, if needed later, belongs in an asset pipeline.

### Native `<a>` decision

Keep native anchors on the patient surface. Homepage → extraction and extraction → homepage are full document navigations.

Evidence:

- Pages are small (5 KB CSS, no patient Client Components).
- Navigation frequency is low (a patient opens a guide, then may return home).
- `next/link` would introduce client JS and prefetch behaviour for no measured UX gain.
- Keyboard Enter on the Tooth Extraction link already activates the native anchor.
- Browser-native behaviour stays robust without a client router.

Revisit only if a later phase adds authenticated or highly interactive patient UI.

### 404 distinction

- **Security routing 404:** hostname proxy returns an empty 404 for invalid/reserved hosts, direct `/_sites`, and staff paths on a tenant host. Do not brand these.
- **Application tenant 404:** unknown tenant, unknown/draft/disabled guide, or pinned draft revision render `app/(aftercare)/not-found.tsx` (“Not found” / “This aftercare page is not available.”). Generic, practice-neutral copy. Known-tenant layout may still apply CSS variables around that page; visible chrome does not advertise another tenant.

## After Phase 1F (public experience and branding foundation)

Measured 2026-09-06 against `cursor/aftercare-phase-1e-hardening` after the Phase 1F UI/routing work. Production `next start` on port 3001. Next.js 16.3.3.

Ongoing patient CSS budget (unchanged):

|                           |   Raw | gzip -9 | Brotli q11 |
| ------------------------- | ----: | ------: | ---------: |
| Phase 1 tenant CSS budget | 8,192 |   3,072 |      2,560 |

Tenant CSS files (same on `/` and `/extraction`):

- `0864u-a0z2a9f.css` — aftercare base (1,592 raw)
- `1xgy9-pgjfsyz.css` — `patient.module.css` (5,626 raw)

| Metric                             | 1E tenant `/` | 1F tenant `/` | 1F tenant `/extraction` | 1F marketing `/` |
| ---------------------------------- | ------------: | ------------: | ----------------------: | ---------------: |
| CSS files                          |             2 |             2 |                       2 |                2 |
| CSS raw bytes                      |         5,005 |         7,218 |                   7,218 |            6,296 |
| CSS gzip -9                        |         1,529 |         1,883 |                   1,883 |            1,688 |
| CSS Brotli q11                     |         1,214 |         1,567 |                   1,567 |            1,429 |
| Tailwind                           |            no |            no |                      no |               no |
| `--cg-*` in first HTML             |           yes |           yes |                     yes |               no |
| `--cg-radius` / dark media query   |            no |           yes |                     yes |               no |
| Patient-specific Client Components |             0 |             0 |                       0 |  n/a (marketing) |

Budget check (patient): **passed**. The 1F delta is the homepage/guide visual uplift plus radius and dark-scheme tokens. No Tailwind on tenant or marketing. Staff `app.localhost/` still loads Tailwind (27,330 raw / 6,408 gzip / 5,555 Brotli).

Dark/light: tenant tokens are server-emitted on `.aftercareTheme`, with `@media (prefers-color-scheme: dark)` overrides. Brand/accent colours are not inverted. There is **no** patient theme-toggle Client Component.

Marketing CSS is a separate root layout and stays lean (6,296 raw). It uses `next/link` for same-origin anchors only; that is marketing JS, not patient-specific Client Components.

Apex `/login` is a proxy 404. Staff login remains on `app.localhost/login`. Direct `/_marketing` is blocked like `/_sites`.

## After Phase 1F.1 (premium product experience)

Measured 2026-09-06 against `cursor/aftercare-phase-1e-hardening` after the Phase 1F.1 brand, presentation-settings, and theme-control work. Production `next build` (Next.js 16.3.3 / Turbopack).

The Phase 1 tenant CSS ceiling is **unchanged**:

|                           |   Raw | gzip -9 | Brotli q11 |
| ------------------------- | ----: | ------: | ---------: |
| Phase 1 tenant CSS budget | 8,192 |   3,072 |      2,560 |

Richer marketing and tenant design was not an excuse to raise that ceiling. Tenant CSS first exceeded 8,192 because theme-control rules lived in the hashed CSS Module and because the client island imported that module (pulling the class map into JS). The fix:

1. Keep patient chrome in CSS Modules against `--cg-*` tokens.
2. Put the optional theme control on short global classes in `aftercare.css` (`.ptc`, `.patientThemeSlot`).
3. Do **not** import CSS Modules from the theme-control Client Components.

The original 8,192 raw threshold remains reasonable. Do not raise it without a new measured review.

Dark/light no longer uses `@media (prefers-color-scheme: dark)` token overrides. Clinic `themeMode` serializes `html { color-scheme }`; semantic tokens use `light-dark()`. `html[data-theme-mode]` lets an optional patient preference override without a ThemeProvider. Clinic brand/accent colours are still not inverted.

### Tenant CSS (same on `/` and `/extraction`)

- `18kzypcy7h8-t.css` — aftercare base, including `.ptc` (2,913 raw / 924 gzip / 788 Brotli)
- `0d16u7jokxcm_.css` — `patient.module.css` (5,235 raw / 1,268 gzip / 1,039 Brotli)

| Metric                         | 1F tenant | 1F.1 tenant |
| ------------------------------ | --------: | ----------: |
| CSS files                      |         2 |           2 |
| CSS raw                        |     7,218 |   **8,148** |
| CSS gzip -9                    |     1,883 |   **2,192** |
| CSS Brotli q11                 |     1,567 |   **1,827** |
| Tailwind                       |        no |          no |
| `--cg-*` in first HTML         |       yes |         yes |
| Budget (8,192 / 3,072 / 2,560) |      pass |    **pass** |

### Tenant JavaScript

| Surface                                      | Patient-specific Client Components rendered | Theme-control chunk                                      |
| -------------------------------------------- | ------------------------------------------: | -------------------------------------------------------- |
| Riverside (`allowPatientThemeToggle = true`) |                   1 (`PatientThemeControl`) | `1v4h_seuffrwc.js` **1,199 raw / 631 gzip / 510 Brotli** |
| Harbor (`allowPatientThemeToggle = false`)   |                                           0 | Control not rendered; no ThemeProvider                   |

The shared tenant layout lists `patient-theme-control.tsx` in the client-reference manifest because the layout file contains a conditional `import()`. Harbor still must not show the control. Next/React framework runtime is unchanged and is not a product budget.

The accepted patient baseline is now:

```
Patient-specific Client Components rendered = 0 when allowPatientThemeToggle is false
Patient-specific Client Components rendered = 1 when allowPatientThemeToggle is true
```

### Marketing CSS

- `27c0zuqdpwg3t.css` — marketing base, including `.mtc` (2,499 raw / 795 gzip / 676 Brotli)
- `2-nr0h8xmodx-.css` — `marketing.module.css` (7,586 raw / 1,802 gzip / 1,552 Brotli)

| Metric         | 1F marketing | 1F.1 marketing |
| -------------- | -----------: | -------------: |
| CSS files      |            2 |              2 |
| CSS raw        |        6,296 |     **10,085** |
| CSS gzip -9    |        1,688 |      **2,597** |
| CSS Brotli q11 |        1,429 |      **2,228** |
| Tailwind       |           no |             no |

Marketing CSS is allowed to be larger than tenant CSS. It is still far below staff Tailwind (27,330 raw). No marketing CSS-in-JS.

### Marketing JavaScript

Isolated `MarketingThemeControl` Client Component. Production currently emits it in the same client chunk as `next/link`:

- `1sx-e9toe047y.js` — **9,962 raw / 4,047 gzip / 3,528 Brotli** (Link + theme control; not theme-only)

Do not treat that chunk as a theme-toggle budget. Comparable isolated theme-control size is the patient chunk above (~1.2 KB raw). No theme library.

Staff `app.localhost/` still loads Tailwind (`1d4zsgjtjjx9r.css`, 27,330 raw / 6,408 gzip / 5,555 Brotli).

Apex `/login` remains a proxy 404. Staff login remains on `app.localhost/login`.

## After Phase 1F.2 (recovery timeline and compact theme control)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after the Phase 1F.2 polish. Production `next build` (Next.js 16.3.3 / Turbopack).

The 8,192 raw ceiling had 44 bytes of headroom after 1F.1. Compact theme-control CSS replaced the segmented control, but the recovery timeline is real additional CSS. Duplicate timeline title/body rules were removed first. Remaining tenant CSS:

- `3x2sst5om57qc.css` — aftercare base, including compact `.ptc` popover (3,168 raw / 1,024 gzip / 866 Brotli)
- `27tw0ygq7mx2s.css` — `patient.module.css` with timeline (5,855 raw / 1,385 gzip / 1,131 Brotli)

| Metric         |  1F.1 |      1F.2 |    Delta |
| -------------- | ----: | --------: | -------: |
| CSS raw        | 8,148 | **9,023** | **+875** |
| CSS gzip -9    | 2,192 | **2,409** | **+217** |
| CSS Brotli q11 | 1,827 | **1,997** | **+170** |
| Tailwind       |    no |        no |        — |

gzip and Brotli remain under the previous 3,072 / 2,560 ceilings. Raw does not. Proposed tenant CSS budget after this review:

|                               |    Raw | gzip -9 | Brotli q11 |
| ----------------------------- | -----: | ------: | ---------: |
| Previous Phase 1 ceiling      |  8,192 |   3,072 |      2,560 |
| Phase 1F.2 tenant CSS ceiling | 10,240 |   3,072 |      2,560 |

Reason: data-driven recovery timeline (~0.9 KB raw after dedupe) plus a compact native popover. Still far below pre-isolation Tailwind (26,928 raw). Do not treat 10,240 as a target; prefer smaller.

### Tenant JavaScript

| Surface                                      | Patient-specific Client Components rendered | Theme-control chunk                                          |
| -------------------------------------------- | ------------------------------------------: | ------------------------------------------------------------ |
| Riverside (`allowPatientThemeToggle = true`) |                   1 (`PatientThemeControl`) | `3gup781hok6po.js` **2,885 raw / 1,272 gzip / 1,089 Brotli** |
| Harbor (`allowPatientThemeToggle = false`)   |                                           0 | Control not rendered                                         |

1F.1 isolated theme JS was 1,199 raw. The 1F.2 delta is the native popover plus three inline SVG glyphs in the shared `AppearanceMenu`. No theme library.

### Marketing theme JS

Marketing still shares a chunk with `next/link` (`0hq91uq9ps6t6.js`, 11,644 raw / 4,656 gzip / 4,059 Brotli). Do not treat that as theme-only. Comparable isolated size is the patient chunk above.

Marketing CSS (section surfaces + footer): 2,822 + 8,722 = **11,544** raw. Still far below staff Tailwind. No Tailwind on marketing.

## After Phase 1F.3 (visual simplification)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after the Phase 1F.3 document-led pass. Production `next build` (Next.js 16.3.3 / Turbopack).

Simplifying the visual system reduced tenant CSS instead of raising the budget. The 1F.2 10,240 raw review ceiling is no longer needed. Playwright enforces **≤ 9,023 raw** (the 1F.2 measured total). Actual 1F.3 tenant CSS is under 8,500.

Tenant CSS files (same on `/` and `/extraction`):

- `2m5gc51ajgv8t.css` — aftercare base, including compact `.ptc` popover (3,025 raw / 991 gzip / 829 Brotli)
- `1k9ytogdhntg9.css` — `patient.module.css` (5,457 raw / 1,372 gzip / 1,123 Brotli)

| Metric         |  1F.2 |      1F.3 |    Delta |
| -------------- | ----: | --------: | -------: |
| CSS raw        | 9,023 | **8,482** | **−541** |
| CSS gzip -9    | 2,409 | **2,363** |  **−46** |
| CSS Brotli q11 | 1,997 | **1,952** |  **−45** |
| Tailwind       |    no |        no |        — |

Light patient `--cg-surface` is `#ffffff`. Dark patient `--cg-surface` is `#111318`. Clinic `neutralColor` no longer paints the page canvas.

### Marketing CSS

Four chapter surfaces (`marketingBase` / `marketingSoft` / `marketingShowcase` / `marketingClosing`) replaced the 1F.2 band matrix.

- `2-5ujxf8om7f6.css` — marketing base, including `.mtc` (2,949 raw / 946 gzip / 798 Brotli)
- `30txgx-3cr1g_.css` — `marketing.module.css` (8,478 raw / 1,826 gzip / 1,577 Brotli)

| Metric   |   1F.2 |       1F.3 |    Delta |
| -------- | -----: | ---------: | -------: |
| CSS raw  | 11,544 | **11,427** | **−117** |
| Tailwind |     no |         no |        — |

Staff still loads Tailwind. No Tailwind on tenant or marketing.

## After Phase 1F.4 (marketing Motion + patient card/timeline polish)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.4. Production `next build` (Next.js 16.3.3 / Turbopack). Motion **13.2.0** (`motion` / `motion/react` / `motion/react-m`). No direct `framer-motion` import.

### Reduced-motion policy

Marketing bootstrap sets `html[data-mk-motion]=enhance|reduce` from `prefers-reduced-motion` before paint. Pending reveals are hidden with CSS only when `enhance`. A 1.6s `mk-fail-open` animation and a `<noscript>` override keep copy visible if JS never runs. `MotionConfig reducedMotion="user"` plus `initial={false}` when reduced skip entrance motion. Patient pages do not load Motion; the homepage card’s hover transform is CSS-only and disabled under `prefers-reduced-motion`.

### Tenant CSS

Guide-card hover/focus and the recovery-timeline surface added CSS. Aftercare base is unchanged from 1F.3 (`2m5gc51ajgv8t.css`, 3,025 raw / 985 gzip / 829 Brotli). `patient.module.css` grew (`1_n81f590gcs4.css`, 6,513 raw / 1,625 gzip / 1,370 Brotli).

| Metric           |  1F.3 |      1F.4 |      Delta |
| ---------------- | ----: | --------: | ---------: |
| CSS raw          | 8,482 | **9,538** | **+1,056** |
| CSS gzip -9      | 2,363 | **2,610** |   **+247** |
| CSS Brotli q11   | 1,952 | **2,199** |   **+247** |
| Tailwind         |    no |        no |          — |
| Motion on tenant |    no |        no |          — |

gzip and Brotli remain under 3,072 / 2,560. Raw exceeds the 1F.3 ceiling of 9,023. Playwright now enforces **≤ 9,538 raw** (this measured total). Do not treat 9,538 as a target; prefer smaller.

### Tenant JavaScript

Unchanged from 1F.2/1F.3. Riverside still loads `PatientThemeControl` (`3gup781hok6po.js`, **2,885 raw / 1,272 gzip / 1,089 Brotli**). Harbor does not. No Motion chunks on tenant home or `/extraction`.

### Marketing CSS

Chapter wash, fail-open reveal CSS, and the SVG wave added a little over 1 KB.

- `36u94vb-a_vkf.css` — marketing base, including `.mtc` and fail-open (3,495 raw / 1,141 gzip / 970 Brotli)
- `2x9cf5xfkz7rm.css` — `marketing.module.css` (9,208 raw / 1,983 gzip / 1,716 Brotli)

| Metric         |   1F.3 |       1F.4 |      Delta |
| -------------- | -----: | ---------: | ---------: |
| CSS raw        | 11,427 | **12,703** | **+1,276** |
| CSS gzip -9    |  2,772 |  **3,124** |   **+352** |
| CSS Brotli q11 |  2,375 |  **2,686** |   **+311** |
| Tailwind       |     no |         no |          — |

### Marketing JavaScript

1F.3 marketing JS was theme control plus `next/link` (shared chunk ~11.6 KB raw). 1F.4 adds a LazyMotion island (`domAnimation` loaded async). Production Chromium captured three Motion-attributed chunks that tenant does not download:

| Chunk                       | Role                                            |         Raw |    gzip -9 | Brotli q11 |
| --------------------------- | ----------------------------------------------- | ----------: | ---------: | ---------: |
| `2nc761jkoferc.js`          | Marketing experience + theme menu               |      22,702 |      8,670 |      7,727 |
| `01t426ne8zhgx.js`          | Motion runtime (`motion/react-m`, `LazyMotion`) |      39,519 |     13,611 |     12,298 |
| `0xel--zsolmq6.js`          | Async `domAnimation` features                   |      37,896 |     13,973 |     12,677 |
| **Motion-attributed total** |                                                 | **100,117** | **36,254** | **32,702** |

Marketing page JS total (including Next/React runtime shared with tenant): 554,987 raw / 170,489 gzip / 147,944 Brotli. Tenant home: 457,540 raw / 135,309 gzip / 116,157 Brotli. The delta is the Motion island, not a leak onto patient routes.

Staff still loads Tailwind. No Tailwind on tenant or marketing.

## After Phase 1F.5 (hero composition)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.5. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No marketing Client Component added for the hero or wave.

### Marketing CSS

Device-stage HTML/CSS and the light-hero token/wave work grew the marketing stylesheets.

- `0avfdld9pd1em.css` — marketing base, including `.mtc`, fail-open, and wave (3,990 raw / 1,282 gzip / 1,091 Brotli)
- `0-ow7zon09p8z.css` — `marketing.module.css` (12,348 raw / 2,708 gzip / 2,324 Brotli)

| Metric         |   1F.4 |       1F.5 |      Delta |
| -------------- | -----: | ---------: | ---------: |
| CSS raw        | 12,703 | **16,338** | **+3,635** |
| CSS gzip -9    |  3,124 |  **3,990** |   **+866** |
| CSS Brotli q11 |  2,686 |  **3,415** |   **+729** |
| Tailwind       |     no |         no |          — |

Source CSS before this pass: `marketing.css` 3,300 + `marketing.module.css` 8,199 = **11,499**. After: 4,011 + 11,533 = **15,544** (**+4,045**).

### Marketing JavaScript

Hero and wave remain Server Components. Marketing client JS is unchanged from 1F.4 (theme control + existing LazyMotion island). **Hero-attributed client JS added: 0.**

Motion chunks on marketing, unchanged:

| Chunk              | Role                                            |    Raw |
| ------------------ | ----------------------------------------------- | -----: |
| `2nc761jkoferc.js` | Marketing experience + theme menu               | 22,702 |
| `01t426ne8zhgx.js` | Motion runtime (`motion/react-m`, `LazyMotion`) | 39,519 |

No `marketing-product-preview` client chunk.

### Tenant CSS / JS

Unchanged from 1F.4. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.

## After Phase 1F.6 (premium mobile hero)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.6. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No marketing Client Component added for the phone shell or separator.

### Marketing CSS

Removing the desktop mockup offset the larger phone shell and layered SVG separator. Built CSS is slightly smaller than 1F.5.

- `11pjz_niocr-h.css` — marketing base, including `.mtc`, fail-open, and wave (4,172 raw / 1,326 gzip / 1,154 Brotli)
- `3z74oeid3l3yh.css` — `marketing.module.css` (12,085 raw / 2,706 gzip / 2,337 Brotli)

| Metric         |   1F.5 |       1F.6 |   Delta |
| -------------- | -----: | ---------: | ------: |
| CSS raw        | 16,338 | **16,257** | **−81** |
| CSS gzip -9    |  3,990 |  **4,032** | **+42** |
| CSS Brotli q11 |  3,415 |  **3,491** | **+76** |
| Tailwind       |     no |         no |       — |

Source CSS before this pass: `marketing.css` 4,011 + `marketing.module.css` 11,533 = **15,544**. After: 4,051 + 11,461 = **15,512** (**−32**).

### Marketing JavaScript

Phone preview and wave remain Server Components. Marketing client JS is unchanged from 1F.5 (theme control + existing LazyMotion island). **Hero-attributed client JS added: 0.**

Motion chunks on marketing, unchanged:

| Chunk              | Role                                            |    Raw |
| ------------------ | ----------------------------------------------- | -----: |
| `2nc761jkoferc.js` | Marketing experience + theme menu               | 22,702 |
| `01t426ne8zhgx.js` | Motion runtime (`motion/react-m`, `LazyMotion`) | 39,519 |

No `marketing-product-preview` client chunk.

### Tenant CSS / JS

Unchanged from 1F.5. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.

## After Phase 1F.7 (hero spacing and CSS interactions)

Measured 2026-09-07 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.7. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No marketing Client Component added for the phone shell, CTA states, or planned demo video.

### Future product-preview media

The hero phone stays a static Server Component. A later pass may play a short loop **inside** `PhoneScreen`:

- Preferred: WebM + MP4 fallback, `autoplay muted loop playsInline`, poster / static fallback
- Rejected: GIF (larger, worse quality, no playback control)

Do not add the video, a video dependency, or a Client Component until that pass.

### Marketing CSS

Interaction tokens, CTA/nav/theme states, a larger phone shell, and hero spacing grew the marketing stylesheets.

- `00m6kwx3do-7f.css` — marketing base, including `.mtc` and `--mk-interact-duration` (5,295 raw / 1,497 gzip / 1,328 Brotli)
- `3wlgpaj9etdp8.css` — `marketing.module.css` (15,076 raw / 3,171 gzip / 2,743 Brotli)

| Metric         |   1F.6 |       1F.7 |      Delta |
| -------------- | -----: | ---------: | ---------: |
| CSS raw        | 16,257 | **20,371** | **+4,114** |
| CSS gzip -9    |  4,032 |  **4,668** |   **+636** |
| CSS Brotli q11 |  3,491 |  **4,071** |   **+580** |
| Tailwind       |     no |         no |          — |

Source CSS before this pass: `marketing.css` 4,051 + `marketing.module.css` 11,461 = **15,512**. After: 5,319 + 14,579 = **19,898** (**+4,386**).

### Marketing JavaScript

Phone preview, wave, and CTA states remain Server Components / CSS. Marketing client JS is unchanged from 1F.6 (theme control + existing LazyMotion island). **Hero-attributed client JS added: 0.**

Motion chunks on marketing, unchanged:

| Chunk              | Role                                            |    Raw |
| ------------------ | ----------------------------------------------- | -----: |
| `2nc761jkoferc.js` | Marketing experience + theme menu               | 22,702 |
| `01t426ne8zhgx.js` | Motion runtime (`motion/react-m`, `LazyMotion`) | 39,519 |

No `marketing-product-preview` client chunk.

### Tenant CSS / JS

Unchanged from 1F.6. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.

## After Phase 1F.8 (real iPhone frame and hero atmosphere)

Measured 2026-09-08 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.8. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No marketing Client Component added for the device frame or atmosphere.

### Device asset

`public/marketing/iphone-frame.webp` — punched-screen hardware overlay from the Rivers Digital Catión Sanity mockup (`cationBlue.png`, 1450×2936 PNG, 456,339 bytes). Optimized to 800×1620 WebP with alpha.

| Form            |   Bytes |
| --------------- | ------: |
| Source PNG      | 456,339 |
| WebP raw        |  19,492 |
| WebP gzip -9    |  17,748 |
| WebP Brotli q11 |  17,672 |

Native `<img width="800" height="1620" fetchPriority="low">`. Not preloaded. Decorative (`alt=""`, ancestor `aria-hidden`). H1 remains the intended LCP text.

### Marketing CSS

Removing the CSS bezel/island/glass system offset the new atmosphere layers. Built CSS is essentially unchanged from 1F.7.

- `3vf215wy71yja.css` — marketing base, including `.mtc` and atmosphere tokens (5,369 raw / 1,529 gzip / 1,354 Brotli)
- `2gc2lszibarnp.css` — `marketing.module.css` (14,969 raw / 3,192 gzip / 2,752 Brotli)

| Metric         |   1F.7 |       1F.8 |       Delta |
| -------------- | -----: | ---------: | ----------: |
| CSS raw        | 20,371 | **20,338** |     **−33** |
| CSS gzip -9    |  4,668 |  **4,721** |     **+53** |
| CSS Brotli q11 |  4,071 |  **4,106** |     **+35** |
| Tailwind       |     no |         no |           — |
| Phone asset    |      0 | **19,492** | **+19,492** |

Source CSS before this pass: `marketing.css` 5,319 + `marketing.module.css` 14,579 = **19,898**. After: 5,450 + 14,361 = **19,811** (**−87**).

### Marketing JavaScript

Phone preview, wave, atmosphere, and CTA states remain Server Components / CSS. Marketing client JS is unchanged from 1F.7 (theme control + existing LazyMotion island). **Hero-attributed client JS added: 0.** Native `<img>` is used instead of `next/image` so the frame does not introduce a Client Component.

No `marketing-product-preview` client chunk.

### Tenant CSS / JS

Unchanged from 1F.7. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.

## After Phase 1F.9 (mobile preview and responsive rhythm)

Measured 2026-09-08 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.9. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No marketing Client Component added for mobile nav, section tokens, or phone-screen content.

### Marketing CSS

Richer phone-screen hierarchy, mobile nav hide rules, and spacing tokens grew the marketing stylesheets.

- `2_6c602dehogx.css` — marketing base, including `.mtc` 44px trigger and `--mk-section-pad-y` (5,454 raw / 1,571 gzip / 1,389 Brotli)
- `355uh364b7iq8.css` — `marketing.module.css` (17,150 raw / 3,587 gzip / 3,088 Brotli)

| Metric         |   1F.8 |       1F.9 |      Delta |
| -------------- | -----: | ---------: | ---------: |
| CSS raw        | 20,338 | **22,604** | **+2,266** |
| CSS gzip -9    |  4,721 |  **5,158** |   **+437** |
| CSS Brotli q11 |  4,106 |  **4,477** |   **+371** |
| Tailwind       |     no |         no |          — |
| Phone asset    | 19,492 | **19,492** |      **0** |

Source CSS before this pass: `marketing.css` 5,450 + `marketing.module.css` 14,361 = **19,811**. After: 5,543 + 16,394 = **21,937** (**+2,126**).

### Marketing JavaScript

Phone preview and mobile nav remain Server Components / CSS. Marketing client JS is unchanged from 1F.8 (theme control + existing LazyMotion island). **Hero-attributed client JS added: 0.** Chunk hashes unchanged:

| Chunk              | Role                                            |    Raw |
| ------------------ | ----------------------------------------------- | -----: |
| `2nc761jkoferc.js` | Marketing experience + theme menu               | 22,702 |
| `01t426ne8zhgx.js` | Motion runtime (`motion/react-m`, `LazyMotion`) | 39,519 |

No `marketing-product-preview` client chunk.

### Tenant CSS / JS

Unchanged from 1F.8. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.

## After Phase 1F.10 (process rail, feature bento, theme popover)

Measured 2026-09-08 against `cursor/aftercare-phase-1e-hardening` after Phase 1F.10. Production `next start` on port 4173. Next.js 16.3.3 / Turbopack. No new dependency. No Motion change. No new marketing Client Component.

### Marketing CSS

Process rail, step/bento card surfaces, and product-native micro-visuals grew the marketing stylesheets. Shared `--mk-card*` / `--mk-rail*` tokens keep the new surfaces from becoming six bespoke card implementations.

- `0iro1ii8bt4zl.css` — marketing base, including restored `.mtc` popover (6,880 raw / 1,903 gzip / 1,704 Brotli)
- `0um3lkhos3n5j.css` — `marketing.module.css` (25,522 raw / 4,960 gzip / 4,317 Brotli)

| Metric         |   1F.9 |      1F.10 |      Delta |
| -------------- | -----: | ---------: | ---------: |
| CSS raw        | 22,604 | **32,402** | **+9,798** |
| CSS gzip -9    |  5,158 |  **6,863** | **+1,705** |
| CSS Brotli q11 |  4,477 |  **6,021** | **+1,544** |
| Tailwind       |     no |         no |          — |

Source CSS before this pass: `marketing.css` 5,543 + `marketing.module.css` 16,394 = **21,937**. After: 7,082 + 24,228 = **31,310** (**+9,373**).

### Marketing JavaScript

Process and bento remain Server Components. Theme popover still uses the existing `AppearanceMenu` client boundary (icons + checkmark markup only). **New marketing client JS added: 0.** Motion chunk hash unchanged:

| Chunk              | Role                                            |    Raw |
| ------------------ | ----------------------------------------------- | -----: |
| `3uq-mei83ku8e.js` | Marketing experience + theme menu               | 23,381 |
| `01t426ne8zhgx.js` | Motion runtime (`motion/react-m`, `LazyMotion`) | 39,519 |

Theme-menu chunk delta vs 1F.9 (`22,702`): **+679** from inline SVG option glyphs. No `marketing-process` or `marketing-bento` client chunk.

### Tenant CSS / JS

Unchanged from 1F.9. Tenant CSS files remain `2m5gc51ajgv8t.css` (3,025 raw) and `1_n81f590gcs4.css` (6,513 raw), **9,538** raw total. Playwright still enforces ≤ 9,538. No Motion on tenant. Staff still loads Tailwind.
