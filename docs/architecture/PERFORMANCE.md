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
