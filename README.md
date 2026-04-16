This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Workflow

This project uses Postgres with Prisma for application data.

Issue #2 replaces the temporary Prisma bootstrap model with the first real
clinic-scoped staff schema:

- `Clinic`
- `User`
- `ClinicMembership`
- `Account`
- `Session`
- `VerificationToken`

The Auth.js adapter models now use the canonical Prisma names for low-risk
adapter compatibility. To keep future product concepts unambiguous, any later
workflow/session domain model should use an explicit name such as
`ProcedureSession`, rather than reusing a generic `Session` name.

### Local Postgres

If you have Docker available, start the local database with:

```bash
docker compose up -d
```

Stop it with:

```bash
docker compose down
```

The expected local connection string for this repo is:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/care_guide?schema=public"
```

The app runtime also expects:

```bash
AUTH_SECRET="replace-with-a-long-random-string"
```

1. Copy `.env.example` to `.env`. Next.js loads `.env` for the app runtime, and Prisma CLI commands load it through `prisma.config.ts`.
2. Start Postgres with `docker compose up -d`.
3. Prisma CLI commands read the connection string from `prisma.config.ts`, which loads `.env` via `dotenv`.
4. Generate the Prisma client with `pnpm db:generate`.
5. Validate or format the schema with `pnpm db:validate` and `pnpm db:format`.
6. Create local migrations with `pnpm db:migrate:dev` once the database is healthy.
7. Open Prisma Studio with `pnpm db:studio`.
8. Seed the demo clinic and staff accounts with `pnpm db:seed`.

If `AUTH_SECRET` is missing, the app now fails fast with a clear startup error instead of surfacing repeated Auth.js `MissingSecret` errors later during requests.

### Seeded demo accounts

The seed creates one clinic plus two clinic-scoped staff users:

- Clinic: `Rivers Care Demo Clinic`
- Admin: `admin@care-guide.test`
- Staff: `staff@care-guide.test`
- Shared demo password: `CareGuideDemo123!`

### Issue #3 constraints

Issue #3 auth wiring should build on this schema without expanding into broader
product models:

- Treat clinic access as membership-derived, not as a single clinic field on `User`.
- Keep Auth.js on the canonical `Account`, `Session`, and `VerificationToken`
  Prisma models.
- Reserve explicit names such as `ProcedureSession` for later workflow/domain
  tables instead of introducing another generic `Session` concept.
- Keep the server auth surface minimal and internal-tool oriented.
- Do not add password reset, invites, OAuth providers, account settings, or
  extra auth UI in Issue #3.
- Do not build protected route behavior or dashboard shell behavior yet.

### Issue #3 auth server wiring

Issue #3 adds a server-first Auth.js setup with:

- `auth.ts` as the root Auth.js configuration
- `@auth/prisma-adapter` against the canonical Prisma models
- database-backed sessions
- a minimal internal credentials sign-in handler for seeded staff accounts
- reusable server helpers for the current signed-in user and clinic membership
  context

### Exercising auth before login UI exists

Before Issue #4 adds `/login`, auth is intended to be exercised through the
minimal auth API surface:

1. Start the app with `pnpm dev`.
2. `POST` JSON credentials to `/api/auth/login`.
3. Reuse the returned cookie when calling `/api/auth/me` or `/api/auth/session`.
4. `POST` to `/api/auth/logout` to clear the session and cookie.

Example login request:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@care-guide.test","password":"CareGuideDemo123!"}'
```

This keeps Issue #3 internal-tool oriented and avoids shipping a custom login
page before Issue `#4`.

Issue `#4` should consume this existing contract rather than replace it: the
MVP auth flow currently uses custom `/api/auth/login` and `/api/auth/logout`
endpoints layered on top of Auth.js database sessions and shared server-side
auth helpers.

### Issue #4 login page

Issue #4 adds a minimal `/login` page that validates email and password with
Zod, posts credentials to `/api/auth/login`, shows concise failure states, and
redirects successful sign-ins to `/dashboard`.

The `/dashboard` route is intentionally only a very small temporary landing page
for the redirect flow. Protected dashboard behavior and signed-out route gating
remain deferred to Issue `#5`.

### Issue #5 protected dashboard shell

Issue #5 adds the first durable protected-route pattern for internal staff
pages:

- `app/dashboard/layout.tsx` is the protected shell for `/dashboard`
- `lib/auth/require-staff-session.ts` is the intentionally tiny server-side
  guard helper
- only users with one effective clinic membership can establish a valid staff
  session for the protected shell
- signed-out visits to `/dashboard` redirect to `/login`
- signed-in visits to `/login` redirect to `/dashboard`
- the shell exposes only minimal signed-in chrome plus logout

This guard should stay narrow for now. Later internal staff routes should reuse
the same server-side shell and helper pattern rather than introducing a second
auth abstraction or route-protection mechanism.

### Issue #6 procedure template schema

Issue #6 introduces clinic-owned procedure template content as durable Prisma
models, without any UI surface:

- `ProcedureTemplate` is owned by a `Clinic` via `clinicId`, has a `name`,
  a clinic-unique `slug`, and an `isActive` flag.
- `ProcedureStageTemplate` models linear stages via an explicit `stageOrder`
  that is unique within a template. Stage content uses a durable `title`
  plus three mode-specific copy fields: `calmCopy`, `patientCopy`, and
  `detailedCopy`. Optional fields are `illustrationUrl` (string/URL only)
  and `defaultDurationHint`.
- `ProcedureTemplateSelectedAreaOption` models a constrained, template-owned
  selected-area list via stable `key`, display `label`, and explicit
  `sortOrder`. It replaces any free-text selected-area concept for v1.

Later issues should continue these conventions:

- Template queries must filter by the signed-in user's effective clinic
  membership from `getAuthContext()` / `requireStaffSession()`.
- Default selection surfaces should filter to `isActive = true`.
- Read-only display must respect explicit `stageOrder` and selected-area
  `sortOrder`, not creation order.
- If shared starter templates are ever needed, add a separate
  platform/global-template concept rather than making `ProcedureTemplate`
  globally owned.
- Seed data lives in [prisma/seed.mjs](prisma/seed.mjs); the demo clinic owns
  a minimal `Starter Procedure Walkthrough` template so Issue #7 can build a
  read-only browser on top of real data.

### Issue #7 procedure template browser

Issue #7 adds a read-only, clinic-scoped inspection view on top of the Issue #6
schema:

- Route: `/dashboard/procedures`, nested inside the existing protected shell in
  `app/dashboard/layout.tsx` so the same `requireStaffSession()` guard applies.
- The page is intentionally read-only. It has no create/edit/delete/publish
  controls, no session creation, and no patient-facing surface.
- Clinic scoping is derived from the signed-in user's effective clinic
  membership — never from URL params or session payload.
- Default filters: only `ProcedureTemplate.isActive = true` templates are
  listed, and only `ProcedureTemplateSelectedAreaOption.isActive = true`
  options are rendered per template.
- Ordering contract (explicit, never creation order):
  - Stages render by `ProcedureStageTemplate.stageOrder` ascending.
  - Selected-area options render by
    `ProcedureTemplateSelectedAreaOption.sortOrder` ascending.
- Query helper: [lib/procedures/list-clinic-templates.ts](lib/procedures/list-clinic-templates.ts)
  exposes a single narrow read-model function,
  `listActiveClinicProcedureTemplates(clinicId)`, with a typed return shape.
  It is not a generalized template repository.
- Dashboard discovery: a single inline link on `/dashboard` points to the new
  route. No global navigation, sidebar, or breadcrumbs are introduced.

Constraints Issue `#8` (and later work) should respect:

- Do not repurpose `/dashboard/procedures` for session creation; session
  lifecycle routes belong under `/sessions/*` per the plan.
- Do not surface inactive or cross-clinic templates on this route. If admin
  CRUD lands later, add a separate `/admin/*` surface with its own protected
  shell rather than widening this view.
- Continue deriving clinic context from `requireStaffSession()`; do not add
  a `clinicId` URL param or stash it on the session payload.
- Keep `lib/procedures/list-clinic-templates.ts` narrow. Session creation
  pickers and admin CRUD should get their own sibling helpers (e.g. one
  per call site) instead of extending this one into a multi-purpose API.
- Do not re-implement auth redirect logic inside individual dashboard pages;
  the layout-level guard is the single source of truth for protected access.

### Clinic membership contract for MVP

Clinic context remains database-derived through `ClinicMembership` rather than
stored in the session payload.

For MVP, the auth helper layer assumes one effective clinic membership per
signed-in staff user. If multiple memberships exist for the same user, helper
resolution fails explicitly instead of silently choosing one. Issue `#4` must
respect this contract and should not introduce any implicit clinic selection.
Issue `#6` and later internal work should continue building on the same
membership-derived server-side guard pattern instead of redesigning auth.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
